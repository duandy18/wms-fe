// src/features/admin/roles/useRolesPresenter.ts
import { useEffect, useState } from "react";
import { fetchRoles, createRole, setRolePermissions } from "./api";
import type { RoleDTO } from "../users/types";

type ApiErrorShape = {
  message?: string;
};

export function useRolesPresenter() {
  const [roles, setRoles] = useState<RoleDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [savingPerms, setSavingPerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** 加载全部角色 */
  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRoles();
      setRoles(data);
    } catch (err: unknown) {
      const e = err as ApiErrorShape | undefined;
      setError(e?.message ?? "加载角色失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  /** 创建角色（幂等） */
  async function createRoleAndReload(payload: {
    name: string;
    description: string | null;
  }) {
    setCreating(true);
    setError(null);
    try {
      await createRole(payload);
      await load();
    } catch (err) {
      const e = err as ApiErrorShape | undefined;
      setError(e?.message ?? "创建角色失败");
    } finally {
      setCreating(false);
    }
  }

  /** 设置角色权限 */
  async function updateRolePermissions(roleId: string, permissionIds: string[]) {
    setSavingPerms(true);
    setError(null);

    try {
      const updated = await setRolePermissions(roleId, permissionIds);

      setRoles((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
    } catch (err) {
      const e = err as ApiErrorShape | undefined;
      setError(e?.message ?? "更新角色权限失败");
    } finally {
      setSavingPerms(false);
    }
  }

  return {
    roles,
    loading,
    creating,
    savingPerms,
    error,

    reload: load,
    createRole: createRoleAndReload,
    setRolePermissions: updateRolePermissions,
    setError,
  };
}

export type RolesPresenter = ReturnType<typeof useRolesPresenter>;
