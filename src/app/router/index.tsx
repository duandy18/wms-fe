// src/app/router/index.tsx
// 应用路由总表：挂载所有页面，包括财务分析 / 诊断 / DevConsole 等

import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { AppLayout } from "../layout/AppLayout";
import { RequireAuth, RequirePermission, ForbiddenPage, RouteLoading } from "./guards";
import * as P from "./lazyPages";
import { ReceiveSupplementPage } from "../../features/operations/inbound/ReceiveSupplementPage";

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
            path="outbound/pick"
            element={
              <RequirePermission permission="operations.outbound">
                <P.OutboundPickV2Page />
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

          {/* 库存 & 报表 */}
          <Route
            path="snapshot"
            element={
              <RequirePermission permission="report.inventory">
                <P.SnapshotPage />
              </RequirePermission>
            }
          />
          {/* ✅ 库存台账（业务入口） */}
          <Route
            path="inventory/ledger"
            element={
              <RequirePermission permission="report.inventory">
                <P.StockLedgerPage />
              </RequirePermission>
            }
          />

          <Route
            path="inventory/outbound-dashboard"
            element={
              <RequirePermission permission="report.outbound">
                <P.OutboundDashboardPage />
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

          {/* 采购系统 */}
          {/* ✅ 一个页面：采购概览（进度 + 统计） */}
          <Route
            path="purchase-orders/overview"
            element={
              <RequirePermission permission="purchase.manage">
                <P.PurchaseOverviewPage />
              </RequirePermission>
            }
          />

          {/* 旧入口：全部重定向到 overview（实现“合到一起”） */}
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

          {/* 诊断 & 工具 */}
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

          {/* DevConsole */}
          <Route
            path="dev"
            element={
              <RequirePermission permission="dev.tools.access">
                <P.DevConsolePage />
              </RequirePermission>
            }
          />

          {/* 系统管理 */}
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

          {/* ✅ 新增：仓库创建页（独立页，避免列表页内嵌创建表单） */}
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
          <Route
            path="admin/shipping-providers"
            element={
              <RequirePermission permission="config.store.write">
                <P.ShippingProvidersListPage />
              </RequirePermission>
            }
          />

          {/* ✅ 运价方案独立工作台 */}
          <Route
            path="admin/shipping-providers/schemes/:schemeId/workbench"
            element={
              <RequirePermission permission="config.store.write">
                <P.SchemeWorkbenchPage />
              </RequirePermission>
            }
          />

          {/* 用户管理总控页 */}
          <Route
            path="admin/users-admin"
            element={
              <RequirePermission permission="system.user.manage">
                <P.UsersAdminPage />
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
