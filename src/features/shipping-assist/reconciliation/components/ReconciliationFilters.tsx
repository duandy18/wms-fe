// src/features/shipping-assist/reconciliation/components/ReconciliationFilters.tsx

import React from "react";
import type { ReconciliationCarrierOption, ShippingBillReconciliationsQuery } from "../types";

interface Props {
  query: ShippingBillReconciliationsQuery;
  loading: boolean;
  carrierOptions: ReconciliationCarrierOption[];
  carrierOptionsLoading: boolean;
  carrierOptionsError: string;
  reconciling: boolean;
  onChange: <K extends keyof ShippingBillReconciliationsQuery>(
    key: K,
    value: ShippingBillReconciliationsQuery[K],
  ) => void;
  onApply: () => void;
  onReset: () => void;
  onReconcile: () => void | Promise<void>;
}

const ReconciliationFilters: React.FC<Props> = ({
  query,
  loading,
  carrierOptions,
  carrierOptionsLoading,
  carrierOptionsError,
  reconciling,
  onChange,
  onApply,
  onReset,
  onReconcile,
}) => {
  const reconcileDisabled =
    reconciling || carrierOptionsLoading || !String(query.shipping_provider_code ?? "").trim();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm font-semibold text-slate-800">对账表筛选</div>

      {carrierOptionsError ? (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          {carrierOptionsError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="space-y-1">
          <div className="text-xs text-slate-600">物流网点</div>
          <select
            value={query.shipping_provider_code ?? ""}
            onChange={(e) => onChange("shipping_provider_code", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            disabled={carrierOptionsLoading}
          >
            <option value="">
              {carrierOptionsLoading ? "物流网点加载中…" : "请选择物流网点"}
            </option>
            {carrierOptions.map((option) => (
              <option key={option.shipping_provider_code} value={option.shipping_provider_code}>
                {option.name}（{option.shipping_provider_code}）
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
          <div className="text-xs text-slate-600">状态</div>
          <select
            value={query.status ?? ""}
            onChange={(e) =>
              onChange("status", e.target.value as ShippingBillReconciliationsQuery["status"])
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">全部</option>
            <option value="diff">差异</option>
            <option value="bill_only">账单上有，我方缺记录</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          className="rounded-lg bg-sky-600 px-3 py-2 text-sm text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => void onReconcile()}
          disabled={reconcileDisabled}
        >
          {reconciling ? "对账中…" : "对账"}
        </button>

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
          disabled={loading || reconciling}
        >
          重置
        </button>
      </div>
    </section>
  );
};

export default ReconciliationFilters;
