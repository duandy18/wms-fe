// src/app/router/lazyPages.tsx
// =====================================================
// 全站页面 lazy import 清单（集中管理）
// =====================================================

import { lazy } from "react";

// 登录页
export const LoginPage = lazy(() => import("../../features/auth/LoginPage"));

// 作业台 (Cockpits)
export const CountCockpitPage = lazy(() => import("../../features/operations/count/CountCockpitPage"));
export const InboundCockpitPage = lazy(() => import("../../features/operations/inbound/InboundCockpitPage"));
export const PickTasksCockpitPage = lazy(() => import("../../features/operations/outbound-pick/PickTasksCockpitPage"));
export const ShipCockpitPage = lazy(() => import("../../features/operations/ship/ShipCockpitPage"));
export const InternalOutboundPage = lazy(() => import("../../features/operations/ship/InternalOutboundPage"));
export const ShippingLabelPrintPage = lazy(() => import("../../features/operations/ship/ShippingLabelPrintPage"));

// 库存 & 报表
export const SnapshotPage = lazy(() => import("../../features/inventory/snapshot/SnapshotPage"));
export const OutboundDashboardPage = lazy(() => import("../../features/inventory/outbound-dashboard/OutboundDashboardPage"));

// ✅ 库存台账（业务页）
export const StockLedgerPage = lazy(() => import("../../features/inventory/ledger/StockLedgerPage"));

// 发货成本报表 / 发货账本详情
export const ShippingReportsPage = lazy(() => import("../../features/inventory/shipping-reports/ShippingReportsPage"));
export const ShippingRecordDetailPage = lazy(() => import("../../features/inventory/shipping-records/ShippingRecordDetailPage"));

// 诊断 & 工具（Studio）
export const TraceStudioPage = lazy(() => import("../../features/diagnostics/trace/TraceStudioPage"));
export const InventoryStudioPage = lazy(() => import("../../features/diagnostics/stock-tool/InventoryStudioPage"));
export const LedgerStudioPage = lazy(() => import("../../features/diagnostics/ledger-tool/LedgerStudioPage"));
export const DevConsolePage = lazy(() => import("../../features/dev/DevConsolePage"));

// ✅ 运维中心（新）
export const OpsOverviewPage = lazy(() => import("../../features/ops/OpsOverviewPage"));
export const OpsHealthPage = lazy(() => import("../../features/ops/OpsHealthPage"));
export const OpsTasksPage = lazy(() => import("../../features/ops/OpsTasksPage"));

// ✅ 系统治理：商铺商品组合（FSKU）
export const ShopProductBundlesPage = lazy(() => import("../../features/admin/shop-bundles/ShopProductBundlesPage"));

// ✅ 运维中心 / 后端调试台（Tab → 页面化）
export const OpsDevOrdersPage = lazy(() => import("../../features/ops/dev/OpsDevOrdersPage"));
export const OpsDevPickPage = lazy(() => import("../../features/ops/dev/OpsDevPickPage"));
export const OpsDevInboundPage = lazy(() => import("../../features/ops/dev/OpsDevInboundPage"));
export const OpsDevCountPage = lazy(() => import("../../features/ops/dev/OpsDevCountPage"));
export const OpsDevPlatformPage = lazy(() => import("../../features/ops/dev/OpsDevPlatformPage"));

// ✅ 运价运维中心（治理 / 修复 / 清理）
export const PricingOpsCenterPage = lazy(() => import("../../features/ops/pricing-ops/PricingOpsCenterPage"));
export const PricingOpsSchemeDetailPage = lazy(() => import("../../features/ops/pricing-ops/PricingOpsSchemeDetailPage"));
export const PricingOpsCleanupPage = lazy(() => import("../../features/ops/pricing-ops/PricingOpsCleanupPage"));

// 主数据
export const StoresListPage = lazy(() => import("../../features/admin/stores/StoresListPage"));
export const StoreDetailPage = lazy(() => import("../../features/admin/stores/StoreDetailPage"));
export const ItemsPage = lazy(() => import("../../features/admin/items/ItemsPage"));


// ✅ 权限与账号：3 个子页面（/iam/*）
export const UsersManagePage = lazy(() => import("../../features/admin/users/iam/UsersManagePage"));
export const RolesManagePage = lazy(() => import("../../features/admin/users/iam/RolesManagePage"));
export const PermissionsDictPage = lazy(() => import("../../features/admin/users/iam/PermissionsDictPage"));

// 仓库管理
export const WarehousesListPage = lazy(() => import("../../features/admin/warehouses/WarehousesListPage"));
export const WarehouseCreatePage = lazy(() => import("../../features/admin/warehouses/WarehouseCreatePage"));
export const WarehouseDetailPage = lazy(() => import("../../features/admin/warehouses/WarehouseDetailPage"));

// 供应商主数据
export const SuppliersListPage = lazy(() => import("../../features/admin/suppliers/SuppliersListPage"));

// 物流 / 快递公司主数据
export const ShippingProvidersListPage = lazy(
  () => import("../../features/admin/shipping-providers/ShippingProvidersListPage"),
);

// ✅ 快递网点编辑页（两页模型）
export const ShippingProviderEditPage = lazy(
  () => import("../../features/admin/shipping-providers/pages/ShippingProviderEditPage"),
);

// ✅ 快递公司详情页（Provider 维度：Tab → 子页面）
export const ShippingProviderDetailPage = lazy(
  () => import("../../features/admin/shipping-providers/pages/ShippingProviderDetailPage"),
);

// ✅ 运价方案工作台（纵向主线页：包含所有内容，从上到下））
export const SchemeWorkbenchFlowPage = lazy(
  () => import("../../features/admin/shipping-providers/scheme/SchemeWorkbenchFlowPage"),
);

// 采购系统
export const PurchaseOrdersPage = lazy(() => import("../../features/purchase-orders/PurchaseOrdersPage"));
export const PurchaseOrderDetailPage = lazy(() => import("../../features/purchase-orders/PurchaseOrderDetailPage"));
export const PurchaseOrderCreateV2Page = lazy(() => import("../../features/purchase-orders/PurchaseOrderCreateV2Page"));
export const PurchaseReportsPage = lazy(() => import("../../features/purchase-orders/PurchaseReportsPage"));
export const PurchaseOverviewPage = lazy(() => import("../../features/purchase-orders/PurchaseOverviewPage"));

// 收货任务详情
export const ReceiveTaskDetailPage = lazy(() => import("../../features/receive-tasks/ReceiveTaskDetailPage"));

// 退货任务详情
export const ReturnTaskDetailPage = lazy(() => import("../../features/return-tasks/ReturnTaskDetailPage"));

// 财务分析
export const FinanceOverviewPage = lazy(() => import("../../features/finance/FinanceOverviewPage"));
export const FinanceShopPage = lazy(() => import("../../features/finance/FinanceShopPage"));
export const FinanceSkuPage = lazy(() => import("../../features/finance/FinanceSkuPage"));
export const FinanceOrderUnitPage = lazy(() => import("../../features/finance/FinanceOrderUnitPage"));
