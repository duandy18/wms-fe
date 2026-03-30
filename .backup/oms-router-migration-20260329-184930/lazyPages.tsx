// src/app/router/lazyPages.tsx
// =====================================================
// 全站页面 lazy import 清单（集中管理）
// =====================================================

import { lazy } from "react";

// 登录页
export const LoginPage = lazy(() => import("../../features/auth/LoginPage"));

// 作业台 (Cockpits)
export const CountCockpitPage = lazy(
  () => import("../../features/operations/count/CountCockpitPage"),
);
export const InboundCockpitPage = lazy(
  () => import("../../features/operations/inbound/InboundCockpitPage"),
);
export const PickTasksCockpitPage = lazy(
  () => import("../../features/operations/outbound-pick/PickTasksCockpitPage"),
);
export const ShipmentPreparePage = lazy(
  () => import("../../features/tms/shipment/pages/ShipmentPreparePage"),
);
export const ShipmentCockpitPage = lazy(
  () => import("../../features/tms/shipment/pages/ShipmentCockpitPage"),
);
export const InternalOutboundPage = lazy(
  () => import("../../features/internal-outbound/pages/InternalOutboundPage"),
);
export const ShippingLabelPrintPage = lazy(
  () => import("../../features/tms/shipment/pages/ShippingLabelPrintPage"),
);

// 库存 & 报表
export const SnapshotPage = lazy(
  () => import("../../features/inventory/snapshot/SnapshotPage"),
);
export const OutboundDashboardPage = lazy(
  () =>
    import("../../features/inventory/outbound-dashboard/OutboundDashboardPage"),
);

// 库存台账（业务页）
export const StockLedgerPage = lazy(
  () => import("../../features/inventory/ledger/StockLedgerPage"),
);

// 物流：运价管理 / 运价模板 / 发货成本报表 / 发货账本详情
export const PricingPage = lazy(
  () => import("../../features/tms/pricing/pages/PricingPage"),
);
export const TemplatesPage = lazy(
  () => import("../../features/tms/pricingTemplates/pages/TemplatesPage"),
);
export const TemplateWorkbenchPage = lazy(
  () =>
    import("../../features/tms/pricingTemplates/workbench/TemplateWorkbenchPage"),
);
export const TransportReportsPage = lazy(
  () => import("../../features/tms/reports/pages/TransportReportsPage"),
);
export const ShippingLedgerPage = lazy(
  () => import("../../features/tms/records/pages/ShippingLedgerPage"),
);

export const BillingItemsPage = lazy(
  () => import("../../features/tms/billing/pages/BillingItemsPage"),
);
export const ReconciliationPage = lazy(
  () => import("../../features/tms/reconciliation/pages/ReconciliationPage"),
);

// OMS：平台接入 / 商铺管理 / 商铺商品组合 / 订单解析 / 统计分析
export const PlatformIntegrationsListPage = lazy(
  () => import("../../features/oms/platforms/PlatformIntegrationsListPage"),
);
export const PlatformIntegrationDetailPage = lazy(
  () => import("../../features/oms/platforms/PlatformIntegrationDetailPage"),
);
export const StoresListPage = lazy(
  () => import("../../features/oms/shops/StoresListPage"),
);
export const StoreDetailPage = lazy(
  () => import("../../features/oms/shops/StoreDetailPage"),
);
export const ShopProductBundlesPage = lazy(
  () => import("../../features/oms/fsku/ShopProductBundlesPage"),
);
export const OrdersPage = lazy(
  () => import("../../features/oms/parsing/OrdersPage"),
);
export const AnalyticsPage = lazy(
  () => import("../../features/oms/analytics/AnalyticsPage"),
);

// 主数据
export const ItemsPage = lazy(
  () => import("../../features/admin/items/ItemsPage"),
);

// 权限与账号：3 个子页面（/iam/*）
export const UsersManagePage = lazy(
  () => import("../../features/admin/users/iam/UsersManagePage"),
);
export const RolesManagePage = lazy(
  () => import("../../features/admin/users/iam/RolesManagePage"),
);
export const PermissionsDictPage = lazy(
  () => import("../../features/admin/users/iam/PermissionsDictPage"),
);

// 仓库管理
export const WarehousesListPage = lazy(
  () => import("../../features/admin/warehouses/WarehousesListPage"),
);
export const WarehouseCreatePage = lazy(
  () => import("../../features/admin/warehouses/WarehouseCreatePage"),
);
export const WarehouseDetailPage = lazy(
  () => import("../../features/admin/warehouses/WarehouseDetailPage"),
);

// 供应商主数据
export const SuppliersListPage = lazy(
  () => import("../../features/admin/suppliers/SuppliersListPage"),
);

// 物流 / 快递网点
export const ShippingProvidersListPage = lazy(
  () => import("../../features/tms/providers/ShippingProvidersListPage"),
);

// 快递网点编辑页（仅维护网点基本信息 / 联系人）
export const ShippingProviderEditPage = lazy(
  () => import("../../features/tms/providers/pages/ShippingProviderEditPage"),
);

// 快递网点详情页（当前收敛到编辑页入口）
export const ShippingProviderDetailPage = lazy(
  () => import("../../features/tms/providers/pages/ShippingProviderDetailPage"),
);

// 电子面单配置
export const ElectronicWaybillConfigPage = lazy(
  () => import("../../features/tms/waybillConfigs/pages/ElectronicWaybillConfigPage"),
);

// 采购系统
export const PurchaseOrdersPage = lazy(
  () => import("../../features/purchase-orders/PurchaseOrdersPage"),
);
export const PurchaseOrderDetailPage = lazy(
  () => import("../../features/purchase-orders/PurchaseOrderDetailPage"),
);
export const PurchaseOrderCreateV2Page = lazy(
  () => import("../../features/purchase-orders/PurchaseOrderCreateV2Page"),
);
export const PurchaseReportsPage = lazy(
  () => import("../../features/purchase-orders/PurchaseReportsPage"),
);
export const PurchaseOverviewPage = lazy(
  () => import("../../features/purchase-orders/PurchaseOverviewPage"),
);

// 收货任务详情
export const ReceiveTaskDetailPage = lazy(
  () => import("../../features/receive-tasks/ReceiveTaskDetailPage"),
);

// 退货任务详情
export const ReturnTaskDetailPage = lazy(
  () => import("../../features/return-tasks/ReturnTaskDetailPage"),
);

// 财务分析
export const FinanceOverviewPage = lazy(
  () => import("../../features/finance/FinanceOverviewPage"),
);
export const FinanceShopPage = lazy(
  () => import("../../features/finance/FinanceShopPage"),
);
export const FinanceSkuPage = lazy(
  () => import("../../features/finance/FinanceSkuPage"),
);
export const FinanceOrderUnitPage = lazy(
  () => import("../../features/finance/FinanceOrderUnitPage"),
);
