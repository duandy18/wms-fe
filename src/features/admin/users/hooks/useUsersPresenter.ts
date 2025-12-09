// src/features/admin/users/hooks/useUsersPresenter.ts
import { useEffect, useState } from "react";
import {
  createUser,
  fetchRoles,
  fetchUsers,
  updateUser as apiUpdateUser,
  resetUserPassword,
} from "../api";
import type { RoleDTO, UserDTO } from "../types";

type ApiErrorShape = {
  message?: string;
};

export function useUsersPresenter() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [roles, setRoles] = useState<RoleDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [u, r] = await Promise.all([fetchUsers(), fetchRoles()]);
      setUsers(u);
      setRoles(r);
    } catch (err: unknown) {
      const e = err as ApiErrorShape | undefined;
      setError(e?.message ?? "加载用户/角色失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function createUserAndReload(payload: {
    username: string;
    password: string;
    role_id: number;
    full_name?: string | null;
    phone?: string | null;
    email?: string | null;
  }) {
    setCreating(true);
    setError(null);
    try {
      await createUser(payload);
      await load();
    } catch (err: unknown) {
      const e = err as ApiErrorShape | undefined;
      setError(e?.message ?? "创建用户失败");
    } finally {
      setCreating(false);
    }
  }

  async function updateUserAndReload(
    userId: number,
    payload: {
      full_name?: string | null;
      phone?: string | null;
      email?: string | null;
      role_id?: number | null;
      is_active?: boolean;
    },
  ) {
    setMutating(true);
    setError(null);
    try {
      await apiUpdateUser(userId, payload);
      await load();
    } catch (err: unknown) {
      const e = err as ApiErrorShape | undefined;
      setError(e?.message ?? "更新用户失败");
      throw err;
    } finally {
      setMutating(false);
    }
  }

  async function resetPasswordAndReload(userId: number) {
    setMutating(true);
    setError(null);
    try {
      await resetUserPassword(userId);
      await load();
    } catch (err: unknown) {
      const e = err as ApiErrorShape | undefined;
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
    createUser: createUserAndReload,
    updateUser: updateUserAndReload,
    resetPassword: resetPasswordAndReload,
    setError,
  };
}

export type UsersPresenter = ReturnType<typeof useUsersPresenter>;
