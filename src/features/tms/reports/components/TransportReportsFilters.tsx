// src/features/tms/reports/components/TransportReportsFilters.tsx

import React from "react";
import type {
  ShippingReportFilterOptions,
  TransportReportsQuery,
} from "../types";

interface TransportReportsFiltersProps {
  query: TransportReportsQuery;
  options: ShippingReportFilterOptions;
  loading: boolean;
  totalShipCnt: number;
  totalCostText: string;
  onChange: <K extends keyof TransportReportsQuery>(
    key: K,
    value: TransportReportsQuery[K],
  ) => void;
  onApply: () => void;
  onReset: () => void;
}

const TransportReportsFilters: React.FC<TransportReportsFiltersProps> = ({
  query,
  options,
  loading,
  totalShipCnt,
  totalCostText,
  onChange,
  onApply,
  onReset,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="text-sm font-semibold text-slate-800">报表筛选</div>
        <div className="text-xs text-slate-500">
          发货单量 {totalShipCnt} · 总预估费用 {totalCostText}
        </div>
      </div>

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
          <div className="text-xs text-slate-600">平台</div>
          <select
            value={query.platform ?? ""}
            onChange={(e) => onChange("platform", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">全部</option>
            {options.platforms.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <div className="text-xs text-slate-600">店铺</div>
          <select
            value={query.shop_id ?? ""}
            onChange={(e) => onChange("shop_id", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">全部</option>
            {options.shop_ids.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
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
          <div className="text-xs text-slate-600">目的省</div>
          <select
            value={query.province ?? ""}
            onChange={(e) => onChange("province", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">全部</option>
            {options.provinces.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <div className="text-xs text-slate-600">目的市</div>
          <select
            value={query.city ?? ""}
            onChange={(e) => onChange("city", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">全部</option>
            {options.cities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
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
          {loading ? "加载中…" : "刷新报表"}
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

export default TransportReportsFilters;
