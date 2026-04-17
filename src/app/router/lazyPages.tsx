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
export const InboundWorkbenchPage = lazy(
  () => import("../../features/wms/inbound/pages/InboundWorkbenchPage"),
);
export const InboundReceiptsSummaryPage = lazy(
  () => import("../../features/inbound-receipts/pages/InboundReceiptsSummaryPage"),
);
export const InboundReceiptsPurchasePage = lazy(
  () => import("../../features/inbound-receipts/pages/InboundReceiptsPurchasePage"),
);
export const InboundReceiptsReturnsPage = lazy(
  () => import("../../features/inbound-receipts/pages/InboundReceiptsReturnsPage"),
);
export const InboundReceiptsManualPage = lazy(
  () => import("../../features/inbound-receipts/pages/InboundReceiptsManualPage"),
);
export const InboundOperationsPage = lazy(
  () => import("../../features/wms/inbound-operations/pages/InboundOperationsPage"),
);
export const InboundOperationTaskPage = lazy(
  () => import("../../features/wms/inbound-operations/pages/InboundOperationTaskPage"),
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
export const InventoryPage = lazy(
  () => import("../../features/wms/inventory/inventory/pages/InventoryPage"),
);
export const OutboundDashboardPage = lazy(
  () =>
    import("../../features/inventory/outbound-dashboard/OutboundDashboardPage"),
);

// 库存台账（业务页）
export const InventoryLedgerPage = lazy(
  () => import("../../features/wms/inventory/ledger/InventoryLedgerPage"),
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
export const AnalyticsPage = lazy(
  () => import("../../features/oms/analytics/AnalyticsPage"),
);

export const PddStoresPage = lazy(
  () => import("../../features/oms/pdd/pages/PddStoresPage"),
);
export const PddOrdersPage = lazy(
  () => import("../../features/oms/pdd/pages/PddOrdersPage"),
);
export const PddOrderDetailPage = lazy(
  () => import("../../features/oms/pdd/pages/PddOrderDetailPage"),
);
export const TaobaoStoresPage = lazy(
  () => import("../../features/oms/taobao/pages/TaobaoStoresPage"),
);
export const TaobaoOrdersPage = lazy(
  () => import("../../features/oms/taobao/pages/TaobaoOrdersPage"),
);
export const TaobaoOrderDetailPage = lazy(
  () => import("../../features/oms/taobao/pages/TaobaoOrderDetailPage"),
);
export const JdStoresPage = lazy(
  () => import("../../features/oms/jd/pages/JdStoresPage"),
);
export const JdOrdersPage = lazy(
  () => import("../../features/oms/jd/pages/JdOrdersPage"),
);
export const JdOrderDetailPage = lazy(
  () => import("../../features/oms/jd/pages/JdOrderDetailPage"),
);

// 主数据
export const ItemsPage = lazy(
  () => import("../../features/pms/items/pages/ItemsPage"),
);
export const ItemBarcodesPage = lazy(
  () => import("../../features/pms/items/pages/ItemBarcodesPage"),
);

// 系统管理：admin/users
export const UsersManagePage = lazy(
  () => import("../../features/admin/users/UsersManagePage"),
);

// 仓库管理
export const WarehousesListPage = lazy(
  () => import("../../features/wms/warehouses/WarehousesListPage"),
);
export const WarehouseCreatePage = lazy(
  () => import("../../features/wms/warehouses/WarehouseCreatePage"),
);
export const WarehouseDetailPage = lazy(
  () => import("../../features/wms/warehouses/WarehouseDetailPage"),
);

// 供应商主数据
export const SuppliersListPage = lazy(
  () => import("../../features/pms/suppliers/pages/SuppliersListPage"),
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
export const PurchaseOrderCreatePage = lazy(
  () => import("../../features/purchase-orders/PurchaseOrderCreatePage"),
);
export const PurchaseOrderViewPage = lazy(
  () => import("../../features/purchase-orders/PurchaseOrderViewPage"),
);
export const PurchaseReportsPage = lazy(
  () => import("../../features/purchase-orders/PurchaseReportsPage"),
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
