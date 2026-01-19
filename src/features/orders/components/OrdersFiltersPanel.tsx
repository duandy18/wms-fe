// src/features/orders/components/OrdersFiltersPanel.tsx
import React from "react";
import type { OrdersListFilters } from "../hooks/useOrdersList";

export const OrdersFiltersPanel: React.FC<{
  filters: OrdersListFilters;
  setFilters: (patch: Partial<OrdersListFilters>) => void;
  loading: boolean;
  onSearch: () => void;
  error: string | null;
}> = ({ filters, setFilters, loading, onSearch, error }) => {
  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">平台</span>
          <input
            className="h-9 w-28 rounded border border-slate-300 px-2 text-sm"
            value={filters.platform}
            onChange={(e) => setFilters({ platform: e.target.value })}
            placeholder="如 PDD"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">店铺 ID</span>
          <input
            className="h-9 w-32 rounded border border-slate-300 px-2 text-sm"
            value={filters.shopId}
            onChange={(e) => setFilters({ shopId: e.target.value })}
            placeholder="可选"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">状态</span>
          <input
            className="h-9 w-32 rounded border border-slate-300 px-2 text-sm"
            value={filters.status}
            onChange={(e) => setFilters({ status: e.target.value })}
            placeholder="如 SHIPPED / RETURNED"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">开始日期</span>
          <input
            className="h-9 rounded border border-slate-300 px-2 text-sm"
            type="date"
            value={filters.timeFrom}
            onChange={(e) => setFilters({ timeFrom: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">结束日期</span>
          <input
            className="h-9 rounded border border-slate-300 px-2 text-sm"
            type="date"
            value={filters.timeTo}
            onChange={(e) => setFilters({ timeTo: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">每页数量</span>
          <input
            className="h-9 w-20 rounded border border-slate-300 px-2 text-sm"
            type="number"
            value={filters.limit}
            onChange={(e) => setFilters({ limit: Number(e.target.value || "") || 50 })}
          />
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={onSearch}
          className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {loading ? "查询中…" : "查询"}
        </button>
      </div>

      {error && <div className="text-xs text-red-600">{error}</div>}
    </section>
  );
};
