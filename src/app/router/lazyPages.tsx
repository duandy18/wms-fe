// src/app/router/lazyPages.tsx
// =====================================================
// 全站页面 lazy import 清单（集中管理）
// =====================================================

import { lazy } from "react";

// 登录页
export const LoginPage = lazy(() => import("../../features/auth/LoginPage"));

// 作业台 (Cockpits)
export const InboundReceiptsSummaryPage = lazy(
  () => import("../../features/inbound-receipts/pages/InboundReceiptsSummaryPage"),
);
export const InboundReceiptsPurchasePage = lazy(
  () => import("../../features/inbound-receipts/pages/InboundReceiptsPurchasePage"),
);
export const InboundReceiptsManualPage = lazy(
  () => import("../../features/inbound-receipts/pages/InboundReceiptsManualPage"),
);
export const ReceivingSummaryPage = lazy(
  () => import("../../features/wms/receiving/pages/ReceivingSummaryPage"),
);
export const ReceivingPurchasePage = lazy(
  () => import("../../features/wms/receiving/pages/ReceivingPurchasePage"),
);
export const ReceivingManualPage = lazy(
  () => import("../../features/wms/receiving/pages/ReceivingManualPage"),
);
export const ReceivingTaskPage = lazy(
  () => import("../../features/wms/receiving/pages/ReceivingTaskPage"),
);

// WMS 出库新主线
export const OutboundSummaryPage = lazy(
  () => import("../../features/wms/outbound/pages/OutboundSummaryPage"),
);
export const OutboundOrderPage = lazy(
  () => import("../../features/wms/outbound/pages/OutboundOrderPage"),
);
export const OutboundManualDocsPage = lazy(
  () => import("../../features/wms/outbound/pages/OutboundManualDocsPage"),
);
export const OutboundManualPage = lazy(
  () => import("../../features/wms/outbound/pages/OutboundManualPage"),
);

export const ShipmentPreparePage = lazy(
  () => import("../../features/shipping-assist/shipment/pages/ShipmentPreparePage"),
);
export const ShipmentCockpitPage = lazy(
  () => import("../../features/shipping-assist/shipment/pages/ShipmentCockpitPage"),
);
export const ShippingLabelPrintPage = lazy(
  () => import("../../features/shipping-assist/shipment/pages/ShippingLabelPrintPage"),
);

// 库存 & 报表
export const InventoryPage = lazy(
  () => import("../../features/wms/inventory/inventory/pages/InventoryPage"),
);

// 库存台账（业务页）
export const InventoryLedgerPage = lazy(
  () => import("../../features/wms/inventory/ledger/InventoryLedgerPage"),
);

// 库存调节
export const InventoryAdjustmentSummaryPage = lazy(
  () =>
    import(
      "../../features/wms/inventory-adjustment/pages/InventoryAdjustmentSummaryPage"
    ),
);
export const InventoryCountPage = lazy(
  () => import("../../features/wms/inventory-adjustment/pages/InventoryCountPage"),
);
export const InventoryInboundReversalPage = lazy(
  () =>
    import(
      "../../features/wms/inventory-adjustment/pages/InventoryInboundReversalPage"
    ),
);
export const InventoryOutboundReversalPage = lazy(
  () =>
    import(
      "../../features/wms/inventory-adjustment/pages/InventoryOutboundReversalPage"
    ),
);
export const InventoryReturnInboundPage = lazy(
  () =>
    import(
      "../../features/wms/inventory-adjustment/pages/InventoryReturnInboundPage"
    ),
);

// 发货辅助：运价管理 / 运价表 / 发货记录 / 快递账单 / 费用对账
export const PricingPage = lazy(
  () => import("../../features/shipping-assist/pricing/pages/PricingPage"),
);
export const TemplatesPage = lazy(
  () => import("../../features/shipping-assist/pricingTemplates/pages/TemplatesPage"),
);
export const TemplateWorkbenchPage = lazy(
  () =>
    import("../../features/shipping-assist/pricingTemplates/workbench/TemplateWorkbenchPage"),
);
export const ShippingLedgerPage = lazy(
  () => import("../../features/shipping-assist/records/pages/ShippingLedgerPage"),
);

export const BillingItemsPage = lazy(
  () => import("../../features/shipping-assist/billing/pages/BillingItemsPage"),
);
export const ReconciliationPage = lazy(
  () => import("../../features/shipping-assist/reconciliation/pages/ReconciliationPage"),
);

// 平台订单采集
export const OmsPddPlatformOrderMirrorPage = lazy(
  () => import("../../features/oms/platforms/pages/OmsPddPlatformOrderMirrorPage"),
);
export const OmsPddFskuMappingPage = lazy(
  () => import("../../features/oms/platforms/pages/OmsPddFskuMappingPage"),
);
export const OmsPddFulfillmentOrderConversionPage = lazy(
  () => import("../../features/oms/platforms/pages/OmsPddFulfillmentOrderConversionPage"),
);

export const OmsTaobaoPlatformOrderMirrorPage = lazy(
  () => import("../../features/oms/platforms/pages/OmsTaobaoPlatformOrderMirrorPage"),
);
export const OmsTaobaoFskuMappingPage = lazy(
  () => import("../../features/oms/platforms/pages/OmsTaobaoFskuMappingPage"),
);
export const OmsTaobaoFulfillmentOrderConversionPage = lazy(
  () => import("../../features/oms/platforms/pages/OmsTaobaoFulfillmentOrderConversionPage"),
);

export const OmsJdPlatformOrderMirrorPage = lazy(
  () => import("../../features/oms/platforms/pages/OmsJdPlatformOrderMirrorPage"),
);
export const OmsJdFskuMappingPage = lazy(
  () => import("../../features/oms/platforms/pages/OmsJdFskuMappingPage"),
);
export const OmsJdFulfillmentOrderConversionPage = lazy(
  () => import("../../features/oms/platforms/pages/OmsJdFulfillmentOrderConversionPage"),
);

export const AnalyticsPage = lazy(
  () => import("../../features/oms/analytics/AnalyticsPage"),
);

// 主数据
export const ItemsPage = lazy(
  () => import("../../features/pms/items/pages/ItemsPage"),
);
export const ItemBarcodesPage = lazy(
  () => import("../../features/pms/items/pages/ItemBarcodesPage"),
);
export const PmsBrandsPage = lazy(
  () => import("../../features/pms/master-data/pages/PmsBrandsPage"),
);
export const PmsCategoriesPage = lazy(
  () => import("../../features/pms/master-data/pages/PmsCategoriesPage"),
);
export const PmsAttributeDefsPage = lazy(
  () => import("../../features/pms/master-data/pages/PmsAttributeDefsPage"),
);
export const PmsItemUomsPage = lazy(
  () => import("../../features/pms/master-data/pages/PmsItemUomsPage"),
);
export const SkuCodingGeneratorPage = lazy(
  () => import("../../features/pms/sku-coding/pages/SkuCodingGeneratorPage"),
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

// 发货辅助 / 快递网点
export const ShippingProvidersListPage = lazy(
  () => import("../../features/shipping-assist/providers/ShippingProvidersListPage"),
);

// 快递网点编辑页（仅维护网点基本信息 / 联系人）
export const ShippingProviderEditPage = lazy(
  () => import("../../features/shipping-assist/providers/pages/ShippingProviderEditPage"),
);

// 快递网点详情页（当前收敛到编辑页入口）
export const ShippingProviderDetailPage = lazy(
  () => import("../../features/shipping-assist/providers/pages/ShippingProviderDetailPage"),
);

// 电子面单配置
export const ElectronicWaybillConfigPage = lazy(
  () => import("../../features/shipping-assist/waybillConfigs/pages/ElectronicWaybillConfigPage"),
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

// 退货任务详情
export const ReturnTaskDetailPage = lazy(
  () => import("../../features/return-tasks/ReturnTaskDetailPage"),
);

// 财务分析
export const FinanceOverviewPage = lazy(
  () => import("../../features/finance/pages/FinanceOverviewPage"),
);
export const FinanceOrderSalesPage = lazy(
  () => import("../../features/finance/pages/FinanceOrderSalesPage"),
);
export const FinancePurchaseCostPage = lazy(
  () => import("../../features/finance/pages/FinancePurchaseCostPage"),
);
export const FinanceShippingCostPage = lazy(
  () => import("../../features/finance/pages/FinanceShippingCostPage"),
);
