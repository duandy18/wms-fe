// src/features/admin/users/iam/UsersManagePage.tsx
import React from "react";
import { useAuth } from "../../../../shared/useAuth";

import { useUsersPresenter } from "../hooks/useUsersPresenter";
import { UsersPanel } from "../panels/UsersPanel";

export default function UsersManagePage() {
  // ===== Hooks（无条件）=====
  const { can } = useAuth();
  const usersPresenter = useUsersPresenter();

  const canManageUsers = can("system.user.manage");

  if (!canManageUsers) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-slate-600">当前账号无用户管理权限。</p>
      </div>
    );
  }

  // ✅ 只保留业务面板（无页面级标题）
  return (
    <div className="space-y-4">
      <UsersPanel presenter={usersPresenter} roles={[]} />
    </div>
  );
}
