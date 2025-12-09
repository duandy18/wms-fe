// src/features/admin/users/hooks/useRolesPresenter.ts
import { useEffect, useState } from "react";
import { createRole, fetchRoles, setRolePermissions } from "../api";
import type { RoleDTO } from "../types";

type ApiErrorShape = {
  message?: string;
};

export function useRolesPresenter() {
  const [roles, setRoles] = useState<RoleDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [savingPerms, setSavingPerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetchRoles();
      setRoles(r);
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

  async function createRoleAndReload(payload: {
    name: string;
    description: string | null;
  }) {
    setCreating(true);
    setError(null);
    try {
      await createRole(payload);
      await load();
    } catch (err: unknown) {
      const e = err as ApiErrorShape | undefined;
      setError(e?.message ?? "创建角色失败");
    } finally {
      setCreating(false);
    }
  }

  async function updateRolePermissions(roleId: string, ids: string[]) {
    setSavingPerms(true);
    setError(null);
    try {
      const updated = await setRolePermissions(roleId, ids);
      setRoles((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r)),
      );
    } catch (err: unknown) {
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
