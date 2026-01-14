// src/features/purchase-orders/PurchaseReportsFilters.tsx

import React, { useEffect, useMemo, useState } from "react";
import type { PurchaseReportFilters } from "./reportsApi";
import { apiGet } from "../../lib/api";
import { useSuppliersLoader } from "./createV2/presenter/useSuppliersLoader";
import { useItemsLoader } from "./createV2/presenter/useItemsLoader";
import type { TabKey } from "./usePurchaseReportsPresenter";

interface PurchaseReportsFiltersProps {
  activeTab: TabKey;
  filters: PurchaseReportFilters;
  loading: boolean;
  error: string | null;
  onChangeFilter: (field: keyof PurchaseReportFilters, value: string) => void;
  onQuickRange: (kind: "thisMonth" | "thisWeek") => void;
  onRefresh: () => void;
}

type WarehouseOut = {
  id: number;
  name: string;
  active?: boolean;
};

type WarehouseListOut = {
  ok: boolean;
  data: WarehouseOut[];
};

type SupplierOption = {
  id: number;
  name: string;
};

type ItemOption = {
  id: number;
  name: string;
  sku?: string | null;
};

export const PurchaseReportsFilters: React.FC<PurchaseReportsFiltersProps> = ({
  activeTab,
  filters,
  loading,
  error,
  onChangeFilter,
  onQuickRange,
  onRefresh,
}) => {
  const itemFilterEnabled = activeTab === "items";

  // ---------------------------
  // Warehouses
  // ---------------------------
  const [warehouses, setWarehouses] = useState<WarehouseOut[]>([]);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const [warehousesError, setWarehousesError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadWarehouses() {
      setWarehousesLoading(true);
      setWarehousesError(null);
      try {
        const resp = await apiGet<WarehouseListOut>(`/warehouses?active=true`);
        if (!alive) return;
        setWarehouses(Array.isArray(resp.data) ? resp.data : []);
      } catch (e) {
        console.error("loadWarehouses failed", e);
        if (alive) setWarehousesError("加载仓库列表失败");
      } finally {
        if (alive) setWarehousesLoading(false);
      }
    }

    void loadWarehouses();
    return () => {
      alive = false;
    };
  }, []);

  // ---------------------------
  // Suppliers + Items (reuse V2 loaders)
  // ---------------------------
  const { supplierOptions, suppliersLoading, suppliersError } =
    useSuppliersLoader();

  const supplierId =
    filters.supplierId != null ? Number(filters.supplierId) : null;

  const { itemOptions, itemsLoading, itemsError } = useItemsLoader({
    supplierId,
  });

  const supplierOptionsNormalized = useMemo((): SupplierOption[] => {
    return supplierOptions.map((s) => ({ id: s.id, name: s.name }));
  }, [supplierOptions]);

  const itemOptionsNormalized = useMemo((): ItemOption[] => {
    return itemOptions.map((it) => ({
      id: it.id,
      name: it.name,
      sku: it.sku ?? null,
    }));
  }, [itemOptions]);

  // ---------------------------
  // Item select (UI state) -> itemId (query)
  // ---------------------------
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  useEffect(() => {
    // 切换供应商或切换 tab 时，都把商品选择 UI 清空
    setSelectedItemId("");

    // 非按商品时：确保不带 itemId/itemKeyword（避免“看起来在按供应商，实际被商品过滤”）
    if (!itemFilterEnabled) {
      if (filters.itemId != null) onChangeFilter("itemId", "");
      if (filters.itemKeyword) onChangeFilter("itemKeyword", "");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplierId, itemFilterEnabled]);

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-800">过滤条件</h2>
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
              onChange={(e) => onChangeFilter("dateFrom", e.target.value)}
            />
            <span className="text-slate-400">至</span>
            <input
              type="date"
              className="flex-1 rounded-md border border-slate-300 px-2 py-1"
              value={filters.dateTo ?? ""}
              onChange={(e) => onChangeFilter("dateTo", e.target.value)}
            />
          </div>
        </div>

        {/* 仓库 */}
        <div className="flex flex-col">
          <label className="text-[11px] text-slate-500">仓库</label>
          <select
            className="mt-1 rounded-md border border-slate-300 px-2 py-1"
            value={filters.warehouseId != null ? String(filters.warehouseId) : ""}
            onChange={(e) => onChangeFilter("warehouseId", e.target.value)}
            disabled={warehousesLoading}
          >
            <option value="">
              {warehousesLoading ? "加载中…" : "全部仓库"}
            </option>
            {warehouses.map((w) => (
              <option key={w.id} value={String(w.id)}>
                {w.name}（ID:{w.id}）
              </option>
            ))}
          </select>
          {warehousesError && (
            <div className="mt-1 text-[11px] text-red-600">{warehousesError}</div>
          )}
        </div>

        {/* 供应商 */}
        <div className="flex flex-col">
          <label className="text-[11px] text-slate-500">供应商</label>
          <select
            className="mt-1 rounded-md border border-slate-300 px-2 py-1"
            value={filters.supplierId != null ? String(filters.supplierId) : ""}
            onChange={(e) => onChangeFilter("supplierId", e.target.value)}
            disabled={suppliersLoading}
          >
            <option value="">
              {suppliersLoading ? "加载中…" : "全部供应商"}
            </option>
            {supplierOptionsNormalized.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.name}（ID:{s.id}）
              </option>
            ))}
          </select>
          {suppliersError && (
            <div className="mt-1 text-[11px] text-red-600">{suppliersError}</div>
          )}
        </div>

        {/* 商品：仅“按商品”视图生效 */}
        <div className="flex flex-col">
          <label className="text-[11px] text-slate-500">商品</label>
          <select
            className="mt-1 rounded-md border border-slate-300 px-2 py-1"
            value={selectedItemId}
            onChange={(e) => {
              const v = e.target.value;
              setSelectedItemId(v);

              // ✅ 清空：同时清 itemId + itemKeyword（避免残留）
              if (!v) {
                onChangeFilter("itemId", "");
                onChangeFilter("itemKeyword", "");
                return;
              }

              // ✅ 选择商品：写入 itemId（审计锚点），并清空 itemKeyword
              onChangeFilter("itemId", v);
              onChangeFilter("itemKeyword", "");
            }}
            disabled={!itemFilterEnabled || supplierId == null || itemsLoading}
          >
            <option value="">
              {!itemFilterEnabled
                ? "仅在“按商品”视图可用"
                : supplierId == null
                  ? "先选择供应商"
                  : itemsLoading
                    ? "加载中…"
                    : "全部商品"}
            </option>

            {itemOptionsNormalized.map((it) => (
              <option key={it.id} value={String(it.id)}>
                {it.name || "-"}
                {it.sku ? `（SKU:${it.sku}）` : ""}
                （ID:{it.id}）
              </option>
            ))}
          </select>

          {!itemFilterEnabled && (
            <div className="mt-1 text-[11px] text-slate-500">
              提示：商品筛选只对“按商品”视图生效，其他视图将忽略该条件。
            </div>
          )}

          {itemsError && (
            <div className="mt-1 text-[11px] text-red-600">{itemsError}</div>
          )}

          {/* 审计友好：告诉用户当前正在用 itemId 过滤 */}
          {filters.itemId != null && itemFilterEnabled && supplierId != null && (
            <div className="mt-1 text-[11px] text-slate-500">
              商品筛选：ID = {filters.itemId}
            </div>
          )}
        </div>

        {/* 采购单状态 */}
        <div className="flex flex-col md:col-span-1">
          <label className="text-[11px] text-slate-500">采购单状态</label>
          <select
            className="mt-1 rounded-md border border-slate-300 px-2 py-1"
            value={filters.status ?? ""}
            onChange={(e) => onChangeFilter("status", e.target.value)}
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
        {error && <span className="text-xs text-red-600">{error}</span>}
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
