// src/app/auth/permissions.ts
//
// Phase 3：前端权限体系收敛
//
// 原则：
// - 前端菜单、路由、UI 一律使用「后端真实权限名」
// - 不再维护 work.* / admin.* / tool.* 等前端别名
// - 本文件只提供 passthrough + 类型占位

/**
 * 直接返回传入的权限名数组。
 * Sidebar / Router 直接用 useAuth.can(permission) 判断。
 */
export function resolvePermissionCodes(
  codes?: readonly string[],
): string[] {
  if (!codes || codes.length === 0) return [];
  return [...codes];
}
