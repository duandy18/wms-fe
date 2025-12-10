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
// 内部原始类型定义（用于适配后端返回）
// ========================================================

type RawUser = {
  id: number;
  username: string;
  role_id?: number | null;
  primary_role_id?: number | null;
  is_active?: boolean | null;
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
  extra_roles?: UserDTO["extra_roles"] | null;
  // 允许有其他后端字段，但前端不依赖
  [key: string]: unknown;
};

type UsersApiResponse = RawUser[] | { users: RawUser[] };

function isUsersEnvelope(raw: unknown): raw is { users: RawUser[] } {
  if (!raw || typeof raw !== "object") return false;
  const maybe = raw as { users?: unknown };
  return Array.isArray(maybe.users);
}

// ========================================================
// Users API
// ========================================================

/**
 * 用户列表（仅用于用户管理总控页）
 *
 * 说明：
 * - Pilot 当前 /users 直接返回裸数组 RawUser[]
 * - 历史上也可能是 { users: RawUser[] }
 * - 这里统一适配成 UserDTO[]，Presenter / Panel 不再关心后端历史差异
 * - 多角色：沿用后端返回的 extra_roles，不做降级
 */
export async function fetchUsers(): Promise<UserDTO[]> {
  const raw = await apiGet<UsersApiResponse>("/users");

  let list: RawUser[] = [];

  // 1) 直接数组（当前 Pilot 的真实返回）
  if (Array.isArray(raw)) {
    list = raw;
  }
  // 2) 老结构：{ users: [...] }
  else if (isUsersEnvelope(raw)) {
    list = raw.users;
  } else {
    // 3) 其他奇怪情况，兜底为空数组，避免 null.map 崩掉
    return [];
  }

  // 显式适配成 UserDTO 结构（保留多角色 extra_roles）
  return list.map(
    (u): UserDTO => ({
      id: u.id,
      username: u.username,
      // UserDTO 中的主角色字段是 role_id
      role_id: u.role_id ?? u.primary_role_id ?? null,
      is_active: u.is_active ?? true,
      full_name: u.full_name ?? null,
      phone: u.phone ?? null,
      email: u.email ?? null,
      // 多角色：沿用后端 extra_roles，如果没有就给空数组
      extra_roles: u.extra_roles ?? [],
    }),
  );
}

/**
 * 创建用户（多角色 + 主角色）
 *
 * 注意：
 * - 这里仍然用 extra_role_ids 作为 payload 字段，和你本机已跑通的行为保持一致
 * - 后端负责把 extra_role_ids 解析成角色集合（含 primary + extra_roles）
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
