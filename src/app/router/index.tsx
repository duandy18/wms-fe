// src/app/router/index.tsx
// 应用路由总表：挂载业务页面与主数据页面

import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { AppLayout } from "../layout/AppLayout";
import {
  RequireAuth,
  RequirePermission,
  ForbiddenPage,
  RouteLoading,
} from "./guards";
import * as P from "./lazyPages";

/* 路由入口 */
const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route path="/login" element={<P.LoginPage />} />

        <Route path="/forbidden" element={<ForbiddenPage />} />

        <Route
          path="/"
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route
            index
            element={
              <RequirePermission permission="page.wms.read">
                <P.InventoryPage />
              </RequirePermission>
            }
          />

          <Route
            path="inbound"
            element={
              <RequirePermission permission="page.wms.read">
                <Navigate to="/receiving" replace />
              </RequirePermission>
            }
          />
          <Route
            path="inbound/cockpit"
            element={
              <RequirePermission permission="page.wms.read">
                <Navigate to="/inbound-receipts" replace />
              </RequirePermission>
            }
          />
          <Route
            path="outbound"
            element={
              <RequirePermission permission="page.wms.read">
                <Navigate to="/outbound/summary" replace />
              </RequirePermission>
            }
          />
          <Route
            path="outbound/summary"
            element={
              <RequirePermission permission="page.wms.read">
                <P.OutboundSummaryPage />
              </RequirePermission>
            }
          />
          <Route
            path="outbound/order"
            element={
              <RequirePermission permission="page.wms.read">
                <P.OutboundOrderPage />
              </RequirePermission>
            }
          />
          <Route
            path="outbound/manual-docs"
            element={
              <RequirePermission permission="page.wms.read">
                <P.OutboundManualDocsPage />
              </RequirePermission>
            }
          />
          <Route
            path="outbound/manual"
            element={
              <RequirePermission permission="page.wms.read">
                <P.OutboundManualPage />
              </RequirePermission>
            }
          />

          <Route
            path="inventory"
            element={
              <RequirePermission permission="page.wms.read">
                <P.InventoryPage />
              </RequirePermission>
            }
          />
          <Route
            path="inventory/ledger"
            element={
              <RequirePermission permission="page.wms.read">
                <P.InventoryLedgerPage />
              </RequirePermission>
            }
          />

          <Route
            path="inventory-adjustment"
            element={
              <RequirePermission permission="page.wms.read">
                <P.InventoryAdjustmentSummaryPage />
              </RequirePermission>
            }
          />
          <Route
            path="inventory-adjustment/count"
            element={
              <RequirePermission permission="page.wms.read">
                <P.InventoryCountPage />
              </RequirePermission>
            }
          />
          <Route
            path="inventory-adjustment/inbound-reversal"
            element={
              <RequirePermission permission="page.wms.read">
                <P.InventoryInboundReversalPage />
              </RequirePermission>
            }
          />
          <Route
            path="inventory-adjustment/outbound-reversal"
            element={
              <RequirePermission permission="page.wms.read">
                <P.InventoryOutboundReversalPage />
              </RequirePermission>
            }
          />

          <Route
            path="analytics"
            element={
              <RequirePermission permission="operations.outbound">
                <P.AnalyticsPage />
              </RequirePermission>
            }
          />

          <Route
            path="oms"
            element={
              <RequirePermission permission="page.oms.read">
                <Navigate to="/oms/pdd" replace />
              </RequirePermission>
            }
          />

          <Route
            path="oms/pdd"
            element={
              <RequirePermission permission="page.oms.read">
                <P.OmsPddPlatformOrderMirrorPage />
              </RequirePermission>
            }
          />
          <Route
            path="oms/pdd/platform-order-mirror"
            element={
              <RequirePermission permission="page.oms.read">
                <P.OmsPddPlatformOrderMirrorPage />
              </RequirePermission>
            }
          />
          <Route
            path="oms/pdd/code-mapping"
            element={
              <RequirePermission permission="page.oms.read">
                <P.OmsPddCodeMappingPage />
              </RequirePermission>
            }
          />

          <Route
            path="oms/taobao"
            element={
              <RequirePermission permission="page.oms.read">
                <P.OmsTaobaoPlatformOrderMirrorPage />
              </RequirePermission>
            }
          />
          <Route
            path="oms/taobao/platform-order-mirror"
            element={
              <RequirePermission permission="page.oms.read">
                <P.OmsTaobaoPlatformOrderMirrorPage />
              </RequirePermission>
            }
          />
          <Route
            path="oms/taobao/code-mapping"
            element={
              <RequirePermission permission="page.oms.read">
                <P.OmsTaobaoCodeMappingPage />
              </RequirePermission>
            }
          />

          <Route
            path="oms/jd"
            element={
              <RequirePermission permission="page.oms.read">
                <P.OmsJdPlatformOrderMirrorPage />
              </RequirePermission>
            }
          />
          <Route
            path="oms/jd/platform-order-mirror"
            element={
              <RequirePermission permission="page.oms.read">
                <P.OmsJdPlatformOrderMirrorPage />
              </RequirePermission>
            }
          />
          <Route
            path="oms/jd/code-mapping"
            element={
              <RequirePermission permission="page.oms.read">
                <P.OmsJdCodeMappingPage />
              </RequirePermission>
            }
          />

          <Route
            path="shipping-assist/shipping/records"
            element={
              <RequirePermission permission="page.shipping_assist.read">
                <P.ShippingLedgerPage />
              </RequirePermission>
            }
          />


          <Route
            path="finance"
            element={
              <RequirePermission permission="page.finance.read">
                <P.FinanceOverviewPage />
              </RequirePermission>
            }
          />
          <Route
            path="finance/order-sales"
            element={
              <RequirePermission permission="page.finance.read">
                <P.FinanceOrderSalesPage />
              </RequirePermission>
            }
          />
          <Route
            path="finance/purchase-costs"
            element={
              <RequirePermission permission="page.finance.read">
                <P.FinancePurchaseCostPage />
              </RequirePermission>
            }
          />
          <Route
            path="finance/shipping-costs"
            element={
              <RequirePermission permission="page.finance.read">
                <P.FinanceShippingCostPage />
              </RequirePermission>
            }
          />

          <Route
            path="admin/users"
            element={
              <RequirePermission permission="page.admin.read">
                <P.UsersManagePage />
              </RequirePermission>
            }
          />

          <Route
            path="purchase-orders"
            element={
              <RequirePermission permission="page.procurement.read">
                <P.PurchaseOrdersPage />
              </RequirePermission>
            }
          />
          <Route
            path="purchase-orders/new"
            element={
              <RequirePermission permission="page.procurement.read">
                <P.PurchaseOrderCreatePage />
              </RequirePermission>
            }
          />

          <Route
            path="purchase-orders/:poId"
            element={
              <RequirePermission permission="page.procurement.read">
                <P.PurchaseOrderViewPage />
              </RequirePermission>
            }
          />

          <Route
            path="purchase-reports"
            element={
              <RequirePermission permission="page.procurement.read">
                <P.PurchaseReportsPage />
              </RequirePermission>
            }
          />

          <Route
            path="inbound-receipts"
            element={
              <RequirePermission permission="page.inbound.read">
                <P.InboundReceiptsSummaryPage />
              </RequirePermission>
            }
          />
          <Route
            path="inbound-receipts/purchase"
            element={
              <RequirePermission permission="page.inbound.read">
                <P.InboundReceiptsPurchasePage />
              </RequirePermission>
            }
          />
          <Route
            path="inbound-receipts/manual"
            element={
              <RequirePermission permission="page.inbound.read">
                <P.InboundReceiptsManualPage />
              </RequirePermission>
            }
          />
          <Route
            path="receiving"
            element={
              <RequirePermission permission="page.wms.read">
                <P.ReceivingSummaryPage />
              </RequirePermission>
            }
          />
          <Route
            path="receiving/purchase"
            element={
              <RequirePermission permission="page.wms.read">
                <P.ReceivingPurchasePage />
              </RequirePermission>
            }
          />
          <Route
            path="receiving/manual"
            element={
              <RequirePermission permission="page.wms.read">
                <P.ReceivingManualPage />
              </RequirePermission>
            }
          />
          <Route
            path="receiving/:receiptNo"
            element={
              <RequirePermission permission="page.wms.read">
                <P.ReceivingTaskPage />
              </RequirePermission>
            }
          />
          <Route
            path="return-tasks/:taskId"
            element={
              <RequirePermission permission="page.wms.read">
                <P.ReturnTaskDetailPage />
              </RequirePermission>
            }
          />

          <Route
            path="warehouses"
            element={
              <RequirePermission permission="page.wms.read">
                <P.WarehousesListPage />
              </RequirePermission>
            }
          />
          <Route
            path="warehouses/new"
            element={
              <RequirePermission permission="page.wms.read">
                <P.WarehouseCreatePage />
              </RequirePermission>
            }
          />
          <Route
            path="warehouses/:warehouseId"
            element={
              <RequirePermission permission="page.wms.read">
                <P.WarehouseDetailPage />
              </RequirePermission>
            }
          />

          <Route
            path="items"
            element={
              <RequirePermission permission="page.pms.read">
                <P.ItemsPage />
              </RequirePermission>
            }
          />

          <Route
            path="pms/brands"
            element={
              <RequirePermission permission="page.pms.read">
                <P.PmsBrandsPage />
              </RequirePermission>
            }
          />

          <Route
            path="pms/categories"
            element={
              <RequirePermission permission="page.pms.read">
                <P.PmsCategoriesPage />
              </RequirePermission>
            }
          />

          <Route
            path="pms/item-attribute-defs"
            element={
              <RequirePermission permission="page.pms.read">
                <P.PmsAttributeDefsPage />
              </RequirePermission>
            }
          />

          <Route
            path="item-uoms"
            element={
              <RequirePermission permission="page.pms.read">
                <P.PmsItemUomsPage />
              </RequirePermission>
            }
          />

          <Route
            path="item-barcodes"
            element={
              <RequirePermission permission="page.pms.read">
                <P.ItemBarcodesPage />
              </RequirePermission>
            }
          />

          <Route
            path="items/sku-coding"
            element={
              <RequirePermission permission="page.pms.read">
                <P.SkuCodingGeneratorPage />
              </RequirePermission>
            }
          />

          <Route
            path="oms/fskus"
            element={
              <RequirePermission permission="page.oms.read">
                <P.OmsFskuRulesPage />
              </RequirePermission>
            }
          />

          <Route
            path="suppliers"
            element={
              <RequirePermission permission="page.pms.read">
                <P.SuppliersListPage />
              </RequirePermission>
            }
          />




        </Route>

        <Route path="*" element={<Navigate to="/inventory" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
