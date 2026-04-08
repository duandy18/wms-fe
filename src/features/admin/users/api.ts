// src/features/admin/users/api.ts
//
// Admin Users API
// - 仅负责 /admin/users 路由相关交互：
//   * fetchUsers()
//   * createUser()
//   * updateUser()
//   * setUserPermissions()
//   * resetUserPassword()

import { apiGet, apiPatch, apiPost, apiPut } from "../../../lib/api";
import type { UserDTO } from "./types";

// ========================================================
// Admin Users API
// ========================================================

/**
 * 用户列表
 * - 后端正式接口：GET /admin/users
 */
export async function fetchUsers(): Promise<UserDTO[]> {
  return apiGet<UserDTO[]>("/admin/users");
}

/**
 * 创建用户（用户直配权限）
 * - 后端正式接口：POST /admin/users
 */
export async function createUser(payload: {
  username: string;
  password: string;
  permission_ids: number[];
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
}): Promise<UserDTO> {
  return apiPost<UserDTO>("/admin/users", payload);
}

/**
 * 更新用户基础信息
 * - 后端正式接口：PATCH /admin/users/{userId}
 */
export async function updateUser(
  userId: number,
  payload: {
    full_name?: string | null;
    phone?: string | null;
    email?: string | null;
    is_active?: boolean;
  },
): Promise<UserDTO> {
  return apiPatch<UserDTO>(`/admin/users/${userId}`, payload);
}

/**
 * 覆盖用户直配权限
 * - 后端正式接口：PUT /admin/users/{userId}/permissions
 */
export async function setUserPermissions(
  userId: number,
  permissionIds: number[],
): Promise<UserDTO> {
  return apiPut<UserDTO>(`/admin/users/${userId}/permissions`, {
    permission_ids: permissionIds,
  });
}

/**
 * 管理员重置用户密码（默认 000000）
 * - 后端正式接口：POST /admin/users/{userId}/reset-password
 */
export async function resetUserPassword(userId: number): Promise<void> {
  await apiPost(`/admin/users/${userId}/reset-password`, {});
}
