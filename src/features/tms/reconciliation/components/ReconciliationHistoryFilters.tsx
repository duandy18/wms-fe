// src/features/tms/reconciliation/components/ReconciliationHistoryFilters.tsx

import React from "react";
import type {
  ReconciliationCarrierOption,
  ShippingBillReconciliationHistoriesQuery,
} from "../types";

interface Props {
  query: ShippingBillReconciliationHistoriesQuery;
  loading: boolean;
  carrierOptions: ReconciliationCarrierOption[];
  carrierOptionsLoading: boolean;
  carrierOptionsError: string;
  onChange: <K extends keyof ShippingBillReconciliationHistoriesQuery>(
    key: K,
    value: ShippingBillReconciliationHistoriesQuery[K],
  ) => void;
  onApply: () => void;
  onReset: () => void;
}

const ReconciliationHistoryFilters: React.FC<Props> = ({
  query,
  loading,
  carrierOptions,
  carrierOptionsLoading,
  carrierOptionsError,
  onChange,
  onApply,
  onReset,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm font-semibold text-slate-800">历史表筛选</div>

      {carrierOptionsError ? (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          {carrierOptionsError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="space-y-1">
          <div className="text-xs text-slate-600">快递公司</div>
          <select
            value={query.carrier_code ?? ""}
            onChange={(e) => onChange("carrier_code", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            disabled={carrierOptionsLoading}
          >
            <option value="">
              {carrierOptionsLoading ? "快递公司加载中…" : "全部快递公司"}
            </option>
            {carrierOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.name}（{option.code}）
              </option>
            ))}
          </select>
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
          <div className="text-xs text-slate-600">归档结果</div>
          <select
            value={query.result_status ?? ""}
            onChange={(e) =>
              onChange(
                "result_status",
                e.target.value as ShippingBillReconciliationHistoriesQuery["result_status"],
              )
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">全部</option>
            <option value="matched">已平</option>
            <option value="approved_bill_only">我方缺记录</option>
            <option value="resolved">已解决差异</option>
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

export default ReconciliationHistoryFilters;
