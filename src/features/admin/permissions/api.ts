// src/features/admin/permissions/api.ts
//
// 【最终版】Permissions 专用 API 模块（RBAC 拆分版）
// - 仅负责 /permissions 路由：
//     * fetchPermissions()
//     * createPermission()
//

import { apiGet, apiPost } from "../../../lib/api";
import type { PermissionDTO } from "../users/types";

/**
 * 获取全部权限（Permission Dictionary）
 */
export async function fetchPermissions(): Promise<PermissionDTO[]> {
  return apiGet<PermissionDTO[]>("/permissions");
}

/**
 * 创建新权限
 */
export async function createPermission(payload: {
  name: string;
  description: string | null;
}): Promise<PermissionDTO> {
  return apiPost<PermissionDTO>("/permissions", payload);
}
