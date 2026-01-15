// src/app/router/menuConfig.tsx
// 左侧菜单配置：分区 + 每个路由项
//
// 注意：这里只负责菜单元信息（path / label / 权限 / 显示规则）。
// 权限码必须与后端 /users/me 返回的 permissions[] 一致。

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
  {
    id: "operations",
    label: "作业台",
    items: [
      { path: "/inbound", label: "收货", requiredPermissions: ["operations.inbound"] },
      { path: "/outbound/pick-tasks", label: "拣货", requiredPermissions: ["operations.outbound"] },
      { path: "/count", label: "盘点", requiredPermissions: ["operations.count"] },
      { path: "/outbound/ship", label: "发货", requiredPermissions: ["operations.outbound"] },
      {
        path: "/outbound/internal-outbound",
        label: "内部出库",
        requiredPermissions: ["operations.internal_outbound"],
      },

      // 旧版拣货页（不展示）
      {
        path: "/outbound/pick",
        label: "拣货出库（旧版）",
        requiredPermissions: ["operations.outbound"],
        showInSidebar: false,
      },
    ],
  },

  {
    id: "inventory",
    label: "库存 & 报表",
    items: [
      { path: "/snapshot", label: "即时库存 / FEFO 风险", requiredPermissions: ["report.inventory"] },

      // ✅ 补回：库存台账（业务入口）
      { path: "/inventory/ledger", label: "库存台账", requiredPermissions: ["report.inventory"] },

      { path: "/channel-inventory", label: "渠道库存", requiredPermissions: ["report.inventory"] },
      { path: "/inventory/outbound-dashboard", label: "出库 Dashboard", requiredPermissions: ["report.outbound"] },
      { path: "/shipping/reports", label: "发货成本报表", requiredPermissions: ["report.outbound"] },
      { path: "/shipping/record", label: "发货账本详情", requiredPermissions: ["report.outbound"] },
    ],
  },

  {
    id: "finance",
    label: "财务分析",
    items: [
      { path: "/finance", label: "收入 / 成本 / 毛利", requiredPermissions: ["report.finance"] },
      { path: "/finance/shop", label: "店铺盈利能力", requiredPermissions: ["report.finance"] },
      { path: "/finance/sku", label: "SKU 毛利榜", requiredPermissions: ["report.finance"] },
      { path: "/finance/order-unit", label: "客单价 / 贡献度", requiredPermissions: ["report.finance"] },
    ],
  },

  {
    id: "orders",
    label: "订单管理",
    items: [
      { path: "/orders", label: "订单列表", requiredPermissions: ["orders.read"] },
      { path: "/orders/stats", label: "订单统计", requiredPermissions: ["orders.read"] },
    ],
  },

  {
    id: "purchase",
    label: "采购管理",
    items: [
      // ✅ 合并：采购单列表 + 采购报表 → 采购概览
      { path: "/purchase-orders/overview", label: "采购概览", requiredPermissions: ["purchase.manage"] },
      { path: "/purchase-orders/new-v2", label: "采购单生成", requiredPermissions: ["purchase.manage"] },

      // 旧入口保留但不展示（兼容外部链接/历史书签）
      { path: "/purchase-orders", label: "采购单列表（旧）", requiredPermissions: ["purchase.manage"], showInSidebar: false },
      { path: "/purchase-orders/reports", label: "采购报表（旧）", requiredPermissions: ["purchase.report"], showInSidebar: false },
    ],
  },

  {
    id: "diagnostics",
    label: "诊断 & 分析",
    items: [
      { path: "/trace", label: "Trace Studio", requiredPermissions: ["diagnostics.trace"] },
      { path: "/tools/ledger", label: "Ledger Studio", requiredPermissions: ["diagnostics.ledger"] },
      { path: "/tools/stocks", label: "Inventory Studio", requiredPermissions: ["diagnostics.inventory"] },
    ],
  },

  {
    id: "devtools",
    label: "开发者工具",
    items: [{ path: "/dev", label: "后端调试台", requiredPermissions: ["dev.tools.access"], devOnly: true }],
  },

  {
    id: "admin",
    label: "系统管理",
    items: [
      { path: "/stores", label: "店铺管理", requiredPermissions: ["config.store.write"] },
      { path: "/stores/:storeId", label: "店铺详情", requiredPermissions: ["config.store.write"], showInSidebar: false },
      { path: "/warehouses", label: "仓库管理", requiredPermissions: ["config.store.write"] },
      {
        path: "/warehouses/:warehouseId",
        label: "仓库详情",
        requiredPermissions: ["config.store.write"],
        showInSidebar: false,
      },
      { path: "/admin/items", label: "商品主数据", requiredPermissions: ["config.store.write"] },
      { path: "/admin/suppliers", label: "供应商主数据", requiredPermissions: ["config.store.write"] },
      { path: "/admin/shipping-providers", label: "物流 / 快递公司", requiredPermissions: ["config.store.write"] },

      {
        path: "/admin/shipping-providers/schemes/:schemeId/workbench",
        label: "运价方案工作台",
        requiredPermissions: ["config.store.write"],
        showInSidebar: false,
      },

      { path: "/admin/users-admin", label: "用户管理总控", requiredPermissions: ["system.user.manage"] },
    ],
  },
];

export const flatRoutes: RouteItem[] = menuSections.flatMap((s) => s.items);
