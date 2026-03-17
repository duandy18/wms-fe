// src/features/tms/reconciliation/components/ReconciliationResultCard.tsx

import React from "react";
import type { ReconcileCarrierBillResult } from "../types";

interface Props {
  result: ReconcileCarrierBillResult | null;
}

const ReconciliationResultCard: React.FC<Props> = ({ result }) => {
  if (!result) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900">对账结果</h2>
        <div className="text-xs text-slate-500">
          批次 ID：<span className="font-mono">{result.import_batch_id}</span>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs text-slate-500">承运商代码</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">
            {result.carrier_code}
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs text-slate-500">导入批次号</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">
            {result.import_batch_no}
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs text-slate-500">账单行数</div>
          <div className="mt-1 text-xl font-semibold text-slate-900">
            {result.bill_item_count}
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs text-slate-500">差异数</div>
          <div className="mt-1 text-xl font-semibold text-slate-900">
            {result.diff_count}
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs text-slate-500">仅账单</div>
          <div className="mt-1 text-xl font-semibold text-slate-900">
            {result.bill_only_count}
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs text-slate-500">仅记录</div>
          <div className="mt-1 text-xl font-semibold text-slate-900">
            {result.record_only_count}
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs text-slate-500">更新数</div>
          <div className="mt-1 text-xl font-semibold text-slate-900">
            {result.updated_count}
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs text-slate-500">重复运单数</div>
          <div className="mt-1 text-xl font-semibold text-slate-900">
            {result.duplicate_bill_tracking_count}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReconciliationResultCard;
