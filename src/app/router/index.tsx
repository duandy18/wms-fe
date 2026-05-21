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
        <Route path="/sso/callback" element={<P.SsoCallbackPage />} />

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
            path="shipping-assist/handoffs"
            element={
              <RequirePermission permission="page.shipping_assist.read">
                <Navigate to="/shipping-assist/handoffs/status" replace />
              </RequirePermission>
            }
          />

          <Route
            path="shipping-assist/handoffs/status"
            element={
              <RequirePermission permission="page.shipping_assist.read">
                <P.ShippingHandoffPage />
              </RequirePermission>
            }
          />

          <Route
            path="shipping-assist/handoffs/payload"
            element={
              <RequirePermission permission="page.shipping_assist.read">
                <P.ShippingHandoffPage />
              </RequirePermission>
            }
          />

          <Route
            path="shipping-assist/records"
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
            path="oms"
            element={<Navigate to="/oms/order-projection" replace />}
          />
          <Route
            path="oms/order-projection"
            element={
              <RequirePermission permission="page.oms.read">
                <P.OmsOrderProjectionPage />
              </RequirePermission>
            }
          />
          <Route
            path="oms/line-projection"
            element={
              <RequirePermission permission="page.oms.read">
                <P.OmsLineProjectionPage />
              </RequirePermission>
            }
          />
          <Route
            path="oms/component-projection"
            element={
              <RequirePermission permission="page.oms.read">
                <P.OmsComponentProjectionPage />
              </RequirePermission>
            }
          />

          <Route
            path="pms/item-projection"
            element={
              <RequirePermission permission="page.pms.read">
                <P.PmsItemProjectionPage />
              </RequirePermission>
            }
          />
          <Route
            path="pms/supplier-projection"
            element={
              <RequirePermission permission="page.pms.read">
                <P.PmsSupplierProjectionPage />
              </RequirePermission>
            }
          />
          <Route
            path="pms/uom-projection"
            element={
              <RequirePermission permission="page.pms.read">
                <P.PmsUomProjectionPage />
              </RequirePermission>
            }
          />
          <Route
            path="pms/sku-code-projection"
            element={
              <RequirePermission permission="page.pms.read">
                <P.PmsSkuCodeProjectionPage />
              </RequirePermission>
            }
          />
          <Route
            path="pms/barcode-projection"
            element={
              <RequirePermission permission="page.pms.read">
                <P.PmsBarcodeProjectionPage />
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
            path="partners/suppliers"
            element={
              <RequirePermission permission="page.partners.read">
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
