// src/app/router/menuConfig.tsx
// 左侧菜单配置：分区 + 每个路由项
//
// 注意：这里只负责菜单元信息（path / label / 权限 / 显示规则）。
// 权限码必须与后端 /users/me 返回的 permissions[] 一致。
//
// Phase 6 延展收尾：
// - “物流 / 承运商”页面语义已回归为主数据（与仓库 / 店铺并列）
// - 菜单层不再单独作为一级业务域展示
// - 兼容深链入口保留，但隐藏（showInSidebar:false）

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
      { path: "/purchase-orders/new-v2", label: "采购单生成", requiredPermissions: ["purchase.manage"] },
      { path: "/purchase-orders/overview", label: "采购概览", requiredPermissions: ["purchase.manage"] },
      { path: "/inbound", label: "收货入库", requiredPermissions: ["operations.inbound"] },
      { path: "/purchase-orders/reports", label: "采购统计", requiredPermissions: ["purchase.manage"] },
    ],
  },

  // 订单出库
  {
    id: "order-outbound",
    label: "订单出库",
    items: [
      { path: "/orders", label: "订单选仓", requiredPermissions: ["orders.read"] },
      { path: "/outbound/pick-tasks", label: "拣货", requiredPermissions: ["operations.outbound"] },
      { path: "/outbound/ship", label: "发货", requiredPermissions: ["operations.outbound"] },
      { path: "/orders/stats", label: "订单统计", requiredPermissions: ["orders.read"] },
      { path: "/outbound/dashboard", label: "出库看板", requiredPermissions: ["report.outbound"] },
      { path: "/shipping/reports", label: "发货成本报表", requiredPermissions: ["report.outbound"] },
      { path: "/shipping/record", label: "发货账本详情", requiredPermissions: ["report.outbound"] },
    ],
  },

  // 仓内作业
  {
    id: "internal-operations",
    label: "仓内作业",
    items: [
      { path: "/count", label: "盘点", requiredPermissions: ["operations.count"] },
      { path: "/outbound/internal-outbound", label: "内部出库", requiredPermissions: ["operations.internal_outbound"] },
    ],
  },

  // 库存
  {
    id: "inventory",
    label: "库存",
    items: [
      { path: "/snapshot", label: "库存现状", requiredPermissions: ["report.inventory"] },
      { path: "/inventory/ledger", label: "库存台账", requiredPermissions: ["report.inventory"] },
    ],
  },

  // 财务分析
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

  // 主数据
  {
    id: "admin",
    label: "主数据",
    items: [
      { path: "/stores", label: "店铺管理", requiredPermissions: ["config.store.write"] },
      { path: "/stores/:storeId", label: "店铺详情", requiredPermissions: ["config.store.write"], showInSidebar: false },

      { path: "/warehouses", label: "仓库管理", requiredPermissions: ["config.store.write"] },
      { path: "/warehouses/:warehouseId", label: "仓库详情", requiredPermissions: ["config.store.write"], showInSidebar: false },

      // ✅ 物流 / 承运商（主数据归位）
      // 语义：Shipping Provider = 仓库可用的快递网点（warehouse_id 是事实边界）
      { path: "/admin/shipping-providers", label: "快递网点", requiredPermissions: ["config.store.write"] },

      { path: "/admin/items", label: "商品主数据", requiredPermissions: ["config.store.write"] },
      { path: "/admin/suppliers", label: "供应商主数据", requiredPermissions: ["config.store.write"] },

      // ✅ 兼容深链：语义别名入口（隐藏）
      {
        path: "/logistics/providers",
        label: "快递网点（别名）",
        requiredPermissions: ["config.store.write"],
        showInSidebar: false,
      },

      // ✅ 兼容深链：Provider 详情（Tab → 子页面）
      {
        path: "/admin/shipping-providers/:providerId/*",
        label: "快递网点详情",
        requiredPermissions: ["config.store.write"],
        showInSidebar: false,
      },

      // ✅ 兼容深链：运价方案工作台（Tab → 子页面）
      {
        path: "/admin/shipping-providers/schemes/:schemeId/workbench/*",
        label: "运价方案工作台",
        requiredPermissions: ["config.store.write"],
        showInSidebar: false,
      },
    ],
  },

  // 权限与账号（3 个子页面）
  {
    id: "iam",
    label: "权限与账号",
    items: [
      { path: "/iam/users", label: "用户管理", requiredPermissions: ["system.user.manage"] },
      { path: "/iam/roles", label: "角色管理", requiredPermissions: ["system.role.manage"] },
      { path: "/iam/perms", label: "权限字典", requiredPermissions: ["system.permission.manage"] },
    ],
  },

  // ✅ 运维中心
  {
    id: "ops",
    label: "运维中心",
    items: [
      { path: "/ops", label: "运维概览", requiredPermissions: ["dev.tools.access"] },
      { path: "/ops/health", label: "系统状态", requiredPermissions: ["dev.tools.access"] },
      { path: "/ops/tasks", label: "后台任务", requiredPermissions: ["dev.tools.access"] },

      // ✅ 运价运维中心（治理 / 修复 / 清理）
      { path: "/ops/pricing-ops", label: "运价运维中心", requiredPermissions: ["config.store.write"] },
      {
        path: "/ops/pricing-ops/schemes/:schemeId",
        label: "运价运维中心-方案详情",
        requiredPermissions: ["config.store.write"],
        showInSidebar: false,
      },
      {
        path: "/ops/pricing-ops/cleanup",
        label: "运价运维中心-方案壳清理",
        requiredPermissions: ["config.store.write"],
        showInSidebar: false,
      },

      { path: "/trace", label: "Trace Studio", requiredPermissions: ["diagnostics.trace"] },
      { path: "/tools/ledger", label: "Ledger Studio", requiredPermissions: ["diagnostics.ledger"] },
      { path: "/tools/stocks", label: "Inventory Studio", requiredPermissions: ["diagnostics.inventory"] },

      // ✅ 链路调试（去掉“后端调试”前缀）
      { path: "/ops/dev/orders", label: "订单链路", requiredPermissions: ["dev.tools.access"], devOnly: true },
      { path: "/ops/dev/pick", label: "拣货链路", requiredPermissions: ["dev.tools.access"], devOnly: true },
      { path: "/ops/dev/inbound", label: "入库链路", requiredPermissions: ["dev.tools.access"], devOnly: true },
      { path: "/ops/dev/count", label: "盘点链路", requiredPermissions: ["dev.tools.access"], devOnly: true },
      { path: "/ops/dev/platform", label: "平台 / 店铺工具", requiredPermissions: ["dev.tools.access"], devOnly: true },

      // /dev 兼容入口（如需显示可改 showInSidebar:true）
      { path: "/dev", label: "链路调试（兼容入口）", requiredPermissions: ["dev.tools.access"], devOnly: true, showInSidebar: false },
    ],
  },
];

export const flatRoutes: RouteItem[] = menuSections.flatMap((s) => s.items);
