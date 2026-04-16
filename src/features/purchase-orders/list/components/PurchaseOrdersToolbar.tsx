import React from "react";
import {
  PURCHASE_ORDER_STATUS_OPTIONS,
} from "../utils";
import type {
  StatusFilter,
  SupplierOption,
} from "../types";

interface PurchaseOrdersToolbarProps {
  searchText: string;
  supplierFilter: string;
  statusFilter: StatusFilter;

  supplierOptions: SupplierOption[];
  suppliersLoading: boolean;
  suppliersError: string | null;

  loading: boolean;

  onChangeSearchText: (v: string) => void;
  onChangeSupplierFilter: (v: string) => void;
  onChangeStatusFilter: (v: StatusFilter) => void;
  onRefresh: () => void;
  onOpenCreate: () => void;
}

const PurchaseOrdersToolbar: React.FC<PurchaseOrdersToolbarProps> = ({
  searchText,
  supplierFilter,
  statusFilter,
  supplierOptions,
  suppliersLoading,
  suppliersError,
  loading,
  onChangeSearchText,
  onChangeSupplierFilter,
  onChangeStatusFilter,
  onRefresh,
  onOpenCreate,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-slate-800">
            采购计划完成情况
          </h2>
          <p className="text-xs text-slate-500">
            一行对应一条采购单行，显示计划、已收、剩余与最近收货时间。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={onOpenCreate}
            className="rounded-md bg-indigo-600 px-3 py-1 text-xs text-white hover:bg-indigo-500"
          >
            新建采购单
          </button>

          <input
            type="text"
            className="w-48 rounded-md border border-slate-300 px-2 py-1"
            placeholder="搜索采购单号 / 供应商 / 商品 / SKU"
            value={searchText}
            onChange={(e) => onChangeSearchText(e.target.value)}
          />

          <select
            className="w-40 rounded-md border border-slate-300 px-2 py-1"
            value={supplierFilter}
            disabled={suppliersLoading}
            onChange={(e) => onChangeSupplierFilter(e.target.value)}
          >
            <option value="">
              {suppliersLoading ? "供应商加载中…" : "全部供应商"}
            </option>
            {supplierOptions.map((supplier) => (
              <option key={supplier.id} value={String(supplier.id)}>
                {supplier.name}
              </option>
            ))}
          </select>

          <select
            className="w-32 rounded-md border border-slate-300 px-2 py-1"
            value={statusFilter}
            onChange={(e) => onChangeStatusFilter(e.target.value as StatusFilter)}
          >
            {PURCHASE_ORDER_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
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

      {suppliersError ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          供应商选项加载失败：{suppliersError}
        </div>
      ) : null}
    </div>
  );
};

export default PurchaseOrdersToolbar;
