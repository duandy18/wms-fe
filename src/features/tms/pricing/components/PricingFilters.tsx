// src/features/tms/pricing/components/PricingFilters.tsx

import React from "react";
import type { PricingFiltersState, PricingStatus } from "../types";

type WarehouseOption = {
  warehouse_id: number;
  warehouse_name: string;
};

type StatusOption = {
  value: PricingStatus;
  label: string;
};

type Props = {
  filters: PricingFiltersState;
  loading: boolean;
  warehouseOptions: WarehouseOption[];
  statusOptions: StatusOption[];
  onChange: <K extends keyof PricingFiltersState>(
    key: K,
    value: PricingFiltersState[K],
  ) => void;
  onReset: () => void;
  onReload: () => void;
};

const PricingFilters: React.FC<Props> = ({
  filters,
  loading,
  warehouseOptions,
  statusOptions,
  onChange,
  onReset,
  onReload,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <div className="text-base font-semibold text-slate-900">筛选条件</div>
        <div className="mt-1 text-sm text-slate-500">
          仅做运营视图筛选；状态语义完全以后端返回为准，前端不自行推导。
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-600">关键字</span>
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
            placeholder="网点编码 / 网点名称 / 仓库名称"
            value={filters.keyword}
            onChange={(e) => onChange("keyword", e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-600">仓库</span>
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
            value={filters.warehouse_id}
            onChange={(e) => onChange("warehouse_id", e.target.value)}
          >
            <option value="">全部仓库</option>
            {warehouseOptions.map((item) => (
              <option key={item.warehouse_id} value={String(item.warehouse_id)}>
                {item.warehouse_name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-600">运价状态</span>
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
            value={filters.pricing_status}
            onChange={(e) =>
              onChange(
                "pricing_status",
                (e.target.value as PricingFiltersState["pricing_status"]) ?? "",
              )
            }
          >
            <option value="">全部状态</option>
            {statusOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end gap-2">
          <button
            type="button"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onReload}
            disabled={loading}
          >
            刷新
          </button>

          <button
            type="button"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onReset}
            disabled={loading}
          >
            重置
          </button>
        </div>
      </div>
    </section>
  );
};

export default PricingFilters;
