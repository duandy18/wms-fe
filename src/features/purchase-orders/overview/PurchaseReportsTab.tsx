// src/features/purchase-orders/overview/PurchaseReportsTab.tsx

import React, { useEffect, useMemo } from "react";

import { PurchaseReportsFilters } from "../PurchaseReportsFilters";
import {
  usePurchaseReportsPresenter,
  type TabKey as ReportsTabKey,
} from "../usePurchaseReportsPresenter";
import { SuppliersReportTable } from "../SuppliersReportTable";
import { ItemsReportTable } from "../ItemsReportTable";
import { DailyReportTable } from "../DailyReportTable";
import type { PurchaseReportFilters, PurchaseReportsMode } from "../reportsApi";
import { parseMoney } from "./utils";

export const PurchaseReportsTab: React.FC = () => {
  const [repState, repActions] = usePurchaseReportsPresenter();
  const repMode: PurchaseReportsMode = repState.filters.mode ?? "fact";

  useEffect(() => {
    void repActions.loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void repActions.loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repState.activeTab]);

  const supplierTotalAmount = useMemo(
    () =>
      repState.supplierRows.reduce(
        (sum, r) => sum + parseMoney(r.total_amount),
        0,
      ),
    [repState.supplierRows],
  );

  const itemTotalAmount = useMemo(
    () =>
      repState.itemRows.reduce((sum, r) => sum + parseMoney(r.total_amount), 0),
    [repState.itemRows],
  );

  const dailyTotalAmount = useMemo(
    () =>
      repState.dailyRows.reduce(
        (sum, r) => sum + parseMoney(r.total_amount),
        0,
      ),
    [repState.dailyRows],
  );

  const handleChangeReportFilter = (field: keyof PurchaseReportFilters, value: string) => {
    repActions.setFilters((prev) => {
      const next: PurchaseReportFilters = { ...prev };

      if (field === "warehouseId" || field === "supplierId") {
        const n = value.trim() ? Number(value.trim()) : undefined;
        next[field] = n !== undefined && !Number.isNaN(n) ? n : undefined;

        if (field === "supplierId") {
          next.itemId = undefined;
          next.itemKeyword = undefined;
        }
      } else if (field === "status") {
        next.status = value || undefined;
      } else if (field === "dateFrom" || field === "dateTo") {
        next[field] = value || undefined;
      } else if (field === "itemKeyword") {
        next.itemKeyword = value || undefined;
        if (value && value.trim()) next.itemId = undefined;
      } else if (field === "itemId") {
        const n = value.trim() ? Number(value.trim()) : undefined;
        next.itemId = n !== undefined && !Number.isNaN(n) ? n : undefined;
        if (next.itemId != null) next.itemKeyword = undefined;
      } else if (field === "mode") {
        next.mode = value === "plan" ? "plan" : "fact";
      }

      return next;
    });
  };

  const handleQuickRange = (kind: "thisMonth" | "thisWeek") => {
    repActions.setFilters((prev) => {
      const next: PurchaseReportFilters = { ...prev };

      const today = new Date();
      const pad2 = (n: number) => String(n).padStart(2, "0");
      const toYMD = (d: Date) =>
        `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

      if (kind === "thisMonth") {
        const from = new Date(today.getFullYear(), today.getMonth(), 1);
        next.dateFrom = toYMD(from);
        next.dateTo = toYMD(today);
      } else {
        const day = today.getDay() || 7;
        const from = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - (day - 1),
        );
        next.dateFrom = toYMD(from);
        next.dateTo = toYMD(today);
      }

      return next;
    });
  };

  return (
    <>
      {/* 口径切换 */}
      <section className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="text-sm font-semibold text-slate-800">统计口径</div>
          <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs">
            <button
              type="button"
              onClick={() => {
                handleChangeReportFilter("mode", "fact");
                void repActions.loadReports();
              }}
              className={
                "px-3 py-1.5 rounded-full font-medium transition-colors " +
                (repMode === "fact"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:bg-slate-200/70")
              }
            >
              事实（收货）
            </button>
            <button
              type="button"
              onClick={() => {
                handleChangeReportFilter("mode", "plan");
                void repActions.loadReports();
              }}
              className={
                "px-3 py-1.5 rounded-full font-medium transition-colors " +
                (repMode === "plan"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:bg-slate-200/70")
              }
            >
              计划（下单）
            </button>
          </div>
        </div>

        <div className="mt-2 text-[11px] text-slate-500">
          {repMode === "fact"
            ? "事实口径：仅统计已发生的收货事实（Receipt）。未收货的采购单不会出现在汇总中。"
            : "计划口径：统计采购单（PO）下单计划，包含未收货记录。"}
        </div>
      </section>

      <PurchaseReportsFilters
        activeTab={repState.activeTab as ReportsTabKey}
        filters={repState.filters}
        loading={repState.loading}
        error={repState.error}
        onChangeFilter={handleChangeReportFilter}
        onQuickRange={handleQuickRange}
        onRefresh={() => void repActions.loadReports()}
      />

      <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="inline-flex rounded-full bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => repActions.setActiveTab("suppliers")}
              className={
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors " +
                (repState.activeTab === "suppliers"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:bg-slate-200/70")
              }
            >
              按供应商
            </button>
            <button
              type="button"
              onClick={() => repActions.setActiveTab("items")}
              className={
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors " +
                (repState.activeTab === "items"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:bg-slate-200/70")
              }
            >
              按商品
            </button>
            <button
              type="button"
              onClick={() => repActions.setActiveTab("daily")}
              className={
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors " +
                (repState.activeTab === "daily"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:bg-slate-200/70")
              }
            >
              按日期（日汇总）
            </button>
          </div>
        </div>

        {repState.activeTab === "suppliers" && (
          <SuppliersReportTable rows={repState.supplierRows} totalAmount={supplierTotalAmount} />
        )}
        {repState.activeTab === "items" && (
          <ItemsReportTable rows={repState.itemRows} totalAmount={itemTotalAmount} />
        )}
        {repState.activeTab === "daily" && (
          <DailyReportTable rows={repState.dailyRows} totalAmount={dailyTotalAmount} />
        )}
      </section>
    </>
  );
};
