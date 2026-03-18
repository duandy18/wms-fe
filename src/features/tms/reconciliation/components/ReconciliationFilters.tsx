// src/features/tms/reconciliation/components/ReconciliationFilters.tsx

import React from "react";
import type { ShippingBillReconciliationsQuery } from "../types";

interface Props {
  query: ShippingBillReconciliationsQuery;
  loading: boolean;
  onChange: <K extends keyof ShippingBillReconciliationsQuery>(
    key: K,
    value: ShippingBillReconciliationsQuery[K],
  ) => void;
  onApply: () => void;
  onReset: () => void;
}

const ReconciliationFilters: React.FC<Props> = ({
  query,
  loading,
  onChange,
  onApply,
  onReset,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm font-semibold text-slate-800">异常筛选</div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="space-y-1">
          <div className="text-xs text-slate-600">承运商代码</div>
          <input
            value={query.carrier_code ?? ""}
            onChange={(e) => onChange("carrier_code", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-1">
          <div className="text-xs text-slate-600">运单号</div>
          <input
            value={query.tracking_no ?? ""}
            onChange={(e) => onChange("tracking_no", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-1">
          <div className="text-xs text-slate-600">异常状态</div>
          <select
            value={query.status ?? ""}
            onChange={(e) => onChange("status", e.target.value as ShippingBillReconciliationsQuery["status"])}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">全部</option>
            <option value="diff">diff</option>
            <option value="bill_only">bill_only</option>
            <option value="record_only">record_only</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          className="rounded-lg bg-sky-600 px-3 py-2 text-sm text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onApply}
          disabled={loading}
        >
          {loading ? "加载中…" : "查询"}
        </button>

        <button
          type="button"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          onClick={onReset}
        >
          重置
        </button>
      </div>
    </section>
  );
};

export default ReconciliationFilters;
