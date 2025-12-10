// src/features/admin/roles/api.ts
//
// 【最终版】Roles 专用 API 模块（RBAC 拆分版）
// - 仅负责 /roles 路由相关的操作：
//     * fetchRoles()
//     * createRole()
//     * setRolePermissions()
// - Users / Permissions 各有自己的模块，不再混用
//

import { apiGet, apiPost, apiPatch } from "../../../lib/api";
import type { RoleDTO } from "../users/types";

/**
 * 获取所有角色列表
 */
export async function fetchRoles(): Promise<RoleDTO[]> {
  return apiGet<RoleDTO[]>("/roles");
}

/**
 * 创建角色
 */
export async function createRole(payload: {
  name: string;
  description: string | null;
}): Promise<RoleDTO> {
  return apiPost<RoleDTO>("/roles", payload);
}

/**
 * 为角色绑定权限（幂等）
 */
export async function setRolePermissions(
  roleId: string,
  permissionIds: string[],
): Promise<RoleDTO> {
  return apiPatch<RoleDTO>(`/roles/${roleId}/permissions`, {
    permission_ids: permissionIds,
  });
}
