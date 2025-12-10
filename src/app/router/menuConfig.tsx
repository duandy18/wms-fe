// src/app/router/menuConfig.tsx
// 左侧菜单配置：分区 + 每个路由项
//
// 注意：这里只负责“菜单的元信息”（path / label / 权限 / 显示规则）。
// 真正的页面组件挂载在 router/index.tsx 里通过 React.lazy + <Route> 完成。

import type { PermissionCode } from "../auth/permissions";

export interface RouteItem {
  path: string;
  label: string;
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
        requiredPermissions: ["work.inbound"],
      },
      {
        path: "/outbound/pick",
        label: "拣货出库（旧版）",
        requiredPermissions: ["work.pick"],
        showInSidebar: false,
      },
      {
        path: "/outbound/pick-tasks",
        label: "拣货任务 Cockpit",
        requiredPermissions: ["work.pick"],
      },
      {
        path: "/count",
        label: "盘点 Cockpit",
        requiredPermissions: ["work.count"],
      },
      {
        path: "/outbound/ship",
        label: "发货 Cockpit",
        // 暂时共用拣货权限；后面如果拆分，可以单独加 work.ship
        requiredPermissions: ["work.pick"],
      },
      {
        path: "/outbound/internal-outbound",
        label: "内部出库 Cockpit",
        // 内部出库同属出库作业，菜单逻辑沿用 work.pick，
        // 路由里再挂 operations.internal_outbound 做更细权限控制。
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
        requiredPermissions: ["report.snapshot"],
      },
      {
        path: "/channel-inventory",
        label: "渠道库存",
        requiredPermissions: ["report.channel_inventory"],
      },
      {
        path: "/inventory/outbound-dashboard",
        label: "出库 Dashboard",
        requiredPermissions: ["report.outbound_metrics"],
      },
      {
        path: "/shipping/reports",
        label: "发货成本报表",
        requiredPermissions: ["report.outbound_metrics"],
      },
      {
        path: "/shipping/record",
        label: "发货账本详情",
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
        requiredPermissions: ["report.finance"],
      },
      {
        path: "/finance/shop",
        label: "店铺盈利能力",
        requiredPermissions: ["report.finance"],
      },
      {
        path: "/finance/sku",
        label: "SKU 毛利榜",
        requiredPermissions: ["report.finance"],
      },
      {
        path: "/finance/order-unit",
        label: "客单价 / 贡献度",
        requiredPermissions: ["report.finance"],
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
        requiredPermissions: ["work.orders"], // → orders.read
      },
      {
        path: "/orders/stats",
        label: "订单统计",
        requiredPermissions: ["work.orders"], // → orders.read
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
        requiredPermissions: ["purchase.manage"],
      },
      {
        path: "/purchase-orders/new-v2",
        label: "采购单生成",
        requiredPermissions: ["purchase.manage"],
      },
      {
        path: "/purchase-orders/reports",
        label: "采购报表",
        requiredPermissions: ["purchase.report"],
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
        requiredPermissions: ["tool.trace"],
      },
      {
        path: "/tools/ledger",
        label: "Ledger Studio",
        requiredPermissions: ["tool.ledger"],
      },
      {
        path: "/tools/stocks",
        label: "Inventory Studio",
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
        requiredPermissions: ["devtools.access"],
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
        requiredPermissions: ["admin.stores"],
      },
      {
        path: "/stores/:storeId",
        label: "店铺详情",
        requiredPermissions: ["admin.stores"],
        showInSidebar: false,
      },
      {
        path: "/warehouses",
        label: "仓库管理",
        requiredPermissions: ["admin.stores"],
      },
      {
        path: "/warehouses/:warehouseId",
        label: "仓库详情",
        requiredPermissions: ["admin.stores"],
        showInSidebar: false,
      },
      {
        path: "/admin/items",
        label: "商品主数据",
        requiredPermissions: ["admin.stores"],
      },
      {
        path: "/admin/suppliers",
        label: "供应商主数据",
        requiredPermissions: ["admin.stores"],
      },
      {
        path: "/admin/shipping-providers",
        label: "物流 / 快递公司",
        requiredPermissions: ["admin.stores"],
      },
      {
        path: "/admin/users-admin",
        label: "用户管理总控",
        requiredPermissions: ["admin.users"],
      },
    ],
  },
];

export const flatRoutes: RouteItem[] = menuSections.flatMap(
  (s) => s.items,
);
