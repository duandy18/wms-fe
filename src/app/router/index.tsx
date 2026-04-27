// src/app/router/index.tsx
// 应用路由总表：挂载业务页面与主数据页面

import React, { Suspense } from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";

import { AppLayout } from "../layout/AppLayout";
import {
  RequireAuth,
  RequirePermission,
  ForbiddenPage,
  RouteLoading,
} from "./guards";
import * as P from "./lazyPages";

/* 统一入口：收敛到“编辑快递网点”页 */
function RedirectToProviderEdit() {
  const { providerId } = useParams();
  if (!providerId) return <Navigate to="/shipping-assist/pricing/providers" replace />;
  return <Navigate to={`/shipping-assist/pricing/providers/${providerId}/edit`} replace />;
}

/* 路由入口 */
const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route path="/login" element={<P.LoginPage />} />

        <Route path="/forbidden" element={<ForbiddenPage />} />

        <Route
          path="/print/shipping-label"
          element={<P.ShippingLabelPrintPage />}
        />

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
            path="outbound/ship"
            element={
              <RequirePermission permission="page.shipping_assist.read">
                <Navigate to="/shipping-assist/shipping/quote" replace />
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
            path="platform-order-ingestion"
            element={
              <RequirePermission permission="page.platform_order_ingestion.read">
                <P.PlatformOrderIngestionOverviewPage />
              </RequirePermission>
            }
          />
          <Route
            path="platform-order-ingestion/pdd"
            element={
              <RequirePermission permission="page.platform_order_ingestion.read">
                <Navigate to="/platform-order-ingestion/pdd/collect" replace />
              </RequirePermission>
            }
          />
          <Route
            path="platform-order-ingestion/pdd/collect"
            element={
              <RequirePermission permission="page.platform_order_ingestion.read">
                <P.PddOrderCollectPage />
              </RequirePermission>
            }
          />
          <Route
            path="platform-order-ingestion/pdd/native-orders"
            element={
              <RequirePermission permission="page.platform_order_ingestion.read">
                <P.PddNativeOrdersPage />
              </RequirePermission>
            }
          />
          <Route
            path="platform-order-ingestion/taobao"
            element={
              <RequirePermission permission="page.platform_order_ingestion.read">
                <Navigate to="/platform-order-ingestion/taobao/collect" replace />
              </RequirePermission>
            }
          />
          <Route
            path="platform-order-ingestion/taobao/collect"
            element={
              <RequirePermission permission="page.platform_order_ingestion.read">
                <P.TaobaoOrderCollectPage />
              </RequirePermission>
            }
          />
          <Route
            path="platform-order-ingestion/taobao/native-orders"
            element={
              <RequirePermission permission="page.platform_order_ingestion.read">
                <P.TaobaoNativeOrdersPage />
              </RequirePermission>
            }
          />
          <Route
            path="platform-order-ingestion/jd"
            element={
              <RequirePermission permission="page.platform_order_ingestion.read">
                <Navigate to="/platform-order-ingestion/jd/collect" replace />
              </RequirePermission>
            }
          />
          <Route
            path="platform-order-ingestion/jd/collect"
            element={
              <RequirePermission permission="page.platform_order_ingestion.read">
                <P.JdOrderCollectPage />
              </RequirePermission>
            }
          />
          <Route
            path="platform-order-ingestion/jd/native-orders"
            element={
              <RequirePermission permission="page.platform_order_ingestion.read">
                <P.JdNativeOrdersPage />
              </RequirePermission>
            }
          />

          <Route
            path="shipping-assist/shipping/quote"
            element={
              <RequirePermission permission="page.shipping_assist.read">
                <P.ShipmentPreparePage />
              </RequirePermission>
            }
          />
          <Route
            path="shipping-assist/shipping/quote/workbench"
            element={
              <RequirePermission permission="page.shipping_assist.read">
                <P.ShipmentCockpitPage />
              </RequirePermission>
            }
          />
          <Route
            path="shipping-assist/pricing/bindings"
            element={
              <RequirePermission permission="page.shipping_assist.read">
                <P.PricingPage />
              </RequirePermission>
            }
          />
          <Route
            path="shipping-assist/pricing/templates"
            element={
              <RequirePermission permission="page.shipping_assist.read">
                <P.TemplatesPage />
              </RequirePermission>
            }
          />
          <Route
            path="shipping-assist/pricing/templates/:templateId"
            element={
              <RequirePermission permission="page.shipping_assist.read">
                <P.TemplateWorkbenchPage />
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
            path="shipping-assist/billing/items"
            element={
              <RequirePermission permission="page.shipping_assist.read">
                <P.BillingItemsPage />
              </RequirePermission>
            }
          />
          <Route
            path="shipping-assist/billing/reconciliation"
            element={
              <RequirePermission permission="page.shipping_assist.read">
                <P.ReconciliationPage />
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
            path="item-barcodes"
            element={
              <RequirePermission permission="page.pms.read">
                <P.ItemBarcodesPage />
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

          <Route
            path="shipping-assist/pricing/providers"
            element={
              <RequirePermission permission="page.shipping_assist.read">
                <P.ShippingProvidersListPage />
              </RequirePermission>
            }
          />

          <Route
            path="shipping-assist/settings/waybill"
            element={
              <RequirePermission permission="page.shipping_assist.read">
                <P.ElectronicWaybillConfigPage />
              </RequirePermission>
            }
          />

          <Route
            path="shipping-assist/pricing/providers/:providerId"
            element={
              <RequirePermission permission="page.shipping_assist.read">
                <RedirectToProviderEdit />
              </RequirePermission>
            }
          />

          <Route
            path="shipping-assist/pricing/providers/new"
            element={
              <RequirePermission permission="page.shipping_assist.read">
                <P.ShippingProviderEditPage />
              </RequirePermission>
            }
          />

          <Route
            path="shipping-assist/pricing/providers/:providerId/edit"
            element={
              <RequirePermission permission="page.shipping_assist.read">
                <P.ShippingProviderEditPage />
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
