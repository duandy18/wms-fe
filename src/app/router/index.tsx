// src/app/router/index.tsx
// 应用路由总表：挂载所有页面，包括财务分析 / 诊断 / DevConsole 等

import React, { Suspense } from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";

import { AppLayout } from "../layout/AppLayout";
import { RequireAuth, RequirePermission, ForbiddenPage, RouteLoading } from "./guards";
import * as P from "./lazyPages";
import { ReceiveSupplementPage } from "../../features/operations/inbound/ReceiveSupplementPage";

/* ✅ 兼容入口：统一收敛到“编辑网点”唯一入口 */
function RedirectToProviderEdit() {
  const { providerId } = useParams();
  if (!providerId) return <Navigate to="/admin/shipping-providers" replace />;
  return <Navigate to={`/admin/shipping-providers/${providerId}/edit`} replace />;
}

function RedirectToProviderEditFromSchemes() {
  const { providerId } = useParams();
  if (!providerId) return <Navigate to="/admin/shipping-providers" replace />;
  // 只保留一个入口：编辑网点。这里不再保留 schemes 子页心智。
  return <Navigate to={`/admin/shipping-providers/${providerId}/edit`} replace />;
}

/* 路由入口 */
const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        {/* 登录页（不带 Layout） */}
        <Route path="/login" element={<P.LoginPage />} />

        {/* 无权限页（不带 Layout） */}
        <Route path="/forbidden" element={<ForbiddenPage />} />

        {/* 标签打印页（不挂菜单，不需要登录） */}
        <Route path="/print/shipping-label" element={<P.ShippingLabelPrintPage />} />

        {/* 受保护业务区（带 Layout） */}
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

          {/* 作业台 Cockpits */}
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
            path="inbound/supplement"
            element={
              <RequirePermission permission="operations.inbound">
                <ReceiveSupplementPage />
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
                <P.ShipCockpitPage />
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

          {/* ✅ 出库看板：订单出库域专题页（新 URL） */}
          <Route
            path="outbound/dashboard"
            element={
              <RequirePermission permission="report.outbound">
                <P.OutboundDashboardPage />
              </RequirePermission>
            }
          />
          {/* ✅ 旧 URL：重定向到新 URL */}
          <Route path="inventory/outbound-dashboard" element={<Navigate to="/outbound/dashboard" replace />} />

          {/* 库存 */}
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

          {/* 订单出库：发货成本/账本 */}
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

          {/* 财务分析 */}
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

          {/* 订单管理：只读权限 orders.read */}
          <Route
            path="orders"
            element={
              <RequirePermission permission="orders.read">
                <P.OrdersPage />
              </RequirePermission>
            }
          />
          <Route
            path="orders/stats"
            element={
              <RequirePermission permission="orders.read">
                <P.OrdersStatsPage />
              </RequirePermission>
            }
          />

          {/* ✅ 权限与账号：三个子页面 */}
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
          {/* ✅ 旧入口：保留但重定向到新子页 */}
          <Route
            path="admin/users-admin"
            element={
              <RequirePermission permission="system.user.manage">
                <Navigate to="/iam/users" replace />
              </RequirePermission>
            }
          />

          {/* ✅ 运维中心（新） */}
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

          {/* ✅ 运维中心 / 后端调试台：Tab → 页面化 */}
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

          {/* 采购系统 */}
          <Route
            path="purchase-orders/overview"
            element={
              <RequirePermission permission="purchase.manage">
                <P.PurchaseOverviewPage />
              </RequirePermission>
            }
          />
          <Route path="purchase-orders" element={<Navigate to="/purchase-orders/overview" replace />} />
          <Route path="purchase-orders/reports" element={<Navigate to="/purchase-orders/overview" replace />} />

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

          {/* 收货任务 */}
          <Route
            path="receive-tasks/:taskId"
            element={
              <RequirePermission permission="operations.inbound">
                <P.ReceiveTaskDetailPage />
              </RequirePermission>
            }
          />
          {/* 退货任务 */}
          <Route
            path="return-tasks/:taskId"
            element={
              <RequirePermission permission="operations.outbound">
                <P.ReturnTaskDetailPage />
              </RequirePermission>
            }
          />

          {/* 诊断 & 工具（归入运维中心） */}
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

          {/* ✅ /dev：兼容入口（保留旧 query 语义，内部跳转 /ops/dev/*） */}
          <Route
            path="dev"
            element={
              <RequirePermission permission="dev.tools.access">
                <P.DevConsolePage />
              </RequirePermission>
            }
          />

          {/* 主数据 */}
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

          {/* ✅ 物流与承运商：语义化入口（别名） */}
          <Route
            path="logistics/providers"
            element={
              <RequirePermission permission="config.store.write">
                <Navigate to="/admin/shipping-providers" replace />
              </RequirePermission>
            }
          />

          {/* ✅ 快递公司列表 */}
          <Route
            path="admin/shipping-providers"
            element={
              <RequirePermission permission="config.store.write">
                <P.ShippingProvidersListPage />
              </RequirePermission>
            }
          />

          {/* ✅ 兼容入口：曾经的“详情页/方案页”，统一收敛到编辑页（唯一入口） */}
          <Route
            path="admin/shipping-providers/:providerId"
            element={
              <RequirePermission permission="config.store.write">
                <RedirectToProviderEdit />
              </RequirePermission>
            }
          />
          <Route
            path="admin/shipping-providers/:providerId/schemes"
            element={
              <RequirePermission permission="config.store.write">
                <RedirectToProviderEditFromSchemes />
              </RequirePermission>
            }
          />

          /* ✅ 快递网点编辑页（两页模型） */

          <Route
            path="admin/shipping-providers/new"
            element={
              <RequirePermission permission="config.store.write">
                <P.ShippingProviderEditPage />
              </RequirePermission>
            }
          />

          <Route
            path="admin/shipping-providers/:providerId/edit"
            element={
              <RequirePermission permission="config.store.write">
                <P.ShippingProviderEditPage />
              </RequirePermission>
            }
          />
          {/* ✅ 运价方案工作台：Tab → 子页面 */}
          <Route
            path="admin/shipping-providers/schemes/:schemeId/workbench/:tab"
            element={
              <RequirePermission permission="config.store.write">
                <P.SchemeWorkbenchPage />
              </RequirePermission>
            }
          />
          <Route
            path="admin/shipping-providers/schemes/:schemeId/workbench"
            element={
              <RequirePermission permission="config.store.write">
                <P.SchemeWorkbenchPage />
              </RequirePermission>
            }
          />
        </Route>

        {/* 兜底 */}
        <Route path="*" element={<Navigate to="/snapshot" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
