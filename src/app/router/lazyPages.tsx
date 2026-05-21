// src/app/router/lazyPages.tsx
// =====================================================
// 全站页面 lazy import 清单（集中管理）
// =====================================================

import { lazy } from "react";

// 登录页
export const LoginPage = lazy(() => import("../../features/auth/LoginPage"));
export const SsoCallbackPage = lazy(
  () => import("../../features/auth/SsoCallbackPage"),
);

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

// 发货辅助：发货交接
export const ShippingHandoffPage = lazy(
  () => import("../../features/shipping-assist/handoffs/pages/ShippingHandoffPage"),
);

// 发货辅助：发货记录
export const ShippingLedgerPage = lazy(
  () => import("../../features/shipping-assist/records/pages/ShippingLedgerPage"),
);






// 订单管理：OMS fulfillment projection
export const OmsOrderProjectionPage = lazy(
  () => import("../../features/oms/projections/pages/OmsOrderProjectionPage"),
);
export const OmsLineProjectionPage = lazy(
  () => import("../../features/oms/projections/pages/OmsLineProjectionPage"),
);
export const OmsComponentProjectionPage = lazy(
  () => import("../../features/oms/projections/pages/OmsComponentProjectionPage"),
);

// 系统管理：admin/users
export const UsersManagePage = lazy(
  () => import("../../features/admin/users/UsersManagePage"),
);

// 商品管理：PMS projection
export const PmsItemProjectionPage = lazy(
  () => import("../../features/pms/projections/pages/PmsItemProjectionPage"),
);
export const PmsSupplierProjectionPage = lazy(
  () => import("../../features/pms/projections/pages/PmsSupplierProjectionPage"),
);
export const PmsUomProjectionPage = lazy(
  () => import("../../features/pms/projections/pages/PmsUomProjectionPage"),
);
export const PmsSkuCodeProjectionPage = lazy(
  () => import("../../features/pms/projections/pages/PmsSkuCodeProjectionPage"),
);
export const PmsBarcodeProjectionPage = lazy(
  () => import("../../features/pms/projections/pages/PmsBarcodeProjectionPage"),
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

// 合作方：供应商
export const SuppliersListPage = lazy(
  () => import("../../features/partners/suppliers/pages/SuppliersListPage"),
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
