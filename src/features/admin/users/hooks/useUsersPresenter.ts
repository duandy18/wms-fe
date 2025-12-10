// src/features/admin/users/hooks/useUsersPresenter.ts
//
// 【最终版】多角色 RBAC Users Presenter
// - 负责 users API 调用
// - 负责构建 UserDTO.extra_roles（临时补全）
// - 负责创建、更新、重置密码
// - 负责错误状态管理
//

import { useEffect, useState } from "react";
import {
  fetchUsers,
  createUser as apiCreateUser,
  updateUser as apiUpdateUser,
  resetUserPassword,
} from "../api";

import { fetchRoles } from "../../roles/api"; // 用于角色名渲染
import type { UserDTO, RoleDTO } from "../types";

type ApiErrorShape = { message?: string };

export function useUsersPresenter() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [roles, setRoles] = useState<RoleDTO[]>([]);

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [mutating, setMutating] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // 加载用户列表 + 角色列表
  // ============================================================
  async function load() {
    setLoading(true);
    setError(null);

    try {
      const [userList, roleList] = await Promise.all([
        fetchUsers(),
        fetchRoles(),
      ]);

      // 多角色：后端暂时未返回 extra_roles，需要前端补齐为 []
      const normalized = userList.map((u) => ({
        ...u,
        extra_roles: (u as any).extra_roles || [],
      }));

      setUsers(normalized);
      setRoles(roleList);
    } catch (err) {
      const e = err as ApiErrorShape;
      setError(e?.message ?? "加载用户失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  // ============================================================
  // 创建用户（主角色 + 多角色）
  // ============================================================
  async function createUser(payload: {
    username: string;
    password: string;
    primary_role_id: number;
    extra_role_ids: number[];
    full_name?: string | null;
    phone?: string | null;
    email?: string | null;
  }) {
    setCreating(true);
    setError(null);

    try {
      await apiCreateUser(payload);
      await load();
    } catch (err) {
      const e = err as ApiErrorShape;
      setError(e?.message ?? "创建用户失败");
    } finally {
      setCreating(false);
    }
  }

  // ============================================================
  // 更新用户（基础信息 + 主角色 + 多角色 + 启停用）
  // ============================================================
  async function updateUser(
    userId: number,
    payload: {
      primary_role_id?: number | null;
      extra_role_ids?: number[] | null;
      full_name?: string | null;
      phone?: string | null;
      email?: string | null;
      is_active?: boolean;
    },
  ) {
    setMutating(true);
    setError(null);

    try {
      await apiUpdateUser(userId, payload);
      await load();
    } catch (err) {
      const e = err as ApiErrorShape;
      setError(e?.message ?? "更新用户失败");
      throw err;
    } finally {
      setMutating(false);
    }
  }

  // ============================================================
  // 重置密码
  // ============================================================
  async function resetPassword(userId: number) {
    setMutating(true);
    setError(null);

    try {
      await resetUserPassword(userId);
      await load();
    } catch (err) {
      const e = err as ApiErrorShape;
      setError(e?.message ?? "重置密码失败");
      throw err;
    } finally {
      setMutating(false);
    }
  }

  return {
    users,
    roles,
    loading,
    creating,
    mutating,
    error,
    reload: load,

    createUser,
    updateUser,
    resetPassword,
    setError,
  };
}

export type UsersPresenter = ReturnType<typeof useUsersPresenter>;
