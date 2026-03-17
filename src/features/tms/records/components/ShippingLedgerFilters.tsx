// src/features/tms/records/components/ShippingLedgerFilters.tsx

import React from "react";
import type { ShippingLedgerQuery } from "../types";

interface ShippingLedgerFiltersProps {
  query: ShippingLedgerQuery;
  loading: boolean;
  onChange: <K extends keyof ShippingLedgerQuery>(
    key: K,
    value: ShippingLedgerQuery[K],
  ) => void;
  onApply: () => void;
  onReset: () => void;
}

const ShippingLedgerFilters: React.FC<ShippingLedgerFiltersProps> = ({
  query,
  loading,
  onChange,
  onApply,
  onReset,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm font-semibold text-slate-800">台帐筛选</div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1">
          <div className="text-xs text-slate-600">发货日期从</div>
          <input
            type="date"
            value={query.from_date ?? ""}
            onChange={(e) => onChange("from_date", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-1">
          <div className="text-xs text-slate-600">发货日期至</div>
          <input
            type="date"
            value={query.to_date ?? ""}
            onChange={(e) => onChange("to_date", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-1">
          <div className="text-xs text-slate-600">订单号</div>
          <input
            value={query.order_ref ?? ""}
            onChange={(e) => onChange("order_ref", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="精确匹配"
          />
        </label>

        <label className="space-y-1">
          <div className="text-xs text-slate-600">运单号</div>
          <input
            value={query.tracking_no ?? ""}
            onChange={(e) => onChange("tracking_no", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="精确匹配"
          />
        </label>

        <label className="space-y-1">
          <div className="text-xs text-slate-600">承运商代码</div>
          <input
            value={query.carrier_code ?? ""}
            onChange={(e) => onChange("carrier_code", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="如 YTO / STO"
          />
        </label>

        <label className="space-y-1">
          <div className="text-xs text-slate-600">目的省</div>
          <input
            value={query.province ?? ""}
            onChange={(e) => onChange("province", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-1">
          <div className="text-xs text-slate-600">目的市</div>
          <input
            value={query.city ?? ""}
            onChange={(e) => onChange("city", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-1">
          <div className="text-xs text-slate-600">仓库 ID</div>
          <input
            type="number"
            value={query.warehouse_id ?? ""}
            onChange={(e) =>
              onChange(
                "warehouse_id",
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
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
          {loading ? "查询中…" : "查询"}
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

export default ShippingLedgerFilters;
