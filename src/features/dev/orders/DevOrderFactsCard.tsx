// src/features/dev/orders/DevOrderFactsCard.tsx
// 行事实 + 对账结果 + 从订单创建 RMA 按钮（纯 UI 模块）

import React from "react";
import type {
  DevOrderItemFact,
  DevOrderReconcileResult,
} from "./api";

type Props = {
  orderFacts: DevOrderItemFact[] | null;
  reconcileResult: DevOrderReconcileResult | null;
  reconcileLoading: boolean;
  creatingRma: boolean;
  onReconcile: () => void;
  onCreateRmaTask: () => void;
};

export const DevOrderFactsCard: React.FC<Props> = ({
  orderFacts,
  reconcileResult,
  reconcileLoading,
  creatingRma,
  onReconcile,
  onCreateRmaTask,
}) => {
  if (!orderFacts || orderFacts.length === 0) return null;

  return (
    <div className="mt-4 space-y-2 border-t border-dashed border-slate-200 pt-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold text-slate-700">
          行事实（数量 & 剩余可退额度）
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onReconcile}
            disabled={reconcileLoading}
            className="inline-flex items-center rounded-md border border-slate-300 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {reconcileLoading ? "对账中…" : "事实对账（仅查看）"}
          </button>
          <button
            type="button"
            onClick={onCreateRmaTask}
            disabled={creatingRma}
            className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1 text-[11px] font-medium text-white shadow-sm hover:bg-emerald-500 disabled:opacity-60"
          >
            {creatingRma
              ? "创建退货任务中…"
              : "从订单创建退货任务（RMA）"}
          </button>
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
            </tr>
          </thead>
          <tbody>
            {orderFacts.map((f) => (
              <tr
                key={f.item_id}
                className="border-t border-slate-100"
              >
                <td className="px-2 py-1 font-mono text-[11px]">
                  {f.item_id}
                </td>
                <td className="px-2 py-1">
                  {f.title ?? f.sku_id ?? "-"}
                </td>
                <td className="px-2 py-1 text-right">
                  {f.qty_ordered}
                </td>
                <td className="px-2 py-1 text-right">
                  {f.qty_shipped}
                </td>
                <td className="px-2 py-1 text-right">
                  {f.qty_returned}
                </td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reconcileResult && (
        <div className="mt-1 rounded-md bg-slate-50 px-2.5 py-2 text-[11px] text-slate-700">
          {reconcileResult.issues.length === 0 ? (
            <span>对账结果：未发现异常。</span>
          ) : (
            <>
              <div className="font-semibold text-amber-700">
                对账发现 {reconcileResult.issues.length} 条异常：
              </div>
              <ul className="mt-1 list-disc pl-4">
                {reconcileResult.issues.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
};
