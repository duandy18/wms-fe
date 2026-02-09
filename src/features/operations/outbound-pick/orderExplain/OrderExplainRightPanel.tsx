// src/features/operations/outbound-pick/orderExplain/OrderExplainRightPanel.tsx

import React, { useMemo } from "react";
import type { OrderSummary } from "../../../orders/api";
import { useOrderExplain } from "./useOrderExplain";
import type { OrderExplainCardInput, PlatformOrderReplayOut } from "./types";

type Props = {
  summary: OrderSummary | null;
};

type ExpandedItem = {
  item_id: number;
  need_qty: number;
};

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function toInt(x: unknown): number | null {
  if (typeof x === "number" && Number.isFinite(x)) return Math.trunc(x);
  if (typeof x === "string" && x.trim() !== "" && Number.isFinite(Number(x))) return Math.trunc(Number(x));
  return null;
}

function pickExpandedItems(resolvedRow: Record<string, unknown>): ExpandedItem[] {
  const raw = resolvedRow["expanded_items"];
  if (!Array.isArray(raw)) return [];
  const out: ExpandedItem[] = [];
  for (const it of raw) {
    if (!isRecord(it)) continue;
    const itemId = toInt(it["item_id"]);
    const needQty = toInt(it["need_qty"]);
    if (itemId == null || needQty == null) continue;
    out.push({ item_id: itemId, need_qty: needQty });
  }
  return out;
}

function buildPickList(data: PlatformOrderReplayOut): Array<{ item_id: number; need_qty: number }> {
  const m = new Map<number, number>();

  const resolved = data.resolved;
  if (Array.isArray(resolved)) {
    for (const row of resolved) {
      if (!isRecord(row)) continue;
      const xs = pickExpandedItems(row);
      for (const x of xs) {
        m.set(x.item_id, (m.get(x.item_id) ?? 0) + x.need_qty);
      }
    }
  }

  return [...m.entries()]
    .map(([item_id, need_qty]) => ({ item_id, need_qty }))
    .sort((a, b) => a.item_id - b.item_id);
}

function blockedHumanHint(reasons: string[] | null | undefined): string {
  const rs = reasons ?? [];
  if (rs.includes("PROVINCE_MISSING_OR_INVALID")) return "地址缺少/无效省份：无法做履约路由（暂不可拣货）。";
  if (rs.length) return `存在履约阻塞原因：${rs.join(" / ")}`;
  return "—";
}

export const OrderExplainRightPanel: React.FC<Props> = ({ summary }) => {
  const input = useMemo<OrderExplainCardInput | null>(() => {
    if (!summary) return null;
    return {
      orderId: summary.id,
      platform: summary.platform,
      shop_id: summary.shop_id,
      ext_order_no: summary.ext_order_no,
      store_id: summary.store_id ?? null,
    };
  }, [summary]);

  const { state, reload } = useOrderExplain(input);

  const header = useMemo(() => {
    if (!summary) return "解析结果（作业视角）";
    const shop = summary.shop_id ? `shop: ${summary.shop_id}` : "";
    const store = summary.store_id != null ? `store_id: ${summary.store_id}` : "store_id: —";
    return `解析结果（作业视角） · ${summary.ext_order_no} · ${shop} · ${store}`;
  }, [summary]);

  if (!summary) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold text-slate-800">解析结果（作业视角）</div>
        <div className="mt-2 text-[11px] text-slate-500">请选择左侧订单以查看解析结果。</div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-slate-800">{header}</div>
          <div className="mt-1 text-[11px] text-slate-500">这张卡只呈现“用户看得懂、能执行”的结论；技术字段默认收起。</div>
        </div>
        <button
          type="button"
          onClick={() => void reload()}
          className="text-[11px] px-2 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
          disabled={state.kind === "loading"}
        >
          {state.kind === "loading" ? "刷新中…" : "刷新"}
        </button>
      </div>

      {state.kind === "missing_key" ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <div className="font-semibold">暂无法解析</div>
          <div className="mt-1">{state.reason}</div>
          <div className="mt-2 text-[11px] text-amber-700">
            当前订单缺少 <span className="font-mono">store_id</span>（内部店铺 ID），无法重放。请改选带 store_id 的订单，或先通过平台订单 ingest
            纳入治理后再重放。
          </div>
        </div>
      ) : null}

      {state.kind === "error" ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <div className="font-semibold">解析失败</div>
          <div className="mt-1">{state.message}</div>
        </div>
      ) : null}

      {state.kind === "loading" ? <div className="text-xs text-slate-500">解析中…</div> : null}

      {state.kind === "ready" ? <ExplainContent data={state.data} /> : null}

      {state.kind === "idle" ? <div className="text-xs text-slate-500">尚未解析。</div> : null}
    </section>
  );
};

const ExplainContent: React.FC<{ data: PlatformOrderReplayOut }> = ({ data }) => {
  const isResolved = data.status !== "UNRESOLVED" && data.status !== "NOT_FOUND";
  const isBlocked = (data.fulfillment_status ?? "") === "FULFILLMENT_BLOCKED";

  const pickList = useMemo(() => buildPickList(data), [data]);

  return (
    <div className="space-y-3">
      {/* 地址 / 履约 */}
      <div
        className={
          "rounded-lg border p-3 text-xs " +
          (isBlocked ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800")
        }
      >
        <div className="font-semibold">地址与履约前置</div>
        <div className="mt-1">
          <span className="text-slate-600">履约状态：</span>
          <span className="font-mono">{data.fulfillment_status ?? "—"}</span>
        </div>
        <div className="mt-1">
          <span className="text-slate-600">提示：</span>
          <span>{blockedHumanHint(data.blocked_reasons)}</span>
        </div>
      </div>

      {/* 解析后的拣货清单 */}
      <div
        className={
          "rounded-lg border p-3 text-xs " +
          (!isResolved ? "border-amber-200 bg-amber-50 text-amber-800" : "border-slate-200 bg-white text-slate-700")
        }
      >
        <div className="flex items-center justify-between">
          <div className="font-semibold">解析后的拣货清单</div>
          <div className="text-[11px] text-slate-500">{isResolved ? "已生成" : "未完成解析（需治理）"}</div>
        </div>

        {!isResolved ? (
          <div className="mt-2">
            <div className="text-[11px]">存在未解析行（unresolved），无法形成可执行的拣货清单。请先按提示治理（发布 FSKU / 修正组件）。</div>
          </div>
        ) : pickList.length === 0 ? (
          <div className="mt-2 text-[11px] text-slate-500">未能生成 item 级拣货清单。</div>
        ) : (
          <div className="mt-2 overflow-auto rounded border border-slate-200">
            <table className="min-w-full border-collapse text-xs">
              <thead className="bg-slate-50">
                <tr className="text-[11px] text-slate-600">
                  <th className="px-3 py-2 text-left">item_id</th>
                  <th className="px-3 py-2 text-right">应拣数量</th>
                </tr>
              </thead>
              <tbody>
                {pickList.map((x) => (
                  <tr key={x.item_id} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-mono">{x.item_id}</td>
                    <td className="px-3 py-2 text-right font-mono">{x.need_qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 技术详情：默认收起 */}
      <details className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
        <summary className="cursor-pointer select-none text-[11px] text-slate-600">技术详情（排障用，默认收起）</summary>
        <div className="mt-2 space-y-1">
          <div>
            <span className="text-slate-500">status：</span>
            <span className="font-mono">{data.status}</span>
          </div>
          <div>
            <span className="text-slate-500">facts_n：</span>
            <span className="font-mono">{data.facts_n}</span>
          </div>
          <div>
            <span className="text-slate-500">resolved/unresolved：</span>
            <span className="font-mono">
              {Array.isArray(data.resolved) ? data.resolved.length : 0}/{data.unresolved?.length ?? 0}
            </span>
          </div>
          {data.unresolved?.length ? (
            <div className="mt-2">
              <div className="text-slate-500">unresolved（原始）：</div>
              <pre className="mt-1 whitespace-pre-wrap text-[11px] text-slate-700">{JSON.stringify(data.unresolved, null, 2)}</pre>
            </div>
          ) : null}
        </div>
      </details>
    </div>
  );
};
