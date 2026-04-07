// src/features/admin/users/api.ts
//
// Users API（用户直配权限版）
// - 仅负责 /users 路由相关交互：
//   * fetchUsers()
//   * createUser()
//   * updateUser()
//   * setUserPermissions()
//   * resetUserPassword()

import { apiGet, apiPatch, apiPost, apiPut } from "../../../lib/api";
import type { UserDTO } from "./types";

// ========================================================
// Users API
// ========================================================

/**
 * 用户列表
 * - 后端正式接口：GET /users/
 */
export async function fetchUsers(): Promise<UserDTO[]> {
  return apiGet<UserDTO[]>("/users/");
}

/**
 * 创建用户（用户直配权限）
 */
export async function createUser(payload: {
  username: string;
  password: string;
  permission_ids: number[];
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
}): Promise<UserDTO> {
  return apiPost<UserDTO>("/users/register", payload);
}

/**
 * 更新用户基础信息
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
  return apiPatch<UserDTO>(`/users/${userId}`, payload);
}

/**
 * 覆盖用户直配权限
 */
export async function setUserPermissions(
  userId: number,
  permissionIds: number[],
): Promise<UserDTO> {
  return apiPut<UserDTO>(`/users/${userId}/permissions`, {
    permission_ids: permissionIds,
  });
}

/**
 * 管理员重置用户密码（默认 000000）
 */
export async function resetUserPassword(userId: number): Promise<void> {
  await apiPost(`/users/${userId}/reset-password`, {});
}
