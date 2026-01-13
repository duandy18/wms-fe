// src/features/purchase-orders/PurchaseReportsPage.tsx

import React, { useEffect, useMemo, useRef } from "react";
import PageTitle from "../../components/ui/PageTitle";
import { usePurchaseReportsPresenter } from "./usePurchaseReportsPresenter";
import { PurchaseReportsFilters } from "./PurchaseReportsFilters";
import { SuppliersReportTable } from "./SuppliersReportTable";
import { ItemsReportTable } from "./ItemsReportTable";
import { DailyReportTable } from "./DailyReportTable";
import type {
  PurchaseReportFilters,
  SupplierReportRow,
  DailyReportRow,
} from "./reportsApi";

const parseMoney = (v: string | null | undefined): number => {
  if (!v) return 0;
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
};

const PurchaseReportsPage: React.FC = () => {
  const [state, actions] = usePurchaseReportsPresenter();

  // ✅ 自动查询：首次进入 + 切换 tab 都会查一次
  // 只依赖 activeTab（避免输入框每次变化都自动打 API；仍然保留“查询”按钮）
  const tabAutoLoadBootRef = useRef(false);
  useEffect(() => {
    if (!tabAutoLoadBootRef.current) {
      tabAutoLoadBootRef.current = true;
      void actions.loadReports();
      return;
    }
    void actions.loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.activeTab]);

  const handleChangeFilter = (field: keyof PurchaseReportFilters, value: string) => {
    actions.setFilters((prev) => {
      const next: PurchaseReportFilters = { ...prev };

      if (field === "warehouseId" || field === "supplierId") {
        const n = value.trim() ? Number(value.trim()) : undefined;
        next[field] = n !== undefined && !Number.isNaN(n) ? n : undefined;
        return next;
      }

      if (field === "status") {
        next.status = value || undefined;
        return next;
      }

      if (field === "dateFrom" || field === "dateTo") {
        next[field] = value || undefined;
        return next;
      }

      if (field === "itemKeyword") {
        next.itemKeyword = value || undefined;
        return next;
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

  const supplierTotalAmount = useMemo(
    () => state.supplierRows.reduce((sum, r) => sum + parseMoney(r.total_amount), 0),
    [state.supplierRows],
  );

  const itemTotalAmount = useMemo(
    () => state.itemRows.reduce((sum, r) => sum + parseMoney(r.total_amount), 0),
    [state.itemRows],
  );

  const dailyTotalAmount = useMemo(
    () => state.dailyRows.reduce((sum, r) => sum + parseMoney(r.total_amount), 0),
    [state.dailyRows],
  );

  // ---- drill-down：供应商/日期 → 自动切到按商品，并填过滤条件（切 tab 后会自动 load）----
  const drilldownToItemsBySupplier = (row: SupplierReportRow) => {
    actions.setFilters((prev) => ({
      ...prev,
      supplierId: row.supplier_id ?? undefined,
    }));
    actions.setActiveTab("items");
  };

  const drilldownToItemsByDay = (row: DailyReportRow) => {
    actions.setFilters((prev) => ({
      ...prev,
      dateFrom: row.day,
      dateTo: row.day,
    }));
    actions.setActiveTab("items");
  };

  return (
    <div className="p-6 space-y-6">
      <PageTitle
        title="采购报表"
        description="口径：金额=Σ(采购单行 line_amount)，line_amount=qty_ordered×units_per_case×supply_price；平均单价=金额/折算最小单位数。"
      />

      <PurchaseReportsFilters
        activeTab={state.activeTab}
        filters={state.filters}
        loading={state.loading}
        error={state.error}
        onChangeFilter={handleChangeFilter}
        onQuickRange={handleQuickRange}
        onQuery={() => void actions.loadReports()}
        onReset={() => actions.resetFilters()}
      />

      <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
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

          <div className="text-[11px] text-slate-500">
            提示：点击「供应商/日期」行可下钻到「按商品」明细
          </div>
        </div>

        {state.activeTab === "suppliers" && (
          <SuppliersReportTable
            rows={state.supplierRows}
            totalAmount={supplierTotalAmount}
            onDrilldown={drilldownToItemsBySupplier}
          />
        )}

        {state.activeTab === "items" && (
          <ItemsReportTable rows={state.itemRows} totalAmount={itemTotalAmount} />
        )}

        {state.activeTab === "daily" && (
          <DailyReportTable
            rows={state.dailyRows}
            totalAmount={dailyTotalAmount}
            onDrilldown={drilldownToItemsByDay}
          />
        )}
      </section>
    </div>
  );
};

export default PurchaseReportsPage;
