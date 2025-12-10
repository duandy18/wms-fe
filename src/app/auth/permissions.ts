// src/app/auth/permissions.ts
//
// 前端菜单用的“逻辑权限码” → 后端 RBAC 权限名的映射。
// 左边：前端逻辑码（work.* / report.* / admin.* / tool.* / devtools.* / purchase.*）
// 右边：必须和数据库 permissions.name 一致。

export const PERMISSIONS_MAP = {
  // ===== 作业区（Operations Cockpit） =====
  // 入库相关：入库 Cockpit / 收货（执行层）
  "work.inbound": "operations.inbound",
  // 盘点相关
  "work.count": "operations.count",
  // 出库相关：拣货任务 / 发货 Cockpit 等（执行层）
  "work.pick": "operations.outbound",
  // 订单管理（阅读）：订单列表 / 统计 / 明细
  "work.orders": "orders.read",

  // ===== 库存 & 报表 =====
  // 即时库存 / FEFO 风险 / 渠道库存
  "report.snapshot": "report.inventory",
  "report.channel_inventory": "report.inventory",
  // 出库 Dashboard / 发货成本报表 / 发货账本
  "report.outbound_metrics": "report.outbound",

  // ===== 财务分析 =====
  "report.finance": "report.finance",

  // ===== 诊断工具（Trace / Ledger / Inventory Studio） =====
  "tool.trace": "diagnostics.trace",
  "tool.stocks": "diagnostics.inventory",
  "tool.ledger": "diagnostics.ledger",

  // ===== Dev 工具（后端调试台） =====
  "devtools.access": "dev.tools.access",

  // ===== 系统管理（主数据 + 用户） =====
  // 主数据管理：店铺 / 仓库 / 商品 / 供应商 / 物流
  // 这里用 config.store.write 作为“主数据写权限”总入口。
  "admin.stores": "config.store.write",
  // 用户管理总控
  "admin.users": "system.user.manage",

  // ===== 采购域（管理 / 报表） =====
  "purchase.manage": "purchase.manage",
  "purchase.report": "purchase.report",
} as const;

export type PermissionCode = keyof typeof PERMISSIONS_MAP;

/**
 * 把菜单上的逻辑权限码转换成后端 permission 字符串数组，
 * 供 useAuth.can() / canAny() 使用。
 */
export function resolvePermissionCodes(
  codes?: PermissionCode[],
): string[] {
  if (!codes || codes.length === 0) return [];
  return codes.map((code) => PERMISSIONS_MAP[code]);
}
