// src/app/router/menuConfig.tsx
// 左侧菜单配置：分区 + 每个路由项
//
// 注意：这里只负责菜单元信息（path / label / 权限 / 显示规则）。
// 权限码必须与后端 /users/me 返回的 permissions[] 一致。
//
// 本轮收口：
// - “物流”从主数据中独立出来，作为一级业务分区
// - 快递网点、运价方案、发货成本报表、发货账本详情统一归入“物流”
// - 不再保留 /logistics/providers 之类的别名兼容入口
// - 菜单仅保留当前正式业务入口，调试工具不出现在侧边栏

export interface RouteItem {
  path: string;
  label: string;
  requiredPermissions?: string[];
  showInSidebar?: boolean;
  devOnly?: boolean;
}

export interface RouteSection {
  id: string;
  label: string;
  items: RouteItem[];
}

export const menuSections: RouteSection[] = [
  // 入库
  {
    id: "inbound",
    label: "入库",
    items: [
      {
        path: "/purchase-orders/new-v2",
        label: "采购单生成",
        requiredPermissions: ["purchase.manage"],
      },
      {
        path: "/purchase-orders/overview",
        label: "采购概览",
        requiredPermissions: ["purchase.manage"],
      },
      {
        path: "/inbound",
        label: "收货入库",
        requiredPermissions: ["operations.inbound"],
      },
      {
        path: "/purchase-orders/reports",
        label: "采购统计",
        requiredPermissions: ["purchase.manage"],
      },
    ],
  },

  // 订单出库
  {
    id: "order-outbound",
    label: "订单出库",
    items: [
      {
        path: "/outbound/pick-tasks",
        label: "拣货",
        requiredPermissions: ["operations.outbound"],
      },
      {
        path: "/outbound/dashboard",
        label: "出库看板",
        requiredPermissions: ["report.outbound"],
      },
    ],
  },

  // 物流
  {
    id: "logistics",
    label: "物流",
    items: [
      {
        path: "/tms/dispatch",
        label: "发货作业",
        requiredPermissions: ["operations.outbound"],
      },
      {
        path: "/tms/providers",
        label: "快递网点",
        requiredPermissions: ["config.store.write"],
      },
      {
        path: "/tms/pricing",
        label: "运价管理",
        requiredPermissions: ["report.outbound"],
      },
      {
        path: "/tms/records",
        label: "发货记录",
        requiredPermissions: ["report.outbound"],
      },
      {
        path: "/tms/billing/items",
        label: "快递账单",
        requiredPermissions: ["report.outbound"],
      },
      {
        path: "/tms/reconciliation",
        label: "对账",
        requiredPermissions: ["report.outbound"],
      },
      {
        path: "/tms/reports",
        label: "快递成本分析",
        requiredPermissions: ["report.outbound"],
      },

      // 深链：快递网点编辑页（页面内部承载网点基本信息 / 联系人 / 仓库绑定 / 运价方案）
      {
        path: "/tms/providers/new",
        label: "新建快递网点",
        requiredPermissions: ["config.store.write"],
        showInSidebar: false,
      },
      {
        path: "/tms/providers/:providerId",
        label: "快递网点详情",
        requiredPermissions: ["config.store.write"],
        showInSidebar: false,
      },
      {
        path: "/tms/providers/:providerId/edit",
        label: "编辑快递网点",
        requiredPermissions: ["config.store.write"],
        showInSidebar: false,
      },
      {
        path: "/tms/providers/:providerId/schemes",
        label: "快递网点运价方案",
        requiredPermissions: ["config.store.write"],
        showInSidebar: false,
      },
      {
        path: "/tms/providers/schemes/:schemeId/workbench-flow",
        label: "运价方案工作台",
        requiredPermissions: ["config.store.write"],
        showInSidebar: false,
      },
    ],
  },

  // 仓内作业
  {
    id: "internal-operations",
    label: "仓内作业",
    items: [
      {
        path: "/count",
        label: "盘点",
        requiredPermissions: ["operations.count"],
      },
      {
        path: "/outbound/internal-outbound",
        label: "内部出库",
        requiredPermissions: ["operations.internal_outbound"],
      },
    ],
  },

  // 库存
  {
    id: "inventory",
    label: "库存",
    items: [
      {
        path: "/snapshot",
        label: "库存现状",
        requiredPermissions: ["report.inventory"],
      },
      {
        path: "/inventory/ledger",
        label: "库存台账",
        requiredPermissions: ["report.inventory"],
      },
    ],
  },

  // 财务分析
  {
    id: "finance",
    label: "财务分析",
    items: [
      {
        path: "/finance",
        label: "财务概览",
        requiredPermissions: ["report.finance"],
      },
    ],
  },

  // 主数据
  {
    id: "master-data",
    label: "主数据",
    items: [
      {
        path: "/stores",
        label: "店铺管理",
        requiredPermissions: ["config.store.read"],
      },
      {
        path: "/items",
        label: "商品管理",
        requiredPermissions: ["config.item.read"],
      },
      {
        path: "/warehouses",
        label: "仓库管理",
        requiredPermissions: ["config.warehouse.read"],
      },
      {
        path: "/suppliers",
        label: "供应商管理",
        requiredPermissions: ["config.supplier.read"],
      },
    ],
  },

  // 系统管理
  {
    id: "system",
    label: "系统管理",
    items: [
      {
        path: "/users",
        label: "用户管理",
        requiredPermissions: ["system.user.read"],
      },
      {
        path: "/roles",
        label: "角色权限",
        requiredPermissions: ["system.role.read"],
      },
    ],
  },
];

export const flatRoutes: RouteItem[] = menuSections.flatMap((section) => section.items);
