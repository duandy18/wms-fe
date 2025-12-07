// src/app/router/index.tsx
// 应用路由总表：挂载所有页面，包括财务分析相关页面

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { AppLayout } from "../layout/AppLayout";
import { useAuth } from "../auth/useAuth";

// 登录页
import LoginPage from "../../features/auth/LoginPage";

// 作业台 (Cockpits)
import CountCockpitPage from "../../features/operations/count/CountCockpitPage";
import OutboundPickV2Page from "../../features/operations/outbound-pick/OutboundPickV2Page";
import InboundCockpitPage from "../../features/operations/inbound/InboundCockpitPage";
import PickTasksCockpitPage from "../../features/operations/outbound-pick/PickTasksCockpitPage";
import ShipCockpitPage from "../../features/operations/ship/ShipCockpitPage";

// 标签打印页（专用打印机）
import ShippingLabelPrintPage from "../../features/operations/ship/ShippingLabelPrintPage";

// 库存 & 报表
import SnapshotPage from "../../features/inventory/snapshot/SnapshotPage";
import ChannelInventoryPage from "../../features/inventory/channel-inventory/ChannelInventoryPage";
import OutboundDashboardPage from "../../features/inventory/outbound-dashboard/OutboundDashboardPage";

// 发货成本报表 / 发货账本详情
import ShippingReportsPage from "../../features/inventory/shipping-reports/ShippingReportsPage";
import ShippingRecordDetailPage from "../../features/inventory/shipping-records/ShippingRecordDetailPage";

// 诊断 & 工具（Studio）
import TraceStudioPage from "../../features/diagnostics/trace/TraceStudioPage";
import InventoryStudioPage from "../../features/diagnostics/stock-tool/InventoryStudioPage";
import LedgerStudioPage from "../../features/diagnostics/ledger-tool/LedgerStudioPage";
import DevConsolePage from "../../features/dev/DevConsolePage";

// 系统管理旧页面
import StoresListPage from "../../features/admin/stores/StoresListPage";
import StoreDetailPage from "../../features/admin/stores/StoreDetailPage";
import UsersPage from "../../features/admin/users/UsersPage";
import RolesPage from "../../features/admin/roles/RolesPage";
import PermissionsPage from "../../features/admin/permissions/PermissionsPage";
import ItemsPage from "../../features/admin/items/ItemsPage";

// 新用户管理总控页
import UsersAdminPage from "../../features/admin/users/UsersAdminPage";

// 仓库管理
import WarehousesListPage from "../../features/admin/warehouses/WarehousesListPage";
import WarehouseDetailPage from "../../features/admin/warehouses/WarehouseDetailPage";

// 供应商主数据
import SuppliersListPage from "../../features/admin/suppliers/SuppliersListPage";

// 物流 / 快递公司主数据
import ShippingProvidersListPage from "../../features/admin/shipping-providers/ShippingProvidersListPage";

// 采购系统
import PurchaseOrdersPage from "../../features/purchase-orders/PurchaseOrdersPage";
import PurchaseOrderDetailPage from "../../features/purchase-orders/PurchaseOrderDetailPage";
import PurchaseOrderCreateV2Page from "../../features/purchase-orders/PurchaseOrderCreateV2Page";
import PurchaseReportsPage from "../../features/purchase-orders/PurchaseReportsPage";

// 收货任务详情
import ReceiveTaskDetailPage from "../../features/receive-tasks/ReceiveTaskDetailPage";

// 退货任务详情
import ReturnTaskDetailPage from "../../features/return-tasks/ReturnTaskDetailPage";

// 订单管理
import OrdersPage from "../../features/orders/OrdersPage";
import OrdersStatsPage from "../../features/orders/OrdersStatsPage";

// 财务分析
import FinanceOverviewPage from "../../features/finance/FinanceOverviewPage";
import FinanceShopPage from "../../features/finance/FinanceShopPage";
import FinanceSkuPage from "../../features/finance/FinanceSkuPage";
import FinanceOrderUnitPage from "../../features/finance/FinanceOrderUnitPage";

/* 登录守卫 */
function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

/* 路由入口 */
const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* 登录页（不带 Layout） */}
      <Route path="/login" element={<LoginPage />} />

      {/* 标签打印页（不挂菜单，不需要登录） */}
      <Route path="/print/shipping-label" element={<ShippingLabelPrintPage />} />

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
        <Route path="inbound/cockpit" element={<InboundCockpitPage />} />
        <Route path="count" element={<CountCockpitPage />} />
        <Route path="outbound/pick" element={<OutboundPickV2Page />} />
        <Route path="outbound/pick-tasks" element={<PickTasksCockpitPage />} />
        <Route path="outbound/ship" element={<ShipCockpitPage />} />

        {/* 财务分析 */}
        <Route path="finance" element={<FinanceOverviewPage />} />
        <Route path="finance/overview" element={<FinanceOverviewPage />} />
        <Route path="finance/shop" element={<FinanceShopPage />} />
        <Route path="finance/sku" element={<FinanceSkuPage />} />
        <Route path="finance/order-unit" element={<FinanceOrderUnitPage />} />

        {/* 库存 & 报表 */}
        <Route path="snapshot" element={<SnapshotPage />} />
        <Route path="channel-inventory" element={<ChannelInventoryPage />} />
        <Route
          path="inventory/outbound-dashboard"
          element={<OutboundDashboardPage />}
        />
        <Route path="shipping/reports" element={<ShippingReportsPage />} />
        <Route path="shipping/record" element={<ShippingRecordDetailPage />} />

        {/* 订单管理 */}
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/stats" element={<OrdersStatsPage />} />

        {/* 采购系统 */}
        <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
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
        <Route path="dev" element={<DevConsolePage />} />
        <Route path="tools/stocks" element={<InventoryStudioPage />} />
        <Route path="tools/ledger" element={<LedgerStudioPage />} />

        {/* 系统管理 */}
        <Route path="stores" element={<StoresListPage />} />
        <Route path="stores/:storeId" element={<StoreDetailPage />} />
        <Route path="warehouses" element={<WarehousesListPage />} />
        <Route
          path="warehouses/:warehouseId"
          element={<WarehouseDetailPage />}
        />
        <Route path="admin/items" element={<ItemsPage />} />
        <Route path="admin/suppliers" element={<SuppliersListPage />} />
        <Route
          path="admin/shipping-providers"
          element={<ShippingProvidersListPage />}
        />
        <Route path="admin/users" element={<UsersPage />} />
        <Route path="admin/roles" element={<RolesPage />} />
        <Route path="admin/permissions" element={<PermissionsPage />} />
        <Route path="admin/users-admin" element={<UsersAdminPage />} />
      </Route>

      {/* 兜底：未知路径 → Snapshot */}
      <Route path="*" element={<Navigate to="/snapshot" replace />} />
    </Routes>
  );
};

export default AppRouter;
