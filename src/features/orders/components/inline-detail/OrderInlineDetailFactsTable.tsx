// src/features/orders/components/inline-detail/OrderInlineDetailFactsTable.tsx
import React from "react";
import type { OrderFacts } from "../../api";

export const OrderInlineDetailFactsTable: React.FC<{
  facts: OrderFacts["items"];
  totals: { ordered: number; shipped: number; returned: number; remaining: number };
}> = ({ facts, totals }) => {
  if (!facts.length) return null;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-700">行事实（下单 / 发货 / 退货 / 剩余可退）</h3>
        <div className="text-[11px] text-slate-500">
          共 {facts.length} 行 · 合计：下单 {totals.ordered} / 发货 {totals.shipped} / 退货 {totals.returned} / 可退{" "}
          {totals.remaining}
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-slate-200">
        <table className="min-w-full text-[11px]">
          <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600">
            <tr>
              <th className="px-2 py-1 text-left">Item ID</th>
              <th className="px-2 py-1 text-left">标题</th>
              <th className="px-2 py-1 text-right">下单</th>
              <th className="px-2 py-1 text-right">已发货</th>
              <th className="px-2 py-1 text-right">已退货</th>
              <th className="px-2 py-1 text-right">剩余可退</th>
            </tr>
          </thead>
          <tbody>
            {facts.map((f) => (
              <tr key={f.item_id} className="border-t border-slate-100">
                <td className="px-2 py-1 font-mono text-[11px]">{f.item_id}</td>
                <td className="px-2 py-1">{f.title ?? f.sku_id ?? "-"}</td>
                <td className="px-2 py-1 text-right">{f.qty_ordered}</td>
                <td className="px-2 py-1 text-right">{f.qty_shipped}</td>
                <td className="px-2 py-1 text-right">{f.qty_returned}</td>
                <td className="px-2 py-1 text-right">
                  <span className={f.qty_remaining_refundable > 0 ? "font-semibold text-emerald-700" : "text-slate-500"}>
                    {f.qty_remaining_refundable}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
