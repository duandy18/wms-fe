// src/app/router/index.tsx
// 应用路由总表：挂载所有页面，包括财务分析相关页面

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
const UsersPage = lazy(
  () => import("../../features/admin/users/UsersPage"),
);
const RolesPage = lazy(
  () => import("../../features/admin/roles/RolesPage"),
);
const PermissionsPage = lazy(
  () => import("../../features/admin/permissions/PermissionsPage"),
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

/* 管理员守卫：用于系统级页面（用户总控 / DevConsole 等） */
function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
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
        {/* 默认首页 */}
        <Route index element={<SnapshotPage />} />

        {/* 作业台 Cockpits */}
        <Route path="inbound" element={<InboundCockpitPage />} />
        <Route
          path="inbound/cockpit"
          element={<InboundCockpitPage />}
        />
        <Route path="count" element={<CountCockpitPage />} />
        <Route
          path="outbound/pick"
          element={<OutboundPickV2Page />}
        />
        <Route
          path="outbound/pick-tasks"
          element={<PickTasksCockpitPage />}
        />
        <Route path="outbound/ship" element={<ShipCockpitPage />} />
        <Route
          path="outbound/internal-outbound"
          element={<InternalOutboundPage />}
        />

        {/* 财务分析 */}
        <Route path="finance" element={<FinanceOverviewPage />} />
        <Route
          path="finance/overview"
          element={<FinanceOverviewPage />}
        />
        <Route path="finance/shop" element={<FinanceShopPage />} />
        <Route path="finance/sku" element={<FinanceSkuPage />} />
        <Route
          path="finance/order-unit"
          element={<FinanceOrderUnitPage />}
        />

        {/* 库存 & 报表 */}
        <Route path="snapshot" element={<SnapshotPage />} />
        <Route
          path="channel-inventory"
          element={<ChannelInventoryPage />}
        />
        <Route
          path="inventory/outbound-dashboard"
          element={<OutboundDashboardPage />}
        />
        <Route
          path="shipping/reports"
          element={<ShippingReportsPage />}
        />
        <Route
          path="shipping/record"
          element={<ShippingRecordDetailPage />}
        />

        {/* 订单管理 */}
        <Route path="orders" element={<OrdersPage />} />
        <Route
          path="orders/stats"
          element={<OrdersStatsPage />}
        />

        {/* 采购系统 */}
        <Route
          path="purchase-orders"
          element={<PurchaseOrdersPage />}
        />
        <Route
          path="purchase-orders/reports"
          element={<PurchaseReportsPage />}
        />
        <Route
          path="purchase-orders/new-v2"
          element={<PurchaseOrderCreateV2Page />}
        />
        <Route
          path="purchase-orders/:poId"
          element={<PurchaseOrderDetailPage />}
        />

        {/* 收货任务 */}
        <Route
          path="receive-tasks/:taskId"
          element={<ReceiveTaskDetailPage />}
        />

        {/* 退货任务 */}
        <Route
          path="return-tasks/:taskId"
          element={<ReturnTaskDetailPage />}
        />

        {/* 诊断 & 工具 / Studio */}
        <Route path="trace" element={<TraceStudioPage />} />
        <Route
          path="tools/stocks"
          element={<InventoryStudioPage />}
        />
        <Route
          path="tools/ledger"
          element={<LedgerStudioPage />}
        />

        {/* DevConsole（仅管理员可进） */}
        <Route
          path="dev"
          element={
            <RequireAdmin>
              <DevConsolePage />
            </RequireAdmin>
          }
        />

        {/* 系统管理 */}
        <Route path="stores" element={<StoresListPage />} />
        <Route
          path="stores/:storeId"
          element={<StoreDetailPage />}
        />
        <Route
          path="warehouses"
          element={<WarehousesListPage />}
        />
        <Route
          path="warehouses/:warehouseId"
          element={<WarehouseDetailPage />}
        />
        <Route
          path="admin/items"
          element={<ItemsPage />}
        />
        <Route
          path="admin/suppliers"
          element={<SuppliersListPage />}
        />
        <Route
          path="admin/shipping-providers"
          element={<ShippingProvidersListPage />}
        />
        <Route
          path="admin/users"
          element={<UsersPage />}
        />
        <Route
          path="admin/roles"
          element={<RolesPage />}
        />
        <Route
          path="admin/permissions"
          element={<PermissionsPage />}
        />
        {/* 用户管理总控（仅管理员可进） */}
        <Route
          path="admin/users-admin"
          element={
            <RequireAdmin>
              <UsersAdminPage />
            </RequireAdmin>
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
