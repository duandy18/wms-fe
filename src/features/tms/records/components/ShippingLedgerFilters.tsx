// src/features/tms/records/components/ShippingLedgerFilters.tsx

import React from "react";
import type { ShippingLedgerQuery } from "../types";
import type {
  ShippingLedgerProviderOption,
  ShippingLedgerWarehouseOption,
} from "../hooks/useShippingLedgerOptions";

interface ShippingLedgerFiltersProps {
  query: ShippingLedgerQuery;
  loading: boolean;
  providers: ShippingLedgerProviderOption[];
  warehouses: ShippingLedgerWarehouseOption[];
  optionsLoading: boolean;
  optionsError: string;
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
  providers,
  warehouses,
  optionsLoading,
  optionsError,
  onChange,
  onApply,
  onReset,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm font-semibold text-slate-800">筛选条件</div>

      {optionsError ? (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          筛选选项加载失败：{optionsError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1">
          <div className="text-xs text-slate-600">快递网点</div>
          <select
            value={query.shipping_provider_id ?? ""}
            onChange={(e) =>
              onChange(
                "shipping_provider_id",
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            disabled={optionsLoading}
          >
            <option value="">
              {optionsLoading ? "正在加载快递网点…" : "全部快递网点"}
            </option>
            {providers.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}（{item.code || "-"}）
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <div className="text-xs text-slate-600">仓库</div>
          <select
            value={query.warehouse_id ?? ""}
            onChange={(e) =>
              onChange(
                "warehouse_id",
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            disabled={optionsLoading}
          >
            <option value="">
              {optionsLoading ? "正在加载仓库…" : "全部仓库"}
            </option>
            {warehouses.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
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
            placeholder="精确匹配"
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
