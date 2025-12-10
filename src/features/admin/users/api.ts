// src/features/admin/users/api.ts
//
// 【最终版】Users 专用 API 模块（RBAC 拆分版）
// - 仅负责 /users 路由相关的交互：
//   * fetchUsers()
//   * createUser()
//   * updateUser()
//   * resetUserPassword()
// - 角色 / 权限 API 由 roles/api.ts 和 permissions/api.ts 管理
//

import { apiGet, apiPost, apiPatch } from "../../../lib/api";
import type { UserDTO } from "./types";

// ========================================================
// Users API
// ========================================================

/**
 * 用户列表（仅用于用户管理总控页）
 */
export async function fetchUsers(): Promise<UserDTO[]> {
  return apiGet<UserDTO[]>("/users");
}

/**
 * 创建用户（多角色 + 主角色）
 */
export async function createUser(payload: {
  username: string;
  password: string;
  primary_role_id: number;
  extra_role_ids: number[];
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
}): Promise<void> {
  return apiPost("/users/register", payload);
}

/**
 * 更新用户（基础信息 + 主角色 + 多角色 + 启停用）
 */
export async function updateUser(
  userId: number,
  payload: {
    primary_role_id?: number | null;
    extra_role_ids?: number[] | null;
    full_name?: string | null;
    phone?: string | null;
    email?: string | null;
    is_active?: boolean;
  },
): Promise<UserDTO> {
  return apiPatch<UserDTO>(`/users/${userId}`, payload);
}

/**
 * 管理员重置用户密码（默认 000000）
 */
export async function resetUserPassword(userId: number): Promise<void> {
  return apiPost(`/users/${userId}/reset-password`, {});
}
