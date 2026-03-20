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
              <RequirePermission permission="report.inventory">
                <P.SnapshotPage />
              </RequirePermission>
            }
          />

          <Route
            path="inbound"
            element={
              <RequirePermission permission="operations.inbound">
                <P.InboundCockpitPage />
              </RequirePermission>
            }
          />
          <Route
            path="inbound/cockpit"
            element={
              <RequirePermission permission="operations.inbound">
                <P.InboundCockpitPage />
              </RequirePermission>
            }
          />
          <Route
            path="count"
            element={
              <RequirePermission permission="operations.count">
                <P.CountCockpitPage />
              </RequirePermission>
            }
          />
          <Route
            path="outbound/pick-tasks"
            element={
              <RequirePermission permission="operations.outbound">
                <P.PickTasksCockpitPage />
              </RequirePermission>
            }
          />
          <Route
            path="outbound/ship"
            element={
              <RequirePermission permission="operations.outbound">
                <Navigate to="/tms/dispatch" replace />
              </RequirePermission>
            }
          />
          <Route
            path="outbound/internal-outbound"
            element={
              <RequirePermission permission="operations.internal_outbound">
                <P.InternalOutboundPage />
              </RequirePermission>
            }
          />

          <Route
            path="outbound/dashboard"
            element={
              <RequirePermission permission="report.outbound">
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
              <RequirePermission permission="report.inventory">
                <P.SnapshotPage />
              </RequirePermission>
            }
          />
          <Route
            path="inventory/ledger"
            element={
              <RequirePermission permission="report.inventory">
                <P.StockLedgerPage />
              </RequirePermission>
            }
          />

          <Route
            path="tms/dispatch"
            element={
              <RequirePermission permission="operations.outbound">
                <P.ShipmentCockpitPage />
              </RequirePermission>
            }
          />
          <Route
            path="tms/pricing"
            element={
              <RequirePermission permission="report.outbound">
                <P.PricingPage />
              </RequirePermission>
            }
          />
          <Route
            path="tms/pricing-templates/:schemeId"
            element={
              <RequirePermission permission="config.store.write">
                <P.PricingWorkbenchFlowPage />
              </RequirePermission>
            }
          />
          <Route
            path="tms/reports"
            element={
              <RequirePermission permission="report.outbound">
                <P.TransportReportsPage />
              </RequirePermission>
            }
          />
          <Route
            path="tms/records"
            element={
              <RequirePermission permission="report.outbound">
                <P.ShippingLedgerPage />
              </RequirePermission>
            }
          />

          <Route
            path="tms/billing/items"
            element={
              <RequirePermission permission="report.outbound">
                <P.BillingItemsPage />
              </RequirePermission>
            }
          />
          <Route
            path="tms/reconciliation"
            element={
              <RequirePermission permission="report.outbound">
                <P.ReconciliationPage />
              </RequirePermission>
            }
          />

          <Route
            path="finance"
            element={
              <RequirePermission permission="report.finance">
                <P.FinanceOverviewPage />
              </RequirePermission>
            }
          />
          <Route
            path="finance/overview"
            element={
              <RequirePermission permission="report.finance">
                <P.FinanceOverviewPage />
              </RequirePermission>
            }
          />
          <Route
            path="finance/shop"
            element={
              <RequirePermission permission="report.finance">
                <P.FinanceShopPage />
              </RequirePermission>
            }
          />
          <Route
            path="finance/sku"
            element={
              <RequirePermission permission="report.finance">
                <P.FinanceSkuPage />
              </RequirePermission>
            }
          />
          <Route
            path="finance/order-unit"
            element={
              <RequirePermission permission="report.finance">
                <P.FinanceOrderUnitPage />
              </RequirePermission>
            }
          />

          <Route
            path="iam/users"
            element={
              <RequirePermission permission="system.user.manage">
                <P.UsersManagePage />
              </RequirePermission>
            }
          />
          <Route
            path="iam/roles"
            element={
              <RequirePermission permission="system.role.manage">
                <P.RolesManagePage />
              </RequirePermission>
            }
          />
          <Route
            path="iam/perms"
            element={
              <RequirePermission permission="system.permission.manage">
                <P.PermissionsDictPage />
              </RequirePermission>
            }
          />
          <Route
            path="admin/users-admin"
            element={
              <RequirePermission permission="system.user.manage">
                <Navigate to="/iam/users" replace />
              </RequirePermission>
            }
          />

          <Route
            path="purchase-orders/overview"
            element={
              <RequirePermission permission="purchase.manage">
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
              <RequirePermission permission="purchase.manage">
                <P.PurchaseOrderCreateV2Page />
              </RequirePermission>
            }
          />
          <Route
            path="purchase-orders/:poId"
            element={
              <RequirePermission permission="purchase.manage">
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
            path="stores"
            element={
              <RequirePermission permission="config.store.write">
                <P.StoresListPage />
              </RequirePermission>
            }
          />
          <Route
            path="stores/:storeId"
            element={
              <RequirePermission permission="config.store.write">
                <P.StoreDetailPage />
              </RequirePermission>
            }
          />

          <Route
            path="warehouses"
            element={
              <RequirePermission permission="config.store.write">
                <P.WarehousesListPage />
              </RequirePermission>
            }
          />
          <Route
            path="warehouses/new"
            element={
              <RequirePermission permission="config.store.write">
                <P.WarehouseCreatePage />
              </RequirePermission>
            }
          />
          <Route
            path="warehouses/:warehouseId"
            element={
              <RequirePermission permission="config.store.write">
                <P.WarehouseDetailPage />
              </RequirePermission>
            }
          />

          <Route
            path="admin/shop-bundles"
            element={
              <RequirePermission permission="config.store.write">
                <P.ShopProductBundlesPage />
              </RequirePermission>
            }
          />

          <Route
            path="admin/items"
            element={
              <RequirePermission permission="config.store.write">
                <P.ItemsPage />
              </RequirePermission>
            }
          />

          <Route
            path="admin/suppliers"
            element={
              <RequirePermission permission="config.store.write">
                <P.SuppliersListPage />
              </RequirePermission>
            }
          />

          <Route
            path="tms/providers"
            element={
              <RequirePermission permission="config.store.write">
                <P.ShippingProvidersListPage />
              </RequirePermission>
            }
          />

          <Route
            path="tms/providers/:providerId"
            element={
              <RequirePermission permission="config.store.write">
                <RedirectToProviderEdit />
              </RequirePermission>
            }
          />

          <Route
            path="tms/providers/new"
            element={
              <RequirePermission permission="config.store.write">
                <P.ShippingProviderEditPage />
              </RequirePermission>
            }
          />

          <Route
            path="tms/providers/:providerId/edit"
            element={
              <RequirePermission permission="config.store.write">
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
