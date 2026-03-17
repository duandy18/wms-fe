// src/features/tms/billing/components/BillingReconcileResultCard.tsx

import React from "react";
import type { ReconcileCarrierBillResult } from "../types";

interface Props {
  result: ReconcileCarrierBillResult | null;
}

const BillingReconcileResultCard: React.FC<Props> = ({ result }) => {
  if (!result) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-base font-semibold text-slate-900">对账结果</h2>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs text-slate-500">账单行数</div>
          <div className="mt-1 text-xl font-semibold text-slate-900">{result.bill_item_count}</div>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs text-slate-500">匹配数</div>
          <div className="mt-1 text-xl font-semibold text-slate-900">{result.matched_count}</div>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs text-slate-500">差异数</div>
          <div className="mt-1 text-xl font-semibold text-slate-900">{result.diff_count}</div>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs text-slate-500">未匹配数</div>
          <div className="mt-1 text-xl font-semibold text-slate-900">{result.unmatched_count}</div>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs text-slate-500">更新数</div>
          <div className="mt-1 text-xl font-semibold text-slate-900">{result.updated_count}</div>
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

export default BillingReconcileResultCard;
