// src/features/orders/components/OrderFactsTable.tsx
import React from "react";
import type { OrderFacts } from "../api";
import type { DevOrderReconcileResult } from "../../dev/orders/api";

type Totals = {
  ordered: number;
  shipped: number;
  returned: number;
  remaining: number;
};

export const OrderFactsTable: React.FC<{
  facts: OrderFacts;
  totals: Totals;
  reconcile: DevOrderReconcileResult | null;
  onViewStock: (itemId: number) => void;
  onViewLedger: () => void;
}> = ({ facts, totals, reconcile, onViewStock, onViewLedger }) => {
  return (
    <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">
          行事实（下单 / 发货 / 退货 / 剩余可退）
        </h2>
        <div className="text-xs text-slate-500">
          共 {facts.items.length} 行 · 合计：
          <span className="ml-1 font-mono text-[11px]">
            下单 {totals.ordered} / 发货 {totals.shipped} / 退货 {totals.returned} / 可退{" "}
            {totals.remaining}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-slate-200">
        <table className="min-w-full text-[11px]">
          <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600">
            <tr>
              <th className="px-2 py-1 text-left">Item ID</th>
              <th className="px-2 py-1 text-left">标题</th>
              <th className="px-2 py-1 text-right">下单数量</th>
              <th className="px-2 py-1 text-right">已发货</th>
              <th className="px-2 py-1 text-right">已退货</th>
              <th className="px-2 py-1 text-right">剩余可退</th>
              <th className="px-2 py-1 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {facts.items.map((f) => (
              <tr key={f.item_id} className="border-t border-slate-100">
                <td className="px-2 py-1 font-mono text-[11px]">{f.item_id}</td>
                <td className="px-2 py-1">{f.title ?? f.sku_id ?? "-"}</td>
                <td className="px-2 py-1 text-right">{f.qty_ordered}</td>
                <td className="px-2 py-1 text-right">{f.qty_shipped}</td>
                <td className="px-2 py-1 text-right">{f.qty_returned}</td>
                <td className="px-2 py-1 text-right">
                  <span
                    className={
                      f.qty_remaining_refundable > 0
                        ? "font-semibold text-emerald-700"
                        : "text-slate-500"
                    }
                  >
                    {f.qty_remaining_refundable}
                  </span>
                </td>
                <td className="px-2 py-1 text-right">
                  <div className="flex flex-wrap justify-end gap-1">
                    <button
                      type="button"
                      className="rounded border border-slate-300 px-2 py-0.5 text-[10px] text-slate-700 hover:bg-slate-50"
                      onClick={() => onViewStock(f.item_id)}
                    >
                      库存
                    </button>
                    <button
                      type="button"
                      className="rounded border border-slate-300 px-2 py-0.5 text-[10px] text-slate-700 hover:bg-slate-50"
                      onClick={onViewLedger}
                    >
                      账本
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reconcile && (
        <div className="mt-1 rounded-md bg-slate-50 px-2.5 py-2 text-[11px] text-slate-700">
          {reconcile.issues.length === 0 ? (
            <span>对账结果：未发现异常。</span>
          ) : (
            <>
              <div className="font-semibold text-amber-700">
                对账发现 {reconcile.issues.length} 条异常：
              </div>
              <ul className="mt-1 list-disc pl-4">
                {reconcile.issues.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </section>
  );
};
