// 拆分说明：从 PurchaseReportsPage.tsx 抽出筛选区与状态提示，页面层只保留装配职责。路径：src/features/purchase-orders/reports/components/PurchaseReportsFilters.tsx

import React from "react";
import type { PurchaseReportsController } from "../model/usePurchaseReportsController";
import { getTimeModeLabel } from "../utils";

type Props = Pick<
  PurchaseReportsController,
  | "tab"
  | "setTab"
  | "timeMode"
  | "setTimeMode"
  | "warehouseId"
  | "setWarehouseId"
  | "supplierId"
  | "setSupplierId"
  | "selectedItemId"
  | "setSelectedItemId"
  | "dateFrom"
  | "setDateFrom"
  | "dateTo"
  | "setDateTo"
  | "warehouses"
  | "warehousesLoading"
  | "warehousesError"
  | "supplierOptions"
  | "suppliersLoading"
  | "suppliersError"
  | "selectedSupplierId"
  | "itemOptions"
  | "itemsLoading"
  | "itemsError"
  | "loading"
  | "error"
  | "currentRowsCount"
>;

const tabBtnBase = "rounded-md px-3 py-2 text-sm border transition-colors";
const tabBtnActive = "border-indigo-600 bg-indigo-600 text-white";
const tabBtnIdle = "border-slate-300 bg-white text-slate-700 hover:bg-slate-50";

const PurchaseReportsFilters: React.FC<Props> = ({
  tab,
  setTab,
  timeMode,
  setTimeMode,
  warehouseId,
  setWarehouseId,
  supplierId,
  setSupplierId,
  selectedItemId,
  setSelectedItemId,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  warehouses,
  warehousesLoading,
  warehousesError,
  supplierOptions,
  suppliersLoading,
  suppliersError,
  selectedSupplierId,
  itemOptions,
  itemsLoading,
  itemsError,
  loading,
  error,
  currentRowsCount,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab("items")}
          className={[tabBtnBase, tab === "items" ? tabBtnActive : tabBtnIdle].join(" ")}
        >
          按商品
        </button>
        <button
          type="button"
          onClick={() => setTab("suppliers")}
          className={[tabBtnBase, tab === "suppliers" ? tabBtnActive : tabBtnIdle].join(" ")}
        >
          按供应商
        </button>
        <button
          type="button"
          onClick={() => setTab("daily")}
          className={[tabBtnBase, tab === "daily" ? tabBtnActive : tabBtnIdle].join(" ")}
        >
          按日
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
        {tab !== "daily" ? (
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-600">时间口径</label>
            <select
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={timeMode}
              onChange={(e) => setTimeMode(e.target.value as "purchase_time" | "last_received")}
            >
              <option value="purchase_time">按采购时间</option>
              <option value="last_received">按最后收货时间</option>
            </select>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-600">时间口径</label>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              按最后收货时间
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-600">开始日期</label>
          <input
            type="date"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-600">结束日期</label>
          <input
            type="date"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-600">仓库</label>
          <select
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={warehouseId}
            disabled={warehousesLoading}
            onChange={(e) => setWarehouseId(e.target.value)}
          >
            <option value="">{warehousesLoading ? "加载中…" : "全部仓库"}</option>
            {warehouses.map((w) => (
              <option key={w.id} value={String(w.id)}>
                {w.name}（ID:{w.id}）
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-600">供应商</label>
          <select
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={supplierId}
            disabled={suppliersLoading}
            onChange={(e) => setSupplierId(e.target.value)}
          >
            <option value="">{suppliersLoading ? "加载中…" : "全部供应商"}</option>
            {supplierOptions.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.code ? `[${s.code}] ${s.name}` : s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-600">商品</label>
          <select
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            disabled={selectedSupplierId == null || itemsLoading}
          >
            <option value="">
              {selectedSupplierId == null
                ? "先选择供应商"
                : itemsLoading
                  ? "加载中…"
                  : "全部商品"}
            </option>
            {itemOptions.map((it) => (
              <option key={it.id} value={String(it.id)}>
                {it.name || "-"}
                {it.sku ? `（SKU:${it.sku}）` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {warehousesError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          仓库加载失败：{warehousesError}
        </div>
      ) : null}

      {suppliersError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          供应商加载失败：{suppliersError}
        </div>
      ) : null}

      {itemsError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          商品加载失败：{itemsError}
        </div>
      ) : null}

      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        {loading
          ? "加载中…"
          : error
            ? `加载失败：${error}`
            : `当前视图共 ${currentRowsCount} 行 · ${
                tab === "daily" ? "按最后收货时间" : getTimeModeLabel(timeMode)
              }`}
      </div>
    </section>
  );
};

export default PurchaseReportsFilters;
