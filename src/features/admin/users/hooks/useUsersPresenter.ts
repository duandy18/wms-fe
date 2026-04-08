// src/features/admin/users/hooks/useUsersPresenter.ts
//
// 用户一级页面权限矩阵版 Users Presenter
// - 加载：权限矩阵（pages + rows）+ 用户基础资料
// - 创建用户（默认不授予页面权限）
// - 更新用户基础信息
// - 保存单个用户矩阵
// - 删除用户
// - 重置密码

import { useEffect, useState } from "react";
import {
  createUser as apiCreateUser,
  deleteUser as apiDeleteUser,
  fetchUserPermissionMatrix,
  fetchUsers,
  resetUserPassword,
  updateUser as apiUpdateUser,
  updateUserPermissionMatrix as apiUpdateUserPermissionMatrix,
} from "../api";
import type {
  PermissionMatrixPageDTO,
  PermissionMatrixPagesDTO,
  PermissionMatrixRowDTO,
  UserDTO,
} from "../types";

type ApiErrorShape = { message?: string };
type UserDetailsMap = Record<number, UserDTO>;

export function useUsersPresenter() {
  const [matrixPages, setMatrixPages] = useState<PermissionMatrixPageDTO[]>([]);
  const [matrixRows, setMatrixRows] = useState<PermissionMatrixRowDTO[]>([]);
  const [userDetailsById, setUserDetailsById] = useState<UserDetailsMap>({});

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [mutating, setMutating] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // 加载权限矩阵 + 用户基础资料
  // ============================================================
  async function load() {
    setLoading(true);
    setError(null);

    try {
      const [matrixResult, usersResult] = await Promise.allSettled([
        fetchUserPermissionMatrix(),
        fetchUsers(),
      ]);

      if (matrixResult.status !== "fulfilled") {
        const e = matrixResult.reason as ApiErrorShape | undefined;
        throw new Error(e?.message ?? "加载用户权限矩阵失败");
      }

      const pages: PermissionMatrixPageDTO[] = Array.isArray(matrixResult.value.pages)
        ? matrixResult.value.pages
        : [];
      const rows: PermissionMatrixRowDTO[] = Array.isArray(matrixResult.value.rows)
        ? matrixResult.value.rows
        : [];

      setMatrixPages(pages);
      setMatrixRows(rows);

      if (usersResult.status === "fulfilled") {
        const list: UserDTO[] = Array.isArray(usersResult.value) ? usersResult.value : [];
        const detailMap: UserDetailsMap = {};
        list.forEach((user) => {
          detailMap[user.id] = user;
        });
        setUserDetailsById(detailMap);
      } else {
        setUserDetailsById({});
      }
    } catch (err) {
      const e = err as ApiErrorShape;
      setError(e?.message ?? "加载用户权限矩阵失败");
      setMatrixPages([]);
      setMatrixRows([]);
      setUserDetailsById({});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  // ============================================================
  // 创建用户（默认不授予页面权限）
  // ============================================================
  async function createUser(payload: {
    username: string;
    password: string;
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
  // 保存单个用户矩阵
  // ============================================================
  async function saveUserPermissionMatrix(
    userId: number,
    pages: PermissionMatrixPagesDTO,
  ) {
    setMutating(true);
    setError(null);

    try {
      const pageCodes = matrixPages.map((page) => page.page_code);
      await apiUpdateUserPermissionMatrix(userId, pageCodes, pages);
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
  // 删除用户
  // ============================================================
  async function deleteUser(userId: number) {
    setMutating(true);
    setError(null);

    try {
      await apiDeleteUser(userId);
      await load();
    } catch (err) {
      const e = err as ApiErrorShape;
      setError(e?.message ?? "删除用户失败");
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
    matrixPages,
    matrixRows,
    userDetailsById,
    loading,
    creating,
    mutating,
    error,
    reload: load,

    createUser,
    updateUser,
    saveUserPermissionMatrix,
    deleteUser,
    resetPassword,
    setError,
  };
}

export type UsersPresenter = ReturnType<typeof useUsersPresenter>;
