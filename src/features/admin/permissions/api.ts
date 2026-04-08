// src/features/admin/permissions/api.ts
//
// Admin Permissions API
// - 仅负责 /admin/permissions 路由：
//     * fetchPermissions()
//     * createPermission()
//

import { apiGet, apiPost } from "../../../lib/api";
import type { PermissionDTO } from "../users/types";

/**
 * 获取全部权限（Permission Dictionary）
 * - 后端正式接口：GET /admin/permissions
 */
export async function fetchPermissions(): Promise<PermissionDTO[]> {
  return apiGet<PermissionDTO[]>("/admin/permissions");
}

/**
 * 创建新权限
 * - 后端正式接口：POST /admin/permissions
 */
export async function createPermission(payload: {
  name: string;
}): Promise<PermissionDTO> {
  return apiPost<PermissionDTO>("/admin/permissions", payload);
}
