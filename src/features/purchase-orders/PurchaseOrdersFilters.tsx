// src/features/purchase-orders/PurchaseOrdersFilters.tsx

import React from "react";
import type { StatusFilter } from "./usePurchaseOrdersListPresenter";

interface PurchaseOrdersFiltersProps {
  supplierFilter: string;
  statusFilter: StatusFilter;
  loading: boolean;
  onChangeSupplier: (v: string) => void;
  onChangeStatus: (v: StatusFilter) => void;
  onRefresh: () => void;
}

export const PurchaseOrdersFilters: React.FC<PurchaseOrdersFiltersProps> = ({
  supplierFilter,
  statusFilter,
  loading,
  onChangeSupplier,
  onChangeStatus,
  onRefresh,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <h2 className="text-sm font-semibold text-slate-800">采购单列表</h2>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <input
          className="w-40 rounded-md border border-slate-300 px-2 py-1"
          placeholder="供应商关键字"
          value={supplierFilter}
          onChange={(e) => onChangeSupplier(e.target.value)}
        />
        <select
          className="w-32 rounded-md border border-slate-300 px-2 py-1"
          value={statusFilter}
          onChange={(e) =>
            onChangeStatus(e.target.value as StatusFilter)
          }
        >
          <option value="ALL">全部状态</option>
          <option value="CREATED">新建</option>
          <option value="PARTIAL">部分收货</option>
          <option value="RECEIVED">已收货</option>
          <option value="CLOSED">已关闭</option>
        </select>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="rounded-md border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50 disabled:opacity-60"
        >
          {loading ? "查询中…" : "刷新"}
        </button>
      </div>
    </div>
  );
};
