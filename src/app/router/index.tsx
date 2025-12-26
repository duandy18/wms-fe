// src/app/router/index.tsx
// 应用路由总表：挂载所有页面，包括财务分析 / 诊断 / DevConsole 等

import React, { type ReactNode, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { AppLayout } from "../layout/AppLayout";
import { useAuth } from "../auth/useAuth";

// 登录页
const LoginPage = lazy(() => import("../../features/auth/LoginPage"));

// 作业台 (Cockpits)
const CountCockpitPage = lazy(
  () => import("../../features/operations/count/CountCockpitPage"),
);
const OutboundPickV2Page = lazy(
  () => import("../../features/operations/outbound-pick/OutboundPickV2Page"),
);
const InboundCockpitPage = lazy(
  () => import("../../features/operations/inbound/InboundCockpitPage"),
);
const PickTasksCockpitPage = lazy(
  () =>
    import(
      "../../features/operations/outbound-pick/PickTasksCockpitPage"
    ),
);
const ShipCockpitPage = lazy(
  () => import("../../features/operations/ship/ShipCockpitPage"),
);
// 内部出库 Cockpit
const InternalOutboundPage = lazy(
  () =>
    import(
      "../../features/operations/ship/InternalOutboundPage"
    ),
);

// 标签打印页（专用打印机）
const ShippingLabelPrintPage = lazy(
  () =>
    import(
      "../../features/operations/ship/ShippingLabelPrintPage"
    ),
);

// 库存 & 报表
const SnapshotPage = lazy(
  () => import("../../features/inventory/snapshot/SnapshotPage"),
);
const ChannelInventoryPage = lazy(
  () =>
    import(
      "../../features/inventory/channel-inventory/ChannelInventoryPage"
    ),
);
const OutboundDashboardPage = lazy(
  () =>
    import(
      "../../features/inventory/outbound-dashboard/OutboundDashboardPage"
    ),
);

// 发货成本报表 / 发货账本详情
const ShippingReportsPage = lazy(
  () =>
    import(
      "../../features/inventory/shipping-reports/ShippingReportsPage"
    ),
);
const ShippingRecordDetailPage = lazy(
  () =>
    import(
      "../../features/inventory/shipping-records/ShippingRecordDetailPage"
    ),
);

// 诊断 & 工具（Studio）
const TraceStudioPage = lazy(
  () => import("../../features/diagnostics/trace/TraceStudioPage"),
);
const InventoryStudioPage = lazy(
  () =>
    import(
      "../../features/diagnostics/stock-tool/InventoryStudioPage"
    ),
);
const LedgerStudioPage = lazy(
  () =>
    import("../../features/diagnostics/ledger-tool/LedgerStudioPage"),
);
const DevConsolePage = lazy(
  () => import("../../features/dev/DevConsolePage"),
);

// 系统管理旧页面
const StoresListPage = lazy(
  () => import("../../features/admin/stores/StoresListPage"),
);
const StoreDetailPage = lazy(
  () => import("../../features/admin/stores/StoreDetailPage"),
);
const ItemsPage = lazy(
  () => import("../../features/admin/items/ItemsPage"),
);

// 新用户管理总控页
const UsersAdminPage = lazy(
  () => import("../../features/admin/users/UsersAdminPage"),
);

// 仓库管理
const WarehousesListPage = lazy(
  () =>
    import("../../features/admin/warehouses/WarehousesListPage"),
);
const WarehouseDetailPage = lazy(
  () =>
    import("../../features/admin/warehouses/WarehouseDetailPage"),
);

// 供应商主数据
const SuppliersListPage = lazy(
  () =>
    import("../../features/admin/suppliers/SuppliersListPage"),
);

// 物流 / 快递公司主数据
const ShippingProvidersListPage = lazy(
  () =>
    import(
      "../../features/admin/shipping-providers/ShippingProvidersListPage"
    ),
);

// ✅ 运价方案工作台（五标签：区域 / 重量分段（表头）/ 录价 / 附加费 / 算价）
const SchemeWorkbenchPage = lazy(
  () =>
    import(
      "../../features/admin/shipping-providers/scheme/SchemeWorkbenchPage"
    ),
);

// 采购系统
const PurchaseOrdersPage = lazy(
  () =>
    import("../../features/purchase-orders/PurchaseOrdersPage"),
);
const PurchaseOrderDetailPage = lazy(
  () =>
    import(
      "../../features/purchase-orders/PurchaseOrderDetailPage"
    ),
);
const PurchaseOrderCreateV2Page = lazy(
  () =>
    import(
      "../../features/purchase-orders/PurchaseOrderCreateV2Page"
    ),
);
const PurchaseReportsPage = lazy(
  () =>
    import("../../features/purchase-orders/PurchaseReportsPage"),
);

// 收货任务详情
const ReceiveTaskDetailPage = lazy(
  () =>
    import("../../features/receive-tasks/ReceiveTaskDetailPage"),
);

// 退货任务详情
const ReturnTaskDetailPage = lazy(
  () =>
    import("../../features/return-tasks/ReturnTaskDetailPage"),
);

// 订单管理
const OrdersPage = lazy(
  () => import("../../features/orders/OrdersPage"),
);
const OrdersStatsPage = lazy(
  () => import("../../features/orders/OrdersStatsPage"),
);

// 财务分析
const FinanceOverviewPage = lazy(
  () => import("../../features/finance/FinanceOverviewPage"),
);
const FinanceShopPage = lazy(
  () => import("../../features/finance/FinanceShopPage"),
);
const FinanceSkuPage = lazy(
  () => import("../../features/finance/FinanceSkuPage"),
);
const FinanceOrderUnitPage = lazy(
  () => import("../../features/finance/FinanceOrderUnitPage"),
);

/** 无权限页面（简单版） */
const ForbiddenPage: React.FC = () => (
  <div className="p-6 text-center text-lg">
    <div className="mb-2 text-2xl font-semibold">无权限访问</div>
    <div className="text-slate-600">
      当前账号没有权限访问这个页面，如需开通请联系管理员。
    </div>
  </div>
);

/* 登录守卫 */
function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

/* 通用权限守卫：用于绑定到 system.* / operations.* / report.* / diagnostics.* / dev.* 等 */
function RequirePermission({
  permission,
  children,
}: {
  permission: string;
  children: ReactNode;
}) {
  const { isAuthenticated, can } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!can(permission)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
}

/* 路由入口 */
const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* 登录页（不带 Layout） */}
      <Route path="/login" element={<LoginPage />} />

      {/* 无权限页（不带 Layout） */}
      <Route path="/forbidden" element={<ForbiddenPage />} />

      {/* 标签打印页（不挂菜单，不需要登录） */}
      <Route
        path="/print/shipping-label"
        element={<ShippingLabelPrintPage />}
      />

      {/* 受保护业务区（带 Layout） */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        {/* 默认首页：看成库存报表入口 */}
        <Route
          index
          element={
            <RequirePermission permission="report.inventory">
              <SnapshotPage />
            </RequirePermission>
          }
        />

        {/* 作业台 Cockpits */}
        <Route
          path="inbound"
          element={
            <RequirePermission permission="operations.inbound">
              <InboundCockpitPage />
            </RequirePermission>
          }
        />
        <Route
          path="inbound/cockpit"
          element={
            <RequirePermission permission="operations.inbound">
              <InboundCockpitPage />
            </RequirePermission>
          }
        />
        <Route
          path="count"
          element={
            <RequirePermission permission="operations.count">
              <CountCockpitPage />
            </RequirePermission>
          }
        />
        <Route
          path="outbound/pick"
          element={
            <RequirePermission permission="operations.outbound">
              <OutboundPickV2Page />
            </RequirePermission>
          }
        />
        <Route
          path="outbound/pick-tasks"
          element={
            <RequirePermission permission="operations.outbound">
              <PickTasksCockpitPage />
            </RequirePermission>
          }
        />
        <Route
          path="outbound/ship"
          element={
            <RequirePermission permission="operations.outbound">
              <ShipCockpitPage />
            </RequirePermission>
          }
        />
        <Route
          path="outbound/internal-outbound"
          element={
            <RequirePermission permission="operations.internal_outbound">
              <InternalOutboundPage />
            </RequirePermission>
          }
        />

        {/* 库存 & 报表 */}
        <Route
          path="snapshot"
          element={
            <RequirePermission permission="report.inventory">
              <SnapshotPage />
            </RequirePermission>
          }
        />
        <Route
          path="channel-inventory"
          element={
            <RequirePermission permission="report.inventory">
              <ChannelInventoryPage />
            </RequirePermission>
          }
        />
        <Route
          path="inventory/outbound-dashboard"
          element={
            <RequirePermission permission="report.outbound">
              <OutboundDashboardPage />
            </RequirePermission>
          }
        />
        <Route
          path="shipping/reports"
          element={
            <RequirePermission permission="report.outbound">
              <ShippingReportsPage />
            </RequirePermission>
          }
        />
        <Route
          path="shipping/record"
          element={
            <RequirePermission permission="report.outbound">
              <ShippingRecordDetailPage />
            </RequirePermission>
          }
        />

        {/* 财务分析 */}
        <Route
          path="finance"
          element={
            <RequirePermission permission="report.finance">
              <FinanceOverviewPage />
            </RequirePermission>
          }
        />
        <Route
          path="finance/overview"
          element={
            <RequirePermission permission="report.finance">
              <FinanceOverviewPage />
            </RequirePermission>
          }
        />
        <Route
          path="finance/shop"
          element={
            <RequirePermission permission="report.finance">
              <FinanceShopPage />
            </RequirePermission>
          }
        />
        <Route
          path="finance/sku"
          element={
            <RequirePermission permission="report.finance">
              <FinanceSkuPage />
            </RequirePermission>
          }
        />
        <Route
          path="finance/order-unit"
          element={
            <RequirePermission permission="report.finance">
              <FinanceOrderUnitPage />
            </RequirePermission>
          }
        />

        {/* 订单管理：只读权限 orders.read */}
        <Route
          path="orders"
          element={
            <RequirePermission permission="orders.read">
              <OrdersPage />
            </RequirePermission>
          }
        />
        <Route
          path="orders/stats"
          element={
            <RequirePermission permission="orders.read">
              <OrdersStatsPage />
            </RequirePermission>
          }
        />

        {/* 采购系统：使用 purchase.manage / purchase.report */}
        <Route
          path="purchase-orders"
          element={
            <RequirePermission permission="purchase.manage">
              <PurchaseOrdersPage />
            </RequirePermission>
          }
        />
        <Route
          path="purchase-orders/reports"
          element={
            <RequirePermission permission="purchase.report">
              <PurchaseReportsPage />
            </RequirePermission>
          }
        />
        <Route
          path="purchase-orders/new-v2"
          element={
            <RequirePermission permission="purchase.manage">
              <PurchaseOrderCreateV2Page />
            </RequirePermission>
          }
        />
        <Route
          path="purchase-orders/:poId"
          element={
            <RequirePermission permission="purchase.manage">
              <PurchaseOrderDetailPage />
            </RequirePermission>
          }
        />

        {/* 收货任务 */}
        <Route
          path="receive-tasks/:taskId"
          element={
            <RequirePermission permission="operations.inbound">
              <ReceiveTaskDetailPage />
            </RequirePermission>
          }
        />

        {/* 退货任务（按出库权限控制） */}
        <Route
          path="return-tasks/:taskId"
          element={
            <RequirePermission permission="operations.outbound">
              <ReturnTaskDetailPage />
            </RequirePermission>
          }
        />

        {/* 诊断 & 工具 / Studio */}
        <Route
          path="trace"
          element={
            <RequirePermission permission="diagnostics.trace">
              <TraceStudioPage />
            </RequirePermission>
          }
        />
        <Route
          path="tools/stocks"
          element={
            <RequirePermission permission="diagnostics.inventory">
              <InventoryStudioPage />
            </RequirePermission>
          }
        />
        <Route
          path="tools/ledger"
          element={
            <RequirePermission permission="diagnostics.ledger">
              <LedgerStudioPage />
            </RequirePermission>
          }
        />

        {/* DevConsole（有 dev.tools.access 权限的账号可进，一般只有 admin） */}
        <Route
          path="dev"
          element={
            <RequirePermission permission="dev.tools.access">
              <DevConsolePage />
            </RequirePermission>
          }
        />

        {/* 系统管理（主数据）——用 config.store.write 作为总入口 */}
        <Route
          path="stores"
          element={
            <RequirePermission permission="config.store.write">
              <StoresListPage />
            </RequirePermission>
          }
        />
        <Route
          path="stores/:storeId"
          element={
            <RequirePermission permission="config.store.write">
              <StoreDetailPage />
            </RequirePermission>
          }
        />
        <Route
          path="warehouses"
          element={
            <RequirePermission permission="config.store.write">
              <WarehousesListPage />
            </RequirePermission>
          }
        />
        <Route
          path="warehouses/:warehouseId"
          element={
            <RequirePermission permission="config.store.write">
              <WarehouseDetailPage />
            </RequirePermission>
          }
        />
        <Route
          path="admin/items"
          element={
            <RequirePermission permission="config.store.write">
              <ItemsPage />
            </RequirePermission>
          }
        />
        <Route
          path="admin/suppliers"
          element={
            <RequirePermission permission="config.store.write">
              <SuppliersListPage />
            </RequirePermission>
          }
        />
        <Route
          path="admin/shipping-providers"
          element={
            <RequirePermission permission="config.store.write">
              <ShippingProvidersListPage />
            </RequirePermission>
          }
        />

        {/* ✅ 运价方案工作台（五标签：区域 / 重量分段（表头）/ 录价 / 附加费 / 算价） */}
        <Route
          path="admin/shipping-providers/schemes/:schemeId/workbench"
          element={
            <RequirePermission permission="config.store.write">
              <SchemeWorkbenchPage />
            </RequirePermission>
          }
        />

        {/* 用户管理总控页（新 RBAC 中枢） */}
        <Route
          path="admin/users-admin"
          element={
            <RequirePermission permission="system.user.manage">
              <UsersAdminPage />
            </RequirePermission>
          }
        />
      </Route>

      {/* 兜底：未知路径 → Snapshot */}
      <Route
        path="*"
        element={<Navigate to="/snapshot" replace />}
      />
    </Routes>
  );
};

export default AppRouter;
