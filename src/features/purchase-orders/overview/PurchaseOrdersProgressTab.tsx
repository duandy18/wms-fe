// src/features/purchase-orders/overview/PurchaseOrdersProgressTab.tsx

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { PurchaseOrdersTable } from "../PurchaseOrdersTable";
import {
  usePurchaseOrdersListPresenter,
  type StatusFilter,
} from "../usePurchaseOrdersListPresenter";
import type { PurchaseOrderListItem } from "../api";
import { calcPurchaseKpi } from "./utils";

export const PurchaseOrdersProgressTab: React.FC = () => {
  const navigate = useNavigate();

  const [
    { orders, loadingList, listError, supplierFilter, statusFilter },
    { setSupplierFilter, setStatusFilter, reload },
  ] = usePurchaseOrdersListPresenter();

  const [selectedPoId, setSelectedPoId] = useState<number | null>(null);

  const kpi = useMemo(() => calcPurchaseKpi(orders as PurchaseOrderListItem[]), [orders]);

  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-sm font-semibold text-slate-800">进度盘</h2>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* 这里暂时沿用旧的 supplierFilter（字符串）。下一刀再做 id 化 */}
          <input
            className="w-56 rounded-md border border-slate-300 px-2 py-1"
            placeholder="供应商关键字（临时）"
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
          />

          <select
            className="w-32 rounded-md border border-slate-300 px-2 py-1"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          >
            <option value="ALL">全部状态</option>
            <option value="CREATED">新建</option>
            <option value="PARTIAL">部分收货</option>
            <option value="RECEIVED">已收货</option>
            <option value="CLOSED">已关闭</option>
          </select>

          <button
            type="button"
            onClick={reload}
            disabled={loadingList}
            className="rounded-md border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50 disabled:opacity-60"
          >
            {loadingList ? "查询中…" : "刷新"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/purchase-orders/new-v2")}
            className="rounded-md bg-slate-900 px-3 py-1 text-xs text-white hover:bg-slate-800"
          >
            新建采购单
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
        <div className="rounded-lg border border-slate-200 p-3">
          <div className="text-slate-500 text-[11px]">总单数</div>
          <div className="text-lg font-semibold">{kpi.total}</div>
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <div className="text-slate-500 text-[11px]">进行中</div>
          <div className="text-lg font-semibold">{kpi.doing}</div>
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <div className="text-slate-500 text-[11px]">已完成</div>
          <div className="text-lg font-semibold">{kpi.done}</div>
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <div className="text-slate-500 text-[11px]">新建</div>
          <div className="text-lg font-semibold">{kpi.created}</div>
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <div className="text-slate-500 text-[11px]">部分收货</div>
          <div className="text-lg font-semibold">{kpi.partial}</div>
        </div>
      </div>

      <PurchaseOrdersTable
        orders={orders}
        loading={loadingList}
        error={listError}
        onRowClick={(id) => {
          setSelectedPoId(id);
          navigate(`/purchase-orders/${id}`);
        }}
        selectedPoId={selectedPoId}
      />

      <div className="text-[11px] text-slate-500">
        提示：进度盘是“计划视图”（PO 状态）。如需从事实角度复盘金额/数量，请切到【采购统计】并选择口径。
      </div>
    </section>
  );
};
