// src/features/purchase-orders/PurchaseReportsFilters.tsx

import React, { useEffect, useMemo, useState } from "react";
import type { PurchaseReportFilters } from "./reportsApi";
import { apiGet } from "../../lib/api";

type TabKey = "suppliers" | "items" | "daily";

type WarehouseRow = {
  id: number;
  name: string;
  active: boolean;
};

type WarehousesResp = {
  ok: boolean;
  data: WarehouseRow[];
};

type SupplierRow = {
  id: number;
  name: string;
  active: boolean;
};

interface PurchaseReportsFiltersProps {
  activeTab: TabKey;

  filters: PurchaseReportFilters;
  loading: boolean;
  error: string | null;

  onChangeFilter: (field: keyof PurchaseReportFilters, value: string) => void;
  onQuickRange: (kind: "thisMonth" | "thisWeek") => void;

  onQuery: () => void;
  onReset: () => void;
}

function toIntOrEmpty(v: number | null | undefined): string {
  return v != null ? String(v) : "";
}

function safeStr(v: unknown): string {
  return typeof v === "string" ? v : String(v ?? "");
}

export const PurchaseReportsFilters: React.FC<PurchaseReportsFiltersProps> = ({
  activeTab,
  filters,
  loading,
  error,
  onChangeFilter,
  onQuickRange,
  onQuery,
  onReset,
}) => {
  const [warehouses, setWarehouses] = useState<WarehouseRow[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
  const [optsErr, setOptsErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadOptions() {
      setOptsErr(null);

      try {
        // ✅ 严格对齐后端合同：/warehouses -> {ok, data: WarehouseRow[]}
        const w = await apiGet<WarehousesResp>("/warehouses");
        const ws = Array.isArray(w?.data) ? w.data : [];

        // ✅ 严格对齐后端合同：/suppliers -> SupplierRow[]
        const ss = await apiGet<SupplierRow[]>("/suppliers");
        const suppliersArr = Array.isArray(ss) ? ss : [];

        if (!alive) return;

        setWarehouses(ws.filter((x) => x && Number(x.id) > 0));
        setSuppliers(suppliersArr.filter((x) => x && Number(x.id) > 0));
      } catch (e) {
        console.error("load report filter options failed:", e);
        if (!alive) return;
        setWarehouses([]);
        setSuppliers([]);
        setOptsErr("加载仓库/供应商选项失败（请检查后端接口与权限）");
      }
    }

    void loadOptions();
    return () => {
      alive = false;
    };
  }, []);

  const warehouseOptions = useMemo(() => {
    const xs = (warehouses || []).slice();
    xs.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    return xs;
  }, [warehouses]);

  const supplierOptions = useMemo(() => {
    const xs = (suppliers || []).slice();
    xs.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    return xs;
  }, [suppliers]);

  // ✅ 已补齐后端合同：item_keyword 对 suppliers/items/daily 均生效
  const itemKeywordHint =
    activeTab === "items"
      ? "支持商品名/条码/SKU 模糊匹配（按采购行快照 + 主数据）"
      : "支持商品名/条码/SKU 模糊匹配（按采购行快照 + 主数据）";

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-800">查询</h2>

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

      {optsErr ? <div className="text-xs text-amber-700">{optsErr}</div> : null}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        {/* 日期范围 */}
        <div className="flex flex-col md:col-span-2">
          <label className="text-[11px] text-slate-500 mb-1">日期范围（采购单创建时间）</label>
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

        {/* 仓库（下拉） */}
        <div className="flex flex-col">
          <label className="text-[11px] text-slate-500">仓库</label>
          <select
            className="mt-1 rounded-md border border-slate-300 px-2 py-1"
            value={toIntOrEmpty(filters.warehouseId)}
            onChange={(e) => onChangeFilter("warehouseId", safeStr(e.target.value))}
          >
            <option value="">全部</option>
            {warehouseOptions.map((w) => (
              <option key={w.id} value={String(w.id)}>
                {w.name}（#{w.id}）
              </option>
            ))}
          </select>
        </div>

        {/* 供应商（下拉） */}
        <div className="flex flex-col">
          <label className="text-[11px] text-slate-500">供应商</label>
          <select
            className="mt-1 rounded-md border border-slate-300 px-2 py-1"
            value={toIntOrEmpty(filters.supplierId)}
            onChange={(e) => onChangeFilter("supplierId", safeStr(e.target.value))}
          >
            <option value="">全部</option>
            {supplierOptions.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.name}（#{s.id}）
              </option>
            ))}
          </select>
        </div>

        {/* 状态 */}
        <div className="flex flex-col">
          <label className="text-[11px] text-slate-500">采购单状态</label>
          <select
            className="mt-1 rounded-md border border-slate-300 px-2 py-1"
            value={filters.status ?? ""}
            onChange={(e) => onChangeFilter("status", safeStr(e.target.value))}
          >
            <option value="">全部</option>
            <option value="CREATED">新建</option>
            <option value="PARTIAL">部分收货</option>
            <option value="RECEIVED">已收完</option>
            <option value="CLOSED">已关闭</option>
          </select>
        </div>

        {/* 商品名称查询（后端执行：suppliers/items/daily 均生效） */}
        <div className="flex flex-col md:col-span-3">
          <label className="text-[11px] text-slate-500">商品名称查询</label>
          <input
            className="mt-1 rounded-md border border-slate-300 px-2 py-1"
            placeholder="输入商品名/条码/SKU 关键词"
            value={filters.itemKeyword ?? ""}
            onChange={(e) => onChangeFilter("itemKeyword", safeStr(e.target.value))}
          />
          <div className="mt-1 text-[11px] text-slate-400">{itemKeywordHint}</div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {error ? <span className="text-xs text-red-600">{error}</span> : null}

        <button
          type="button"
          onClick={onReset}
          disabled={loading}
          className="rounded-md border border-slate-300 px-4 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-60"
        >
          重置
        </button>

        <button
          type="button"
          onClick={onQuery}
          disabled={loading}
          className="rounded-md border border-slate-300 px-4 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-60"
        >
          {loading ? "查询中…" : "查询"}
        </button>
      </div>
    </section>
  );
};
