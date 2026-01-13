// src/app/router/lazyPages.tsx
// =====================================================
// 全站页面 lazy import 清单（集中管理）
// =====================================================

import { lazy } from "react";

// 登录页
export const LoginPage = lazy(() => import("../../features/auth/LoginPage"));

// 作业台 (Cockpits)
export const CountCockpitPage = lazy(() => import("../../features/operations/count/CountCockpitPage"));
export const OutboundPickV2Page = lazy(() => import("../../features/operations/outbound-pick/OutboundPickV2Page"));
export const InboundCockpitPage = lazy(() => import("../../features/operations/inbound/InboundCockpitPage"));
export const PickTasksCockpitPage = lazy(() => import("../../features/operations/outbound-pick/PickTasksCockpitPage"));
export const ShipCockpitPage = lazy(() => import("../../features/operations/ship/ShipCockpitPage"));
export const InternalOutboundPage = lazy(() => import("../../features/operations/ship/InternalOutboundPage"));
export const ShippingLabelPrintPage = lazy(() => import("../../features/operations/ship/ShippingLabelPrintPage"));

// 库存 & 报表
export const SnapshotPage = lazy(() => import("../../features/inventory/snapshot/SnapshotPage"));
export const StockLedgerPage = lazy(() => import("../../features/inventory/ledger/StockLedgerPage"));
export const ChannelInventoryPage = lazy(() => import("../../features/inventory/channel-inventory/ChannelInventoryPage"));
export const OutboundDashboardPage = lazy(() => import("../../features/inventory/outbound-dashboard/OutboundDashboardPage"));

// 发货成本报表 / 发货账本详情
export const ShippingReportsPage = lazy(() => import("../../features/inventory/shipping-reports/ShippingReportsPage"));
export const ShippingRecordDetailPage = lazy(() => import("../../features/inventory/shipping-records/ShippingRecordDetailPage"));

// 诊断 & 工具（Studio）
export const TraceStudioPage = lazy(() => import("../../features/diagnostics/trace/TraceStudioPage"));
export const InventoryStudioPage = lazy(() => import("../../features/diagnostics/stock-tool/InventoryStudioPage"));
export const LedgerStudioPage = lazy(() => import("../../features/diagnostics/ledger-tool/LedgerStudioPage"));
export const DevConsolePage = lazy(() => import("../../features/dev/DevConsolePage"));

// 系统管理
export const StoresListPage = lazy(() => import("../../features/admin/stores/StoresListPage"));
export const StoreDetailPage = lazy(() => import("../../features/admin/stores/StoreDetailPage"));
export const ItemsPage = lazy(() => import("../../features/admin/items/ItemsPage"));
export const UsersAdminPage = lazy(() => import("../../features/admin/users/UsersAdminPage"));

// 仓库管理
export const WarehousesListPage = lazy(() => import("../../features/admin/warehouses/WarehousesListPage"));
export const WarehouseDetailPage = lazy(() => import("../../features/admin/warehouses/WarehouseDetailPage"));

// 供应商主数据
export const SuppliersListPage = lazy(() => import("../../features/admin/suppliers/SuppliersListPage"));

// 物流 / 快递公司主数据
export const ShippingProvidersListPage = lazy(() => import("../../features/admin/shipping-providers/ShippingProvidersListPage"));

// ✅ 运价方案工作台（独立页，非弹窗）
export const SchemeWorkbenchPage = lazy(() => import("../../features/admin/shipping-providers/scheme/SchemeWorkbenchPage"));

// 采购系统
export const PurchaseOrdersPage = lazy(() => import("../../features/purchase-orders/PurchaseOrdersPage"));
export const PurchaseOrderDetailPage = lazy(() => import("../../features/purchase-orders/PurchaseOrderDetailPage"));
export const PurchaseOrderCreateV2Page = lazy(() => import("../../features/purchase-orders/PurchaseOrderCreateV2Page"));
export const PurchaseReportsPage = lazy(() => import("../../features/purchase-orders/PurchaseReportsPage"));

// 收货任务详情
export const ReceiveTaskDetailPage = lazy(() => import("../../features/receive-tasks/ReceiveTaskDetailPage"));

// 退货任务详情
export const ReturnTaskDetailPage = lazy(() => import("../../features/return-tasks/ReturnTaskDetailPage"));

// 订单管理
export const OrdersPage = lazy(() => import("../../features/orders/OrdersPage"));
export const OrdersStatsPage = lazy(() => import("../../features/orders/OrdersStatsPage"));

// 财务分析
export const FinanceOverviewPage = lazy(() => import("../../features/finance/FinanceOverviewPage"));
export const FinanceShopPage = lazy(() => import("../../features/finance/FinanceShopPage"));
export const FinanceSkuPage = lazy(() => import("../../features/finance/FinanceSkuPage"));
export const FinanceOrderUnitPage = lazy(() => import("../../features/finance/FinanceOrderUnitPage"));
