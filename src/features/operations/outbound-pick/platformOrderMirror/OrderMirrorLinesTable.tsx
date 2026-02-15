// src/features/operations/outbound-pick/platformOrderMirror/OrderMirrorLinesTable.tsx
import React, { useMemo } from "react";
import type { OrderView } from "../../../orders/api";
import type { PlatformOrderReplayOut } from "../orderExplain/types";

type ExplainLite =
  | { kind: "idle" }
  | { kind: "missing_key"; reason: string }
  | { kind: "loading" }
  | { kind: "ready"; data: PlatformOrderReplayOut }
  | { kind: "error"; message: string };

type Line = {
  sku: string;
  title: string;
  spec: string;
  qty: number;
  price: string;
  amount: string;
};

function safeText(v: string | null | undefined): string {
  const s = v == null ? "" : String(v);
  return s.trim() ? s.trim() : "—";
}

function safeNum(v: number | null | undefined): number {
  if (v == null) return 0;
  return Number.isFinite(v) ? v : 0;
}

function safeMoney(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return String(v);
}

function normalizeLines(order: OrderView["order"] | null): Line[] {
  const items = order?.items ?? [];
  return items.map((it) => ({
    sku: safeText(it.sku ?? "—"),
    title: safeText(it.title ?? "—"),
    spec: safeText(it.spec ?? "—"),
    qty: safeNum(it.qty),
    price: safeMoney(it.price ?? null),
    amount: safeMoney(it.amount ?? null),
  }));
}

function toInt(x: unknown): number | null {
  if (typeof x === "number" && Number.isFinite(x)) return Math.trunc(x);
  if (typeof x === "string" && x.trim() !== "" && Number.isFinite(Number(x))) return Math.trunc(Number(x));
  return null;
}

function buildPickListFromExplain(
  data: PlatformOrderReplayOut,
): Array<{ item_id: number; need_qty: number }> {
  const m = new Map<number, number>();

  const resolved = data.resolved;
  if (Array.isArray(resolved)) {
    for (const row of resolved) {
      if (!row || typeof row !== "object") continue;
      const rec = row as Record<string, unknown>;
      const raw = rec["expanded_items"];
      if (!Array.isArray(raw)) continue;

      for (const it of raw) {
        if (!it || typeof it !== "object") continue;
        const r = it as Record<string, unknown>;
        const itemId = toInt(r["item_id"]);
        const needQty = toInt(r["need_qty"]);
        if (itemId == null || needQty == null) continue;
        m.set(itemId, (m.get(itemId) ?? 0) + needQty);
      }
    }
  }

  return [...m.entries()]
    .map(([item_id, need_qty]) => ({ item_id, need_qty }))
    .sort((a, b) => a.item_id - b.item_id);
}

export const OrderMirrorLinesTable: React.FC<{
  detailOrder: OrderView["order"] | null;
  loading: boolean;

  // ✅ 解析结果注入：降级为“可选展开”
  explain: ExplainLite;
  onReloadExplain?: () => void;
}> = ({ detailOrder, loading, explain, onReloadExplain }) => {
  const lines = useMemo(() => normalizeLines(detailOrder), [detailOrder]);

  const explainData = explain.kind === "ready" ? explain.data : null;
  const unresolvedN = explainData?.unresolved?.length ?? 0;
  const status = explainData?.status ?? null;
  const isResolved = status !== "UNRESOLVED" && status !== "NOT_FOUND" && explain.kind === "ready";
  const pickList = useMemo(
    () => (explainData ? buildPickListFromExplain(explainData) : []),
    [explainData],
  );

  return (
    <div className="rounded-lg border border-slate-200">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-slate-50">
        <div className="text-[11px] font-semibold text-slate-700">商品明细（平台镜像）</div>
        <div className="text-[11px] text-slate-500">
          {lines.length ? `共 ${lines.length} 行` : "—"}
        </div>
      </div>

      {/* ✅ 平台原始行（核对用，对账优先） */}
      {loading ? (
        <div className="px-3 py-3 text-[12px] text-slate-500">加载中…</div>
      ) : lines.length ? (
        <div className="max-h-[320px] overflow-auto">
          <table className="min-w-full border-collapse text-xs">
            <thead className="sticky top-0 bg-white">
              <tr className="text-[11px] text-slate-600 border-b border-slate-200">
                <th className="px-3 py-2 text-left">标题</th>
                <th className="px-3 py-2 text-left">规格</th>
                <th className="px-3 py-2 text-right">数量</th>
                <th className="px-3 py-2 text-right">单价</th>
                <th className="px-3 py-2 text-right">小计</th>
                <th className="px-3 py-2 text-left">SKU</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((ln, idx) => (
                <tr key={`${ln.sku}-${idx}`} className="border-b border-slate-100">
                  <td className="px-3 py-2 text-slate-900">{ln.title}</td>
                  <td className="px-3 py-2 text-slate-600">{ln.spec}</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-900">{ln.qty}</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-700">{ln.price}</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-900">{ln.amount}</td>
                  <td className="px-3 py-2 font-mono text-[11px] text-slate-700">{ln.sku}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-3 py-3 text-[12px] text-slate-500">
          暂无商品明细（后端未返回 items）。
        </div>
      )}

      {/* ✅ 解析后的拣货清单：可选展开，不抢主视觉 */}
      <details className="border-t border-slate-200 bg-slate-50 px-3 py-2">
        <summary className="cursor-pointer list-none select-none">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold text-slate-700">解析后的拣货清单（可选）</div>
            <div className="text-[11px] text-slate-500">
              {explain.kind === "ready"
                ? isResolved
                  ? "已生成"
                  : "需治理"
                : explain.kind === "loading"
                ? "解析中…"
                : "—"}
            </div>
          </div>
        </summary>

        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-[11px] text-slate-600">
              status：<span className="font-mono text-slate-900">{safeText(status ?? "—")}</span>
            </div>
            {onReloadExplain ? (
              <button
                type="button"
                className="text-[11px] px-2 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                onClick={onReloadExplain}
                disabled={explain.kind === "loading"}
                title="重放/刷新解析结果"
              >
                {explain.kind === "loading" ? "解析中…" : "重放解析"}
              </button>
            ) : null}
          </div>

          {explain.kind === "missing_key" ? (
            <div className="text-[12px] text-amber-700">{explain.reason}</div>
          ) : explain.kind === "error" ? (
            <div className="text-[12px] text-red-700">{explain.message}</div>
          ) : explain.kind === "loading" ? (
            <div className="text-[12px] text-slate-500">解析中…</div>
          ) : explain.kind === "ready" ? (
            !isResolved ? (
              <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
                <div className="font-semibold">暂无法生成拣货清单</div>
                <div className="mt-1">
                  {unresolvedN > 0
                    ? `存在未解析行（${unresolvedN}）— 请先完成 PSKU 绑定 / FSKU 发布与组件配置。`
                    : `status=${safeText(status ?? "—")}（请先治理解析链路）。`}
                </div>
              </div>
            ) : pickList.length ? (
              <div className="overflow-auto rounded border border-slate-200 bg-white">
                <table className="min-w-full border-collapse text-xs">
                  <thead className="bg-white sticky top-0">
                    <tr className="text-[11px] text-slate-600 border-b border-slate-200">
                      <th className="px-3 py-2 text-left">item_id</th>
                      <th className="px-3 py-2 text-right">应拣数量</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pickList.map((x) => (
                      <tr key={x.item_id} className="border-b border-slate-100">
                        <td className="px-3 py-2 font-mono text-[11px] text-slate-800">{x.item_id}</td>
                        <td className="px-3 py-2 text-right font-mono text-slate-900">{x.need_qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-[12px] text-slate-500">已解析，但未得到 item 级清单。</div>
            )
          ) : (
            <div className="text-[12px] text-slate-500">请选择订单后查看解析清单。</div>
          )}
        </div>
      </details>
    </div>
  );
};
