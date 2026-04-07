// src/features/admin/users/hooks/useUsersPresenter.ts
//
// 用户直配权限版 Users Presenter
// - 加载：用户列表 + 权限字典
// - 创建用户
// - 更新用户基础信息
// - 覆盖用户权限
// - 重置密码

import { useEffect, useState } from "react";
import {
  createUser as apiCreateUser,
  fetchUsers,
  resetUserPassword,
  setUserPermissions as apiSetUserPermissions,
  updateUser as apiUpdateUser,
} from "../api";
import { fetchPermissions } from "../../permissions/api";
import type { PermissionDTO, UserDTO } from "../types";

type ApiErrorShape = { message?: string };

export function useUsersPresenter() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [permissions, setPermissions] = useState<PermissionDTO[]>([]);

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [mutating, setMutating] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // 加载用户列表 + 权限字典
  // ============================================================
  async function load() {
    setLoading(true);
    setError(null);

    try {
      const [userListResult, permissionsResult] = await Promise.allSettled([
        fetchUsers(),
        fetchPermissions(),
      ]);

      if (userListResult.status === "fulfilled") {
        const userList: UserDTO[] = Array.isArray(userListResult.value)
          ? userListResult.value
          : [];
        setUsers(userList);
      } else {
        const e = userListResult.reason as ApiErrorShape | undefined;
        throw new Error(e?.message ?? "加载用户失败");
      }

      if (permissionsResult.status === "fulfilled") {
        const permissionList: PermissionDTO[] = Array.isArray(permissionsResult.value)
          ? permissionsResult.value
          : [];
        setPermissions(permissionList);
      } else {
        setPermissions([]);
        const e = permissionsResult.reason as ApiErrorShape | undefined;
        setError(e?.message ?? "权限字典加载失败，当前无法创建或编辑用户权限");
      }
    } catch (err) {
      const e = err as ApiErrorShape;
      setError(e?.message ?? "加载用户失败");
      setUsers([]);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  // ============================================================
  // 创建用户（用户直配权限）
  // ============================================================
  async function createUser(payload: {
    username: string;
    password: string;
    permission_ids: number[];
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
      throw err;
    } finally {
      setCreating(false);
    }
  }

  // ============================================================
  // 更新用户基础信息
  // ============================================================
  async function updateUser(
    userId: number,
    payload: {
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
  // 覆盖用户权限
  // ============================================================
  async function setUserPermissions(userId: number, permissionIds: number[]) {
    setMutating(true);
    setError(null);

    try {
      await apiSetUserPermissions(userId, permissionIds);
      await load();
    } catch (err) {
      const e = err as ApiErrorShape;
      setError(e?.message ?? "保存用户权限失败");
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
    permissions,
    loading,
    creating,
    mutating,
    error,
    reload: load,

    createUser,
    updateUser,
    setUserPermissions,
    resetPassword,
    setError,
  };
}

export type UsersPresenter = ReturnType<typeof useUsersPresenter>;
