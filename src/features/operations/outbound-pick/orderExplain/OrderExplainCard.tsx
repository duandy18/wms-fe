// src/features/operations/outbound-pick/orderExplain/OrderExplainCard.tsx

import React, { useMemo } from "react";
import type { OrderExplainCardInput, OrderResolveUnresolved, PlatformOrderReplayOut } from "./types";
import { useOrderExplain } from "./useOrderExplain";

// 这里不引入新的 UI 体系；你项目里如果有 UI 组件库（Card/Tag/Button/Alert），
// 你贴出捡货页文件后我会按你现有 UI 体系替换。
// 现在先用最朴素的结构，保证语义正确、字段驱动。
export const OrderExplainCard: React.FC<{
  input: OrderExplainCardInput | null;
  onGoBindPsku?: (ctx: { platform?: string; store_id?: number | null; platform_sku_id?: string | null }) => void;
  onGoFsku?: (ctx: { fsku_id?: number | null }) => void;
  onGoFixAddress?: (ctx: { order_id?: number; platform?: string; shop_id?: string; ext_order_no?: string }) => void;
}> = ({ input, onGoBindPsku, onGoFsku, onGoFixAddress }) => {
  const { state, reload } = useOrderExplain(input);

  const title = useMemo(() => {
    if (!input) return "订单解析";
    const parts: string[] = [];
    if (input.ext_order_no) parts.push(`外部单号：${input.ext_order_no}`);
    if (input.shop_id) parts.push(`shop：${input.shop_id}`);
    if (input.store_id) parts.push(`store_id：${input.store_id}`);
    return parts.length ? `订单解析（${parts.join(" / ")}）` : "订单解析";
  }, [input]);

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontWeight: 700 }}>{title}</div>
        <button type="button" onClick={() => void reload()} style={{ padding: "6px 10px" }}>
          重放解码
        </button>
      </div>

      <div style={{ marginTop: 10, fontSize: 13, color: "#374151" }}>
        {state.kind === "idle" && <div>请选择一条订单。</div>}

        {state.kind === "missing_key" && (
          <div>
            <div style={{ color: "#b45309", fontWeight: 600 }}>无法重放</div>
            <div>{state.reason}</div>
            <div style={{ marginTop: 6, color: "#6b7280" }}>
              提示：当前订单缺少 <span style={{ fontFamily: "monospace" }}>store_id</span>（内部店铺 ID），无法重放。请改选带 store_id 的订单，或先通过平台订单
              ingest 纳入治理后再重放。
            </div>
          </div>
        )}

        {state.kind === "loading" && <div>解析中…</div>}

        {state.kind === "error" && (
          <div>
            <div style={{ color: "#b91c1c", fontWeight: 600 }}>解析失败</div>
            <div>{state.message}</div>
          </div>
        )}

        {state.kind === "ready" && (
          <ExplainBody data={state.data} input={input} onGoBindPsku={onGoBindPsku} onGoFsku={onGoFsku} onGoFixAddress={onGoFixAddress} />
        )}
      </div>
    </div>
  );
};

const ExplainBody: React.FC<{
  data: PlatformOrderReplayOut;
  input: OrderExplainCardInput | null;
  onGoBindPsku?: (ctx: { platform?: string; store_id?: number | null; platform_sku_id?: string | null }) => void;
  onGoFsku?: (ctx: { fsku_id?: number | null }) => void;
  onGoFixAddress?: (ctx: { order_id?: number; platform?: string; shop_id?: string; ext_order_no?: string }) => void;
}> = ({ data, input, onGoBindPsku, onGoFsku, onGoFixAddress }) => {
  const isResolved = data.status !== "UNRESOLVED" && data.status !== "NOT_FOUND";
  const isBlocked = (data.fulfillment_status || "") === "FULFILLMENT_BLOCKED";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* 三问：1) 解析是否正确 */}
      <Section
        title="1) 是否已被系统正确解析？"
        tone={isResolved ? "ok" : "warn"}
        lines={[`status = ${data.status}`, `facts_n = ${data.facts_n}`, `resolved = ${data.resolved?.length ?? 0}`, `unresolved = ${data.unresolved?.length ?? 0}`]}
      >
        {!isResolved && (
          <UnresolvedList items={data.unresolved} onGoBindPsku={onGoBindPsku} onGoFsku={onGoFsku} platform={data.platform} store_id={data.store_id} />
        )}
      </Section>

      {/* 三问：2) 是否满足拣货前置条件 */}
      <Section
        title="2) 是否满足履约/拣货前置条件？"
        tone={!isBlocked ? "ok" : "bad"}
        lines={[`fulfillment_status = ${data.fulfillment_status ?? "—"}`, `blocked_reasons = ${data.blocked_reasons ? data.blocked_reasons.join(" / ") : "—"}`]}
      >
        {isBlocked && (
          <div style={{ marginTop: 6 }}>
            <button
              type="button"
              onClick={() =>
                onGoFixAddress?.({
                  order_id: input?.orderId,
                  platform: input?.platform,
                  shop_id: input?.shop_id,
                  ext_order_no: input?.ext_order_no,
                })
              }
              style={{ padding: "6px 10px" }}
            >
              去治理（补录/配置）
            </button>
          </div>
        )}
      </Section>

      {/* 三问：3) 下一步 */}
      <Section
        title="3) 如果不能，明确原因与下一步治理入口"
        tone={!isResolved || isBlocked ? "warn" : "ok"}
        lines={[
          !isResolved ? "原因：存在 unresolved（需治理 PSKU/FSKU）" : "解析：OK",
          isBlocked ? "原因：FULFILLMENT_BLOCKED（需治理履约前置条件）" : "履约：未阻塞/可继续",
        ]}
      />
    </div>
  );
};

const Section: React.FC<{
  title: string;
  tone: "ok" | "warn" | "bad";
  lines: string[];
  children?: React.ReactNode;
}> = ({ title, tone, lines, children }) => {
  const color = tone === "ok" ? "#065f46" : tone === "warn" ? "#92400e" : "#991b1b";
  const bg = tone === "ok" ? "#ecfdf5" : tone === "warn" ? "#fffbeb" : "#fef2f2";

  return (
    <div style={{ borderRadius: 10, padding: 10, background: bg }}>
      <div style={{ fontWeight: 700, color }}>{title}</div>
      <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
        {lines.map((x) => (
          <li key={x} style={{ marginTop: 2 }}>
            {x}
          </li>
        ))}
      </ul>
      {children}
    </div>
  );
};

const UnresolvedList: React.FC<{
  items: OrderResolveUnresolved[];
  platform: string;
  store_id: number;
  onGoBindPsku?: (ctx: { platform?: string; store_id?: number | null; platform_sku_id?: string | null }) => void;
  onGoFsku?: (ctx: { fsku_id?: number | null }) => void;
}> = ({ items, platform, store_id, onGoBindPsku, onGoFsku }) => {
  if (!items.length) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>未解析明细（unresolved）</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((u, idx) => (
          <div key={`${u.reason}-${idx}`} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 8 }}>
            <div style={{ fontWeight: 700 }}>{u.reason}</div>
            {u.hint ? <div style={{ color: "#374151", marginTop: 4 }}>{u.hint}</div> : null}
            <div style={{ color: "#6b7280", marginTop: 4, fontSize: 12 }}>
              {u.platform_sku_id ? `PSKU=${u.platform_sku_id}` : null}
              {u.qty != null ? `  qty=${u.qty}` : null}
              {u.fsku_id != null ? `  fsku_id=${u.fsku_id}` : null}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
              {u.reason === "MISSING_BINDING" && (
                <button type="button" onClick={() => onGoBindPsku?.({ platform, store_id, platform_sku_id: u.platform_sku_id ?? null })} style={{ padding: "6px 10px" }}>
                  去绑定 PSKU
                </button>
              )}

              {(u.reason === "FSKU_NO_COMPONENTS_OR_NOT_PUBLISHED" || u.reason === "COMPONENT_QTY_INVALID") && (
                <button type="button" onClick={() => onGoFsku?.({ fsku_id: u.fsku_id ?? null })} style={{ padding: "6px 10px" }}>
                  去治理 FSKU
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
