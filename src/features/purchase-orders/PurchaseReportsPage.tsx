// src/features/purchase-orders/PurchaseReportsPage.tsx

import React, { useEffect, useMemo } from "react";
import PageTitle from "../../components/ui/PageTitle";
import { usePurchaseReportsPresenter } from "./usePurchaseReportsPresenter";
import { PurchaseReportsFilters } from "./PurchaseReportsFilters";
import { SuppliersReportTable } from "./SuppliersReportTable";
import { ItemsReportTable } from "./ItemsReportTable";
import { DailyReportTable } from "./DailyReportTable";
import type { PurchaseReportFilters } from "./reportsApi";

const parseMoney = (v: string | null | undefined): number => {
  if (!v) return 0;
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
};

const PurchaseReportsPage: React.FC = () => {
  const [state, actions] = usePurchaseReportsPresenter();

  const handleChangeFilter = (
    field: keyof PurchaseReportFilters,
    value: string,
  ) => {
    actions.setFilters((prev) => {
      const next: PurchaseReportFilters = { ...prev };
      if (field === "warehouseId" || field === "supplierId") {
        const n = value.trim() ? Number(value.trim()) : undefined;
        next[field] =
          n !== undefined && !Number.isNaN(n) ? n : undefined;
      } else if (field === "status") {
        next.status = value || undefined;
      } else if (field === "dateFrom" || field === "dateTo") {
        next[field] = value || undefined;
      }
      return next;
    });
  };

  const handleQuickRange = (kind: "thisMonth" | "thisWeek") => {
    actions.setFilters((prev) => {
      const next: PurchaseReportFilters = { ...prev };

      const today = new Date();
      const pad2 = (n: number) => String(n).padStart(2, "0");
      const toYMD = (d: Date) =>
        `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(
          d.getDate(),
        )}`;

      if (kind === "thisMonth") {
        const from = new Date(
          today.getFullYear(),
          today.getMonth(),
          1,
        );
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

  useEffect(() => {
    void actions.loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void actions.loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.activeTab]);

  const supplierTotalAmount = useMemo(
    () =>
      state.supplierRows.reduce(
        (sum, r) => sum + parseMoney(r.total_amount),
        0,
      ),
    [state.supplierRows],
  );

  const itemTotalAmount = useMemo(
    () =>
      state.itemRows.reduce(
        (sum, r) => sum + parseMoney(r.total_amount),
        0,
      ),
    [state.itemRows],
  );

  const dailyTotalAmount = useMemo(
    () =>
      state.dailyRows.reduce(
        (sum, r) => sum + parseMoney(r.total_amount),
        0,
      ),
    [state.dailyRows],
  );

  return (
    <div className="p-6 space-y-6">
      <PageTitle
        title="采购报表"
        description="从供应商、商品、时间三个视角查看采购历史，所有金额统一按“件数 × 每件数量 × 最小单位采购单价”计算。"
      />

      <PurchaseReportsFilters
        filters={state.filters}
        loading={state.loading}
        error={state.error}
        onChangeFilter={handleChangeFilter}
        onQuickRange={handleQuickRange}
        onRefresh={() => void actions.loadReports()}
      />

      <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
        {/* segmented control 风格 Tab */}
        <div className="flex items-center justify-between">
          <div className="inline-flex rounded-full bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => actions.setActiveTab("suppliers")}
              className={
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors " +
                (state.activeTab === "suppliers"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:bg-slate-200/70")
              }
            >
              按供应商
            </button>
            <button
              type="button"
              onClick={() => actions.setActiveTab("items")}
              className={
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors " +
                (state.activeTab === "items"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:bg-slate-200/70")
              }
            >
              按商品
            </button>
            <button
              type="button"
              onClick={() => actions.setActiveTab("daily")}
              className={
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors " +
                (state.activeTab === "daily"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:bg-slate-200/70")
              }
            >
              按日期（日汇总）
            </button>
          </div>
        </div>

        {/* 内容区 */}
        {state.activeTab === "suppliers" && (
          <SuppliersReportTable
            rows={state.supplierRows}
            totalAmount={supplierTotalAmount}
          />
        )}

        {state.activeTab === "items" && (
          <ItemsReportTable
            rows={state.itemRows}
            totalAmount={itemTotalAmount}
          />
        )}

        {state.activeTab === "daily" && (
          <DailyReportTable
            rows={state.dailyRows}
            totalAmount={dailyTotalAmount}
          />
        )}
      </section>
    </div>
  );
};

export default PurchaseReportsPage;
