// src/features/operations/outbound-pick/platformOrderMirror/OrderMirrorLinesTable.tsx
import React, { useMemo } from "react";
import { getArr, getNum, getStr, isRecord } from "./jsonPick";

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

export const OrderMirrorLinesTable: React.FC<{
  detailOrder: unknown;
  loading: boolean;
}> = ({ detailOrder, loading }) => {
  const lines = useMemo(() => normalizeLines(detailOrder), [detailOrder]);

  return (
    <div className="rounded-lg border border-slate-200">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-slate-50">
        <div className="text-[11px] font-semibold text-slate-700">商品明细（平台原始行）</div>
        <div className="text-[11px] text-slate-500">
          {lines.length ? `共 ${lines.length} 行` : "—"}
        </div>
      </div>

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
