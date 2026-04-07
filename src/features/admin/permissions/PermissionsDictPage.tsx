// src/features/admin/permissions/PermissionsDictPage.tsx
import React, { useEffect, useState } from "react";
import { usePermissionRuntime } from "../../../shared/runtime";

import { usePermissionsPresenter } from "./usePermissionsPresenter";
import { PermissionsPanel } from "./PermissionsPanel";
import { fetchPermissions } from "./api";
import type { PermissionDTO } from "../users/types";

export default function PermissionsDictPage() {
  const { can } = usePermissionRuntime();

  const [permissions, setPermissions] = useState<PermissionDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPermissions();
      setPermissions(Array.isArray(data) ? data : []);
    } catch {
      setError("加载权限字典失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  const presenter = usePermissionsPresenter(reload);

  const canReadAdmin = can("page.admin.read");

  if (!canReadAdmin) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-slate-600">当前账号无系统管理页面访问权限。</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PermissionsPanel
        presenter={presenter}
        permissions={permissions}
        loading={loading}
        loadError={error}
      />
    </div>
  );
}
