// src/features/tms/billing/components/BillingItemsFilters.tsx

import React from "react";
import type { CarrierBillItemsQuery } from "../types";

interface Props {
  query: CarrierBillItemsQuery;
  loading: boolean;
  onChange: <K extends keyof CarrierBillItemsQuery>(
    key: K,
    value: CarrierBillItemsQuery[K],
  ) => void;
  onApply: () => void;
  onReset: () => void;
}

function parsePositiveInt(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

const BillingItemsFilters: React.FC<Props> = ({
  query,
  loading,
  onChange,
  onApply,
  onReset,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm font-semibold text-slate-800">快递账单筛选</div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <label className="space-y-1">
          <div className="text-xs text-slate-600">批次 ID</div>
          <input
            value={query.import_batch_id ?? ""}
            onChange={(e) => onChange("import_batch_id", parsePositiveInt(e.target.value))}
            placeholder="如 123"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-1">
          <div className="text-xs text-slate-600">导入批次号</div>
          <input
            value={query.import_batch_no ?? ""}
            onChange={(e) => onChange("import_batch_no", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

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

export default BillingItemsFilters;
