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
  if (!providerId) return <Navigate to="/tms/providers" replace />;
  return <Navigate to={`/tms/providers/${providerId}/edit`} replace />;
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
              <RequirePermission permission="page.wms.inventory.read">
                <P.SnapshotPage />
              </RequirePermission>
            }
          />

          <Route
            path="inbound"
            element={
              <RequirePermission permission="page.wms.inbound.read">
                <P.InboundCockpitPage />
              </RequirePermission>
            }
          />
          <Route
            path="inbound/cockpit"
            element={
              <RequirePermission permission="page.wms.inbound.read">
                <P.InboundCockpitPage />
              </RequirePermission>
            }
          />
          <Route
            path="count"
            element={
              <RequirePermission permission="page.wms.internal_ops.read">
                <P.CountCockpitPage />
              </RequirePermission>
            }
          />
          <Route
            path="outbound/pick-tasks"
            element={
              <RequirePermission permission="page.wms.order_outbound.read">
                <P.PickTasksCockpitPage />
              </RequirePermission>
            }
          />
          <Route
            path="outbound/ship"
            element={
              <RequirePermission permission="page.wms.logistics.read">
                <Navigate to="/tms/shipment-prepare" replace />
              </RequirePermission>
            }
          />
          <Route
            path="outbound/internal-outbound"
            element={
              <RequirePermission permission="page.wms.internal_ops.read">
                <P.InternalOutboundPage />
              </RequirePermission>
            }
          />

          <Route
            path="outbound/dashboard"
            element={
              <RequirePermission permission="page.wms.order_outbound.read">
                <P.OutboundDashboardPage />
              </RequirePermission>
            }
          />
          <Route
            path="inventory/outbound-dashboard"
            element={<Navigate to="/outbound/dashboard" replace />}
          />

          <Route
            path="snapshot"
            element={
              <RequirePermission permission="page.wms.inventory.read">
                <P.SnapshotPage />
              </RequirePermission>
            }
          />
          <Route
            path="inventory/ledger"
            element={
              <RequirePermission permission="page.wms.inventory.read">
                <P.StockLedgerPage />
              </RequirePermission>
            }
          />

          <Route
            path="orders"
            element={<Navigate to="/oms/pdd/orders" replace />}
          />
          <Route
            path="shops"
            element={<Navigate to="/oms/pdd/stores" replace />}
          />

          <Route
            path="platforms"
            element={<Navigate to="/oms/pdd/stores" replace />}
          />
          <Route
            path="platforms/:storeId"
            element={<Navigate to="/oms/pdd/stores" replace />}
          />
          <Route
            path="shop-bundles"
            element={<Navigate to="/oms/pdd/orders" replace />}
          />
          <Route
            path="parsing"
            element={<Navigate to="/oms/pdd/orders" replace />}
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
            path="oms/pdd/stores"
            element={
              <RequirePermission permission="page.wms.order_management.read">
                <P.PddStoresPage />
              </RequirePermission>
            }
          />
          <Route
            path="oms/pdd/orders"
            element={
              <RequirePermission permission="page.wms.order_management.read">
                <P.PddOrdersPage />
              </RequirePermission>
            }
          />
          <Route
            path="oms/pdd/orders/:pddOrderId"
            element={
              <RequirePermission permission="page.wms.order_management.read">
                <P.PddOrderDetailPage />
              </RequirePermission>
            }
          />
          <Route
            path="oms/taobao/stores"
            element={
              <RequirePermission permission="page.wms.order_management.read">
                <P.TaobaoStoresPage />
              </RequirePermission>
            }
          />
          <Route
            path="oms/taobao/orders"
            element={
              <RequirePermission permission="page.wms.order_management.read">
                <P.TaobaoOrdersPage />
              </RequirePermission>
            }
          />
          <Route
            path="oms/taobao/orders/:taobaoOrderId"
            element={
              <RequirePermission permission="page.wms.order_management.read">
                <P.TaobaoOrderDetailPage />
              </RequirePermission>
            }
          />
          <Route
            path="oms/jd/stores"
            element={
              <RequirePermission permission="page.wms.order_management.read">
                <P.JdStoresPage />
              </RequirePermission>
            }
          />
          <Route
            path="oms/jd/orders"
            element={
              <RequirePermission permission="page.wms.order_management.read">
                <P.JdOrdersPage />
              </RequirePermission>
            }
          />
          <Route
            path="oms/jd/orders/:jdOrderId"
            element={
              <RequirePermission permission="page.wms.order_management.read">
                <P.JdOrderDetailPage />
              </RequirePermission>
            }
          />
          <Route
            path="tms/shipment-prepare"
            element={
              <RequirePermission permission="page.wms.logistics.read">
                <P.ShipmentPreparePage />
              </RequirePermission>
            }
          />
          <Route
            path="tms/dispatch"
            element={
              <RequirePermission permission="page.wms.logistics.read">
                <P.ShipmentCockpitPage />
              </RequirePermission>
            }
          />
          <Route
            path="tms/pricing"
            element={
              <RequirePermission permission="page.wms.logistics.read">
                <P.PricingPage />
              </RequirePermission>
            }
          />
          <Route
            path="tms/templates"
            element={
              <RequirePermission permission="page.wms.logistics.read">
                <P.TemplatesPage />
              </RequirePermission>
            }
          />
          <Route
            path="tms/templates/:templateId"
            element={
              <RequirePermission permission="page.wms.logistics.read">
                <P.TemplateWorkbenchPage />
              </RequirePermission>
            }
          />
          <Route
            path="tms/reports"
            element={
              <RequirePermission permission="page.wms.logistics.read">
                <P.TransportReportsPage />
              </RequirePermission>
            }
          />
          <Route
            path="tms/records"
            element={
              <RequirePermission permission="page.wms.logistics.read">
                <P.ShippingLedgerPage />
              </RequirePermission>
            }
          />

          <Route
            path="tms/billing/items"
            element={
              <RequirePermission permission="page.wms.logistics.read">
                <P.BillingItemsPage />
              </RequirePermission>
            }
          />
          <Route
            path="tms/reconciliation"
            element={
              <RequirePermission permission="page.wms.logistics.read">
                <P.ReconciliationPage />
              </RequirePermission>
            }
          />

          <Route
            path="finance"
            element={
              <RequirePermission permission="page.wms.analytics.read">
                <P.FinanceOverviewPage />
              </RequirePermission>
            }
          />
          <Route
            path="finance/overview"
            element={
              <RequirePermission permission="page.wms.analytics.read">
                <P.FinanceOverviewPage />
              </RequirePermission>
            }
          />
          <Route
            path="finance/shop"
            element={
              <RequirePermission permission="page.wms.analytics.read">
                <P.FinanceShopPage />
              </RequirePermission>
            }
          />
          <Route
            path="finance/sku"
            element={
              <RequirePermission permission="page.wms.analytics.read">
                <P.FinanceSkuPage />
              </RequirePermission>
            }
          />
          <Route
            path="finance/order-unit"
            element={
              <RequirePermission permission="page.wms.analytics.read">
                <P.FinanceOrderUnitPage />
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
            path="admin/permissions"
            element={
              <RequirePermission permission="page.admin.read">
                <P.PermissionsDictPage />
              </RequirePermission>
            }
          />

          <Route
            path="purchase-orders/overview"
            element={
              <RequirePermission permission="page.wms.inbound.read">
                <P.PurchaseOverviewPage />
              </RequirePermission>
            }
          />
          <Route
            path="purchase-orders"
            element={<Navigate to="/purchase-orders/overview" replace />}
          />
          <Route
            path="purchase-orders/reports"
            element={<Navigate to="/purchase-orders/overview" replace />}
          />

          <Route
            path="purchase-orders/new-v2"
            element={
              <RequirePermission permission="page.wms.inbound.read">
                <P.PurchaseOrderCreateV2Page />
              </RequirePermission>
            }
          />
          <Route
            path="purchase-orders/:poId"
            element={
              <RequirePermission permission="page.wms.inbound.read">
                <P.PurchaseOrderDetailPage />
              </RequirePermission>
            }
          />

          <Route
            path="receive-tasks/:taskId"
            element={
              <RequirePermission permission="operations.inbound">
                <P.ReceiveTaskDetailPage />
              </RequirePermission>
            }
          />
          <Route
            path="return-tasks/:taskId"
            element={
              <RequirePermission permission="operations.outbound">
                <P.ReturnTaskDetailPage />
              </RequirePermission>
            }
          />

          <Route
            path="warehouses"
            element={
              <RequirePermission permission="page.wms.masterdata.read">
                <P.WarehousesListPage />
              </RequirePermission>
            }
          />
          <Route
            path="warehouses/new"
            element={
              <RequirePermission permission="page.wms.masterdata.read">
                <P.WarehouseCreatePage />
              </RequirePermission>
            }
          />
          <Route
            path="warehouses/:warehouseId"
            element={
              <RequirePermission permission="page.wms.masterdata.read">
                <P.WarehouseDetailPage />
              </RequirePermission>
            }
          />

          <Route
            path="items"
            element={
              <RequirePermission permission="page.wms.masterdata.read">
                <P.ItemsPage />
              </RequirePermission>
            }
          />

          <Route
            path="suppliers"
            element={
              <RequirePermission permission="page.wms.masterdata.read">
                <P.SuppliersListPage />
              </RequirePermission>
            }
          />

          <Route
            path="tms/providers"
            element={
              <RequirePermission permission="page.wms.logistics.read">
                <P.ShippingProvidersListPage />
              </RequirePermission>
            }
          />

          <Route
            path="tms/waybill-configs"
            element={
              <RequirePermission permission="page.wms.logistics.read">
                <P.ElectronicWaybillConfigPage />
              </RequirePermission>
            }
          />

          <Route
            path="tms/providers/:providerId"
            element={
              <RequirePermission permission="page.wms.logistics.read">
                <RedirectToProviderEdit />
              </RequirePermission>
            }
          />

          <Route
            path="tms/providers/new"
            element={
              <RequirePermission permission="page.wms.logistics.read">
                <P.ShippingProviderEditPage />
              </RequirePermission>
            }
          />

          <Route
            path="tms/providers/:providerId/edit"
            element={
              <RequirePermission permission="page.wms.logistics.read">
                <P.ShippingProviderEditPage />
              </RequirePermission>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/snapshot" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
