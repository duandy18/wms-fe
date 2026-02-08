// src/features/operations/outbound-pick/platformOrderMirror/OrderMirrorLinesTable.tsx
import React, { useMemo } from "react";
import { getArr, getNum, getStr, isRecord } from "./jsonPick";
import type { PlatformOrderReplayOut } from "../orderExplain/types";

type ExplainLite =
  | { kind: "idle" }
  | { kind: "missing_key"; reason: string }
  | { kind: "loading" }
  | { kind: "ready"; data: PlatformOrderReplayOut }
  | { kind: "error"; message: string };

type Line = {
  sku: string;
  name: string;
  qty: number;
  spec: string;
};

function normalizeLines(detailOrder: unknown): Line[] {
  if (!isRecord(detailOrder)) return [];

  const arr =
    getArr(detailOrder, ["items", "lines", "order_lines", "order_items", "orderItems"]) ?? [];

  const out: Line[] = [];
  for (const it of arr) {
    if (!isRecord(it)) continue;

    const sku =
      getStr(it, ["sku", "item_sku", "seller_sku", "merchant_sku", "outer_sku", "code"]) ?? "—";
    const name = getStr(it, ["name", "title", "item_name", "product_name", "goods_name"]) ?? "—";
    const qty = getNum(it, ["qty", "quantity", "count", "num", "buy_qty"]) ?? 0;
    const spec = getStr(it, ["spec", "specification", "variant", "attrs", "sku_spec"]) ?? "";

    out.push({ sku, name, qty, spec });
  }
  return out;
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
      if (!isRecord(row)) continue;
      const raw = row["expanded_items"];
      if (!Array.isArray(raw)) continue;

      for (const it of raw) {
        if (!isRecord(it)) continue;
        const itemId = toInt(it["item_id"]);
        const needQty = toInt(it["need_qty"]);
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
  detailOrder: unknown;
  loading: boolean;

  // ✅ 解析结果注入：在“商品卡”里显示解析后拣货清单
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
        <div className="text-[11px] font-semibold text-slate-700">商品明细</div>
        <div className="flex items-center gap-2">
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
          <div className="text-[11px] text-slate-500">
            {lines.length ? `平台原始行：共 ${lines.length} 行` : "平台原始行：—"}
          </div>
        </div>
      </div>

      {/* ✅ 解析后的拣货清单（用户能执行） */}
      <div className="px-3 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold text-slate-700">拣货清单（解析后）</div>
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

        {explain.kind === "missing_key" ? (
          <div className="mt-2 text-[12px] text-amber-700">{explain.reason}</div>
        ) : explain.kind === "error" ? (
          <div className="mt-2 text-[12px] text-red-700">{explain.message}</div>
        ) : explain.kind === "loading" ? (
          <div className="mt-2 text-[12px] text-slate-500">解析中…</div>
        ) : explain.kind === "ready" ? (
          !isResolved ? (
            <div className="mt-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
              <div className="font-semibold">暂无法生成拣货清单</div>
              <div className="mt-1">
                {unresolvedN > 0
                  ? `存在未解析行（${unresolvedN}）— 请先完成 PSKU 绑定 / FSKU 发布与组件配置。`
                  : `status=${status ?? "—"}（请先治理解析链路）。`}
              </div>
            </div>
          ) : pickList.length ? (
            <div className="mt-2 overflow-auto rounded border border-slate-200">
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
            <div className="mt-2 text-[12px] text-slate-500">已解析，但未得到 item 级清单。</div>
          )
        ) : (
          <div className="mt-2 text-[12px] text-slate-500">请选择订单后查看解析清单。</div>
        )}
      </div>

      {/* 平台原始行（核对用） */}
      {loading ? (
        <div className="px-3 py-3 text-[12px] text-slate-500">加载中…</div>
      ) : lines.length ? (
        <div className="max-h-[260px] overflow-auto">
          <table className="min-w-full border-collapse text-xs">
            <thead className="sticky top-0 bg-white">
              <tr className="text-[11px] text-slate-600 border-b border-slate-200">
                <th className="px-3 py-2 text-left">SKU</th>
                <th className="px-3 py-2 text-left">商品</th>
                <th className="px-3 py-2 text-left">规格</th>
                <th className="px-3 py-2 text-right">数量</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((ln, idx) => (
                <tr key={`${ln.sku}-${idx}`} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-[11px] text-slate-800">{ln.sku}</td>
                  <td className="px-3 py-2 text-slate-900">{ln.name}</td>
                  <td className="px-3 py-2 text-slate-600">{ln.spec || "—"}</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-900">{ln.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-3 py-3 text-[12px] text-slate-500">
          暂无商品明细（或后端未返回 items/lines 字段）。
        </div>
      )}
    </div>
  );
};
