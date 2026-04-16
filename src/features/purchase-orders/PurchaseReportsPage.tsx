// 拆分说明：本文件已从“大一统页面”收薄为装配层；筛选、控制器、KPI、表格分别拆入 reports/api、reports/model、reports/components。路径：src/features/purchase-orders/PurchaseReportsPage.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../components/ui/PageTitle";
import PurchaseReportsFilters from "./reports/components/PurchaseReportsFilters";
import PurchaseReportsKpiCards from "./reports/components/PurchaseReportsKpiCards";
import PurchaseReportsTables from "./reports/components/PurchaseReportsTables";
import { usePurchaseReportsController } from "./reports/model/usePurchaseReportsController";

const PurchaseReportsPage: React.FC = () => {
  const c = usePurchaseReportsController();
  const navigate = useNavigate();

  return (
    <div className="p-8 space-y-6">
      <div className="space-y-3">
        <PageTitle
          title="采购报表"
          description="采购模块分析页。当前提供总览、按商品、按供应商、按日四种分析视角，并统一对接后端 /purchase-reports 接口。"
        />
        <p className="text-sm text-slate-600">
          当前页用于综合分析，不承载采购单录入或详情编辑。
        </p>
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-slate-700">
          <span className="font-medium text-slate-900">口径说明：</span>
          当前页所有金额均为计划金额，不是实际收货金额；跨商品比较请以最小单位数为准，采购数量仅作辅助展示。
        </div>
      </div>

      <PurchaseReportsFilters
        tab={c.tab}
        setTab={c.setTab}
        timeMode={c.timeMode}
        setTimeMode={c.setTimeMode}
        warehouseId={c.warehouseId}
        setWarehouseId={c.setWarehouseId}
        supplierId={c.supplierId}
        setSupplierId={c.setSupplierId}
        selectedItemId={c.selectedItemId}
        setSelectedItemId={c.setSelectedItemId}
        dateFrom={c.dateFrom}
        setDateFrom={c.setDateFrom}
        dateTo={c.dateTo}
        setDateTo={c.setDateTo}
        warehouses={c.warehouses}
        warehousesLoading={c.warehousesLoading}
        warehousesError={c.warehousesError}
        supplierOptions={c.supplierOptions}
        suppliersLoading={c.suppliersLoading}
        suppliersError={c.suppliersError}
        selectedSupplierId={c.selectedSupplierId}
        itemOptions={c.itemOptions}
        itemsLoading={c.itemsLoading}
        itemsError={c.itemsError}
        loading={c.loading}
        error={c.error}
        currentRowsCount={c.currentRowsCount}
      />

      <PurchaseReportsKpiCards summary={c.summary} />

      <PurchaseReportsTables
        tab={c.tab}
        loading={c.loading}
        itemsRows={c.itemsRows}
        supplierRows={c.supplierRows}
        dailyRows={c.dailyRows}
        expandedItemId={c.expandedItemId}
        itemLineRowsByItemId={c.itemLineRowsByItemId}
        itemLineLoadingItemId={c.itemLineLoadingItemId}
        onToggleItemExpand={c.toggleItemExpand}
        supplierIdFilter={c.supplierId}
        onOpenPurchaseOrder={(poId) => {
          navigate(`/purchase-orders/${poId}`);
        }}
      />
    </div>
  );
};

export default PurchaseReportsPage;
