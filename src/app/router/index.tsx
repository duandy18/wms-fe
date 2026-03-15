// src/app/router/index.tsx
// 应用路由总表：挂载所有页面，包括财务分析 / 诊断 / DevConsole 等

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

/* ✅ 兼容入口：统一收敛到“编辑网点”唯一入口 */
function RedirectToProviderEdit() {
  const { providerId } = useParams();
  if (!providerId) return <Navigate to="/tms/providers" replace />;
  return (
    <Navigate to={`/tms/providers/${providerId}/edit`} replace />
  );
}

function RedirectToProviderEditFromSchemes() {
  const { providerId } = useParams();
  if (!providerId) return <Navigate to="/tms/providers" replace />;
  return (
    <Navigate to={`/tms/providers/${providerId}/edit`} replace />
  );
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
                <P.ShipmentCockpitPage />
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
            path="shipping/reports"
            element={
              <RequirePermission permission="report.outbound">
                <P.ShippingReportsPage />
              </RequirePermission>
            }
          />
          <Route
            path="shipping/record"
            element={
              <RequirePermission permission="report.outbound">
                <P.ShippingRecordDetailPage />
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
            path="ops"
            element={
              <RequirePermission permission="dev.tools.access">
                <P.OpsOverviewPage />
              </RequirePermission>
            }
          />
          <Route
            path="ops/health"
            element={
              <RequirePermission permission="dev.tools.access">
                <P.OpsHealthPage />
              </RequirePermission>
            }
          />
          <Route
            path="ops/tasks"
            element={
              <RequirePermission permission="dev.tools.access">
                <P.OpsTasksPage />
              </RequirePermission>
            }
          />
          <Route
            path="ops/shop-bundles"
            element={
              <RequirePermission permission="config.store.write">
                <Navigate to="/admin/shop-bundles" replace />
              </RequirePermission>
            }
          />

          <Route
            path="ops/pricing-ops"
            element={
              <RequirePermission permission="config.store.write">
                <P.PricingOpsCenterPage />
              </RequirePermission>
            }
          />
          <Route
            path="ops/pricing-ops/schemes/:schemeId"
            element={
              <RequirePermission permission="config.store.write">
                <P.PricingOpsSchemeDetailPage />
              </RequirePermission>
            }
          />
          <Route
            path="ops/pricing-ops/cleanup"
            element={
              <RequirePermission permission="config.store.write">
                <P.PricingOpsCleanupPage />
              </RequirePermission>
            }
          />

          <Route
            path="ops/dev/orders"
            element={
              <RequirePermission permission="dev.tools.access">
                <P.OpsDevOrdersPage />
              </RequirePermission>
            }
          />
          <Route
            path="ops/dev/pick"
            element={
              <RequirePermission permission="dev.tools.access">
                <P.OpsDevPickPage />
              </RequirePermission>
            }
          />
          <Route
            path="ops/dev/inbound"
            element={
              <RequirePermission permission="dev.tools.access">
                <P.OpsDevInboundPage />
              </RequirePermission>
            }
          />
          <Route
            path="ops/dev/count"
            element={
              <RequirePermission permission="dev.tools.access">
                <P.OpsDevCountPage />
              </RequirePermission>
            }
          />
          <Route
            path="ops/dev/platform"
            element={
              <RequirePermission permission="dev.tools.access">
                <P.OpsDevPlatformPage />
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
            path="trace"
            element={
              <RequirePermission permission="diagnostics.trace">
                <P.TraceStudioPage />
              </RequirePermission>
            }
          />
          <Route
            path="tools/stocks"
            element={
              <RequirePermission permission="diagnostics.inventory">
                <P.InventoryStudioPage />
              </RequirePermission>
            }
          />
          <Route
            path="tools/ledger"
            element={
              <RequirePermission permission="diagnostics.ledger">
                <P.LedgerStudioPage />
              </RequirePermission>
            }
          />

          <Route
            path="dev"
            element={
              <RequirePermission permission="dev.tools.access">
                <P.DevConsolePage />
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
            path="logistics/providers"
            element={
              <RequirePermission permission="config.store.write">
                <Navigate to="/tms/providers" replace />
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
            path="tms/providers/:providerId/schemes"
            element={
              <RequirePermission permission="config.store.write">
                <RedirectToProviderEditFromSchemes />
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
          <Route
            path="tms/providers/schemes/:schemeId/workbench-flow"
            element={
              <RequirePermission permission="config.store.write">
                <P.SchemeWorkbenchFlowPage />
              </RequirePermission>
            }
          />
        </Route>
        <Route
          path="ops/dev/order-parse-simulator"
          element={
            <RequirePermission permission="dev.tools.access">
              <P.OpsDevOrderParseSimulatorPage />
            </RequirePermission>
          }
        />

        <Route path="*" element={<Navigate to="/snapshot" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
