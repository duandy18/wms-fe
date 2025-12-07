// src/features/purchase-orders/PurchaseReportsFilters.tsx

import React from "react";
import type { PurchaseReportFilters } from "./reportsApi";

interface PurchaseReportsFiltersProps {
  filters: PurchaseReportFilters;
  loading: boolean;
  error: string | null;
  onChangeFilter: (field: keyof PurchaseReportFilters, value: string) => void;
  onQuickRange: (kind: "thisMonth" | "thisWeek") => void;
  onRefresh: () => void;
}

export const PurchaseReportsFilters: React.FC<
  PurchaseReportsFiltersProps
> = ({
  filters,
  loading,
  error,
  onChangeFilter,
  onQuickRange,
  onRefresh,
}) => {
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-800">
          过滤条件
        </h2>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-600">快捷时间：</span>
          <button
            type="button"
            onClick={() => onQuickRange("thisWeek")}
            className="px-2 py-1 rounded-full border border-slate-300 hover:bg-slate-50"
          >
            本周
          </button>
          <button
            type="button"
            onClick={() => onQuickRange("thisMonth")}
            className="px-2 py-1 rounded-full border border-slate-300 hover:bg-slate-50"
          >
            本月
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        {/* 日期范围（双日历） */}
        <div className="flex flex-col md:col-span-2">
          <label className="text-[11px] text-slate-500 mb-1">
            日期范围（采购单创建时间）
          </label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="flex-1 rounded-md border border-slate-300 px-2 py-1"
              value={filters.dateFrom ?? ""}
              onChange={(e) =>
                onChangeFilter("dateFrom", e.target.value)
              }
            />
            <span className="text-slate-400">至</span>
            <input
              type="date"
              className="flex-1 rounded-md border border-slate-300 px-2 py-1"
              value={filters.dateTo ?? ""}
              onChange={(e) =>
                onChangeFilter("dateTo", e.target.value)
              }
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-[11px] text-slate-500">
            仓库 ID
          </label>
          <input
            className="mt-1 rounded-md border border-slate-300 px-2 py-1"
            placeholder="全部"
            value={
              filters.warehouseId != null
                ? String(filters.warehouseId)
                : ""
            }
            onChange={(e) =>
              onChangeFilter("warehouseId", e.target.value)
            }
          />
        </div>

        <div className="flex flex-col">
          <label className="text-[11px] text-slate-500">
            供应商 ID
          </label>
          <input
            className="mt-1 rounded-md border border-slate-300 px-2 py-1"
            placeholder="全部"
            value={
              filters.supplierId != null
                ? String(filters.supplierId)
                : ""
            }
            onChange={(e) =>
              onChangeFilter("supplierId", e.target.value)
            }
          />
        </div>

        <div className="flex flex-col">
          <label className="text-[11px] text-slate-500">
            采购单状态
          </label>
          <select
            className="mt-1 rounded-md border border-slate-300 px-2 py-1"
            value={filters.status ?? ""}
            onChange={(e) =>
              onChangeFilter("status", e.target.value)
            }
          >
            <option value="">全部</option>
            <option value="CREATED">新建</option>
            <option value="PARTIAL">部分收货</option>
            <option value="RECEIVED">已收完</option>
            <option value="CLOSED">已关闭</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {error && (
          <span className="text-xs text-red-600">{error}</span>
        )}
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="rounded-md border border-slate-300 px-4 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-60"
        >
          {loading ? "查询中…" : "刷新报表"}
        </button>
      </div>
    </section>
  );
};
