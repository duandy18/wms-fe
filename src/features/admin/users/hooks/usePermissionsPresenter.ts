// src/features/admin/users/hooks/usePermissionsPresenter.ts
import { useState } from "react";
import { createPermission } from "../api";

export function usePermissionsPresenter(
  reloadPermissions: () => Promise<void>,
) {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createPermissionAndReload(payload: {
    name: string;
    description: string | null;
  }) {
    setCreating(true);
    setError(null);
    try {
      await createPermission(payload);
      await reloadPermissions();
    } catch (err: any) {
      setError(err?.message ?? "创建权限失败");
    } finally {
      setCreating(false);
    }
  }

  return {
    creating,
    error,
    createPermission: createPermissionAndReload,
    setError,
  };
}

export type PermissionsPresenter = ReturnType<typeof usePermissionsPresenter>;
