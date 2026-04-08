// src/features/admin/users/api.ts
//
// Admin Users API
// - 仅负责 /admin/users 路由相关交互：
//   * fetchUserPermissionMatrix()
//   * fetchUsers()
//   * updateUserPermissionMatrix()
//   * createUser()
//   * updateUser()
//   * deleteUser()
//   * resetUserPassword()

import { apiGet, apiPatch, apiPost, apiPut } from "../../../lib/api";
import type {
  PermissionMatrixPagesDTO,
  PermissionMatrixRowDTO,
  UserDTO,
  UserPermissionMatrixDTO,
} from "./types";

// ========================================================
// Admin Users Matrix API
// ========================================================

/**
 * 读取用户一级页面权限矩阵
 * - 后端正式接口：GET /admin/users/permission-matrix
 */
export async function fetchUserPermissionMatrix(): Promise<UserPermissionMatrixDTO> {
  return apiGet<UserPermissionMatrixDTO>("/admin/users/permission-matrix");
}

/**
 * 读取用户基础列表
 * - 用于补齐 phone / email 等资料字段
 * - 后端正式接口：GET /admin/users
 */
export async function fetchUsers(): Promise<UserDTO[]> {
  return apiGet<UserDTO[]>("/admin/users");
}

/**
 * 保存单个用户的一级页面权限矩阵
 * - 后端正式接口：PUT /admin/users/{userId}/permission-matrix
 */
export async function updateUserPermissionMatrix(
  userId: number,
  pages: PermissionMatrixPagesDTO,
): Promise<PermissionMatrixRowDTO> {
  return apiPut<PermissionMatrixRowDTO>(`/admin/users/${userId}/permission-matrix`, {
    pages,
  });
}

// ========================================================
// Admin Users Base API
// ========================================================

/**
 * 创建用户
 * - 当前后端创建接口仍要求 permission_ids
 * - 前端矩阵页创建用户时先传空数组，创建成功后再在矩阵里配置页面权限
 * - 后端正式接口：POST /admin/users
 */
export async function createUser(payload: {
  username: string;
  password: string;
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
}): Promise<UserDTO> {
  return apiPost<UserDTO>("/admin/users", {
    ...payload,
    permission_ids: [],
  });
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
 * 删除用户
 * - 后端正式接口：POST /admin/users/{userId}/delete
 */
export async function deleteUser(userId: number): Promise<void> {
  await apiPost(`/admin/users/${userId}/delete`, {});
}

/**
 * 管理员重置用户密码（默认 000000）
 * - 后端正式接口：POST /admin/users/{userId}/reset-password
 */
export async function resetUserPassword(userId: number): Promise<void> {
  await apiPost(`/admin/users/${userId}/reset-password`, {});
}
