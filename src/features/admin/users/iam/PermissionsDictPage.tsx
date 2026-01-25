// src/features/admin/users/iam/PermissionsDictPage.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../../shared/useAuth";

import { usePermissionsPresenter } from "../../permissions/usePermissionsPresenter";
import { PermissionsPanel } from "../../permissions/PermissionsPanel";
import { fetchPermissions } from "../../permissions/api";
import type { PermissionDTO } from "../types";

export default function PermissionsDictPage() {
  // ===== Hooks（无条件）=====
  const { can } = useAuth();

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

  const canManagePerms = can("system.permission.manage");

  if (!canManagePerms) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-slate-600">当前账号无权限管理权限。</p>
      </div>
    );
  }

  // ✅ 只保留业务面板（无页面级标题）
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
