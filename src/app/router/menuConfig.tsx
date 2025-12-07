// src/app/router/menuConfig.tsx
// 左侧菜单配置：分区 + 每个路由项

import InboundCockpitPage from "../../features/operations/inbound/InboundCockpitPage";

import OutboundPickV2Page from "../../features/operations/outbound-pick/OutboundPickV2Page";
import PickTasksCockpitPage from "../../features/operations/outbound-pick/PickTasksCockpitPage";

import CountCockpitPage from "../../features/operations/count/CountCockpitPage";
import ShipCockpitPage from "../../features/operations/ship/ShipCockpitPage";

import SnapshotPage from "../../features/inventory/snapshot/SnapshotPage";
import ChannelInventoryPage from "../../features/inventory/channel-inventory/ChannelInventoryPage";
import OutboundDashboardPage from "../../features/inventory/outbound-dashboard/OutboundDashboardPage";
import ShippingReportsPage from "../../features/inventory/shipping-reports/ShippingReportsPage";
import ShippingRecordDetailPage from "../../features/inventory/shipping-records/ShippingRecordDetailPage";

import OrdersPage from "../../features/orders/OrdersPage";
import OrdersStatsPage from "../../features/orders/OrdersStatsPage";

// Diagnostics Studio 壳子
import TraceStudioPage from "../../features/diagnostics/trace/TraceStudioPage";
import LedgerStudioPage from "../../features/diagnostics/ledger-tool/LedgerStudioPage";
import InventoryStudioPage from "../../features/diagnostics/stock-tool/InventoryStudioPage";

import DevConsolePage from "../../features/dev/DevConsolePage";

import StoresListPage from "../../features/admin/stores/StoresListPage";
import StoreDetailPage from "../../features/admin/stores/StoreDetailPage";
import WarehousesListPage from "../../features/admin/warehouses/WarehousesListPage";
import WarehouseDetailPage from "../../features/admin/warehouses/WarehouseDetailPage";
import ItemsPage from "../../features/admin/items/ItemsPage";
import SuppliersListPage from "../../features/admin/suppliers/SuppliersListPage";
import ShippingProvidersListPage from "../../features/admin/shipping-providers/ShippingProvidersListPage";
import UsersAdminPage from "../../features/admin/users/UsersAdminPage";

import PurchaseOrdersPage from "../../features/purchase-orders/PurchaseOrdersPage";
import PurchaseOrderCreateV2Page from "../../features/purchase-orders/PurchaseOrderCreateV2Page";
import PurchaseReportsPage from "../../features/purchase-orders/PurchaseReportsPage";

// 财务分析
import FinanceOverviewPage from "../../features/finance/FinanceOverviewPage";
import FinanceShopPage from "../../features/finance/FinanceShopPage";
import FinanceSkuPage from "../../features/finance/FinanceSkuPage";
import FinanceOrderUnitPage from "../../features/finance/FinanceOrderUnitPage";

export type PermissionCode =
  | "work.inbound"
  | "work.count"
  | "work.pick"
  | "work.orders"
  | "report.snapshot"
  | "report.channel_inventory"
  | "report.outbound_metrics"
  | "tool.trace"
  | "tool.stocks"
  | "tool.ledger"
  | "admin.stores"
  | "admin.users";

export interface RouteItem {
  path: string;
  label: string;
  element: JSX.Element;
  requiredPermissions?: PermissionCode[];
  showInSidebar?: boolean;
  devOnly?: boolean;
}

export interface RouteSection {
  id: string;
  label: string;
  items: RouteItem[];
}

/* ---------------- MENU ---------------- */

export const menuSections: RouteSection[] = [
  {
    id: "operations",
    label: "作业台",
    items: [
      {
        path: "/inbound",
        label: "收货 Cockpit",
        element: <InboundCockpitPage />,
        requiredPermissions: ["work.inbound"],
      },
      {
        path: "/outbound/pick",
        label: "拣货出库（旧版）",
        element: <OutboundPickV2Page />,
        requiredPermissions: ["work.pick"],
        showInSidebar: false,
      },
      {
        path: "/outbound/pick-tasks",
        label: "拣货任务 Cockpit",
        element: <PickTasksCockpitPage />,
        requiredPermissions: ["work.pick"],
      },
      {
        path: "/count",
        label: "盘点 Cockpit",
        element: <CountCockpitPage />,
        requiredPermissions: ["work.count"],
      },
      {
        path: "/outbound/ship",
        label: "发货 Cockpit",
        element: <ShipCockpitPage />,
        // 暂时共用拣货权限；后面如果拆分，可以单独加 work.ship
        requiredPermissions: ["work.pick"],
      },
    ],
  },

  {
    id: "inventory",
    label: "库存 & 报表",
    items: [
      {
        path: "/snapshot",
        label: "即时库存 / FEFO 风险",
        element: <SnapshotPage />,
        requiredPermissions: ["report.snapshot"],
      },
      {
        path: "/channel-inventory",
        label: "渠道库存",
        element: <ChannelInventoryPage />,
        requiredPermissions: ["report.channel_inventory"],
      },
      {
        path: "/inventory/outbound-dashboard",
        label: "出库 Dashboard",
        element: <OutboundDashboardPage />,
        requiredPermissions: ["report.outbound_metrics"],
      },
      {
        path: "/shipping/reports",
        label: "发货成本报表",
        element: <ShippingReportsPage />,
        requiredPermissions: ["report.outbound_metrics"],
      },
      {
        path: "/shipping/record",
        label: "发货账本详情",
        element: <ShippingRecordDetailPage />,
        requiredPermissions: ["report.outbound_metrics"],
      },
    ],
  },

  {
    id: "finance",
    label: "财务分析",
    items: [
      {
        path: "/finance",
        label: "收入 / 成本 / 毛利",
        element: <FinanceOverviewPage />,
        requiredPermissions: ["report.outbound_metrics"],
      },
      {
        path: "/finance/shop",
        label: "店铺盈利能力",
        element: <FinanceShopPage />,
        requiredPermissions: ["report.outbound_metrics"],
      },
      {
        path: "/finance/sku",
        label: "SKU 毛利榜",
        element: <FinanceSkuPage />,
        requiredPermissions: ["report.outbound_metrics"],
      },
      {
        path: "/finance/order-unit",
        label: "客单价 / 贡献度",
        element: <FinanceOrderUnitPage />,
        requiredPermissions: ["report.outbound_metrics"],
      },
    ],
  },

  {
    id: "orders",
    label: "订单管理",
    items: [
      {
        path: "/orders",
        label: "订单列表",
        element: <OrdersPage />,
        requiredPermissions: ["work.orders"],
      },
      {
        path: "/orders/stats",
        label: "订单统计",
        element: <OrdersStatsPage />,
        requiredPermissions: ["work.orders"],
      },
    ],
  },

  {
    id: "purchase",
    label: "采购管理",
    items: [
      {
        path: "/purchase-orders",
        label: "采购单列表",
        element: <PurchaseOrdersPage />,
        requiredPermissions: ["work.inbound"],
      },
      {
        path: "/purchase-orders/new-v2",
        label: "采购单生成",
        element: <PurchaseOrderCreateV2Page />,
        requiredPermissions: ["work.inbound"],
      },
      {
        path: "/purchase-orders/reports",
        label: "采购报表",
        element: <PurchaseReportsPage />,
        requiredPermissions: ["work.inbound"],
      },
    ],
  },

  {
    id: "diagnostics",
    label: "诊断 & 分析",
    items: [
      {
        path: "/trace",
        label: "Trace Studio",
        element: <TraceStudioPage />,
        requiredPermissions: ["tool.trace"],
      },
      {
        path: "/tools/ledger",
        label: "Ledger Studio",
        element: <LedgerStudioPage />,
        requiredPermissions: ["tool.ledger"],
      },
      {
        path: "/tools/stocks",
        label: "Inventory Studio",
        element: <InventoryStudioPage />,
        requiredPermissions: ["tool.stocks"],
      },
    ],
  },

  {
    id: "devtools",
    label: "开发者工具",
    items: [
      {
        path: "/dev",
        label: "后端调试台",
        element: <DevConsolePage />,
        requiredPermissions: ["tool.trace"],
        devOnly: true,
      },
    ],
  },

  {
    id: "admin",
    label: "系统管理",
    items: [
      {
        path: "/stores",
        label: "店铺管理",
        element: <StoresListPage />,
        requiredPermissions: ["admin.stores"],
      },
      {
        path: "/stores/:storeId",
        label: "店铺详情",
        element: <StoreDetailPage />,
        requiredPermissions: ["admin.stores"],
        showInSidebar: false,
      },
      {
        path: "/warehouses",
        label: "仓库管理",
        element: <WarehousesListPage />,
        requiredPermissions: ["admin.stores"],
      },
      {
        path: "/warehouses/:warehouseId",
        label: "仓库详情",
        element: <WarehouseDetailPage />,
        requiredPermissions: ["admin.stores"],
        showInSidebar: false,
      },
      {
        path: "/admin/items",
        label: "商品主数据",
        element: <ItemsPage />,
        requiredPermissions: ["admin.stores"],
      },
      {
        path: "/admin/suppliers",
        label: "供应商主数据",
        element: <SuppliersListPage />,
        requiredPermissions: ["admin.stores"],
      },
      {
        path: "/admin/shipping-providers",
        label: "物流 / 快递公司",
        element: <ShippingProvidersListPage />,
        requiredPermissions: ["admin.stores"],
      },
      {
        path: "/admin/users-admin",
        label: "用户管理总控",
        element: <UsersAdminPage />,
        requiredPermissions: ["admin.users"],
      },
    ],
  },
];

export const flatRoutes: RouteItem[] = menuSections.flatMap((s) => s.items);
