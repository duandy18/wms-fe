// src/features/admin/users/UsersManagePage.tsx
import React from "react";
import { usePermissionRuntime } from "../../../shared/runtime";

import { useUsersPresenter } from "./hooks/useUsersPresenter";
import { UsersPanel } from "./panels/UsersPanel";

export default function UsersManagePage() {
  const { can } = usePermissionRuntime();
  const usersPresenter = useUsersPresenter();

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
      <UsersPanel presenter={usersPresenter} />
    </div>
  );
}
