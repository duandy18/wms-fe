// src/features/orders/components/OrderDetailActionsBar.tsx
import React from "react";

export const OrderDetailActionsBar: React.FC<{
  traceId: string | null;
  hasRemainingRefundable: boolean;
  reconcileLoading: boolean;
  creatingRma: boolean;
  onViewTrace: () => void;
  onReconcile: () => void;
  onCreateRma: () => void;
  onViewLedger: () => void;
}> = ({
  traceId,
  hasRemainingRefundable,
  reconcileLoading,
  creatingRma,
  onViewTrace,
  onReconcile,
  onCreateRma,
  onViewLedger,
}) => {
  return (
    <div className="flex flex-wrap gap-2 pt-1 text-xs">
      {traceId && (
        <button
          type="button"
          onClick={onViewTrace}
          className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
        >
          查看链路（Trace 页）
        </button>
      )}

      <button
        type="button"
        onClick={onReconcile}
        disabled={reconcileLoading}
        className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-100 disabled:opacity-60"
      >
        {reconcileLoading ? "对账中…" : "事实对账（仅查看）"}
      </button>

      {hasRemainingRefundable && (
        <button
          type="button"
          onClick={onCreateRma}
          disabled={creatingRma}
          className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-medium text-white shadow-sm hover:bg-emerald-500 disabled:opacity-60"
        >
          {creatingRma ? "创建退货任务中…" : "从订单创建退货任务（RMA）"}
        </button>
      )}

      <button
        type="button"
        onClick={onViewLedger}
        className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
      >
        查看账本（按 ORD:ref）
      </button>
    </div>
  );
};
