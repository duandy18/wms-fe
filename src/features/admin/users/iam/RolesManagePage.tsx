// src/features/admin/users/iam/RolesManagePage.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../../shared/useAuth";

import { useRolesPresenter } from "../../roles/useRolesPresenter";
import { RolesPanel } from "../../roles/RolesPanel";
import { fetchPermissions } from "../../permissions/api";
import type { PermissionDTO } from "../types";

export default function RolesManagePage() {
  // ===== Hooks（无条件）=====
  const { can } = useAuth();
  const rolesPresenter = useRolesPresenter();

  const [permissions, setPermissions] = useState<PermissionDTO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchPermissions()
      .then((res) => setPermissions(Array.isArray(res) ? res : []))
      .finally(() => setLoading(false));
  }, []);

  const canManageRoles = can("system.role.manage");

  if (!canManageRoles) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-slate-600">当前账号无角色管理权限。</p>
      </div>
    );
  }

  // ✅ 只保留业务面板（无页面级标题）
  return (
    <div className="space-y-4">
      <RolesPanel
        presenter={rolesPresenter}
        permissions={permissions}
        permissionsLoading={loading}
      />
    </div>
  );
}
