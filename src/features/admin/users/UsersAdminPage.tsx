// src/features/admin/users/UsersAdminPage.tsx
import React, { useEffect, useState } from "react";
import { useUsersPresenter } from "./hooks/useUsersPresenter";
import { useRolesPresenter } from "./hooks/useRolesPresenter";
import { usePermissionsPresenter } from "./hooks/usePermissionsPresenter";
import { UsersPanel } from "./panels/UsersPanel";
import { RolesPanel } from "./panels/RolesPanel";
import { PermissionsPanel } from "./panels/PermissionsPanel";
import { fetchPermissions } from "./api";
import type { PermissionDTO } from "./types";

type TabKey = "users" | "roles" | "perms";

type ApiErrorShape = {
  message?: string;
};

export default function UsersAdminPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("users");

  const usersPresenter = useUsersPresenter();
  const rolesPresenter = useRolesPresenter();

  const [permissions, setPermissions] = useState<PermissionDTO[]>([]);
  const [permLoading, setPermLoading] = useState(false);
  const [permError, setPermError] = useState<string | null>(null);

  async function reloadPermissions() {
    setPermLoading(true);
    setPermError(null);
    try {
      const p = await fetchPermissions();
      setPermissions(p);
    } catch (err: unknown) {
      const e = err as ApiErrorShape | undefined;
      setPermError(e?.message ?? "加载权限列表失败");
    } finally {
      setPermLoading(false);
    }
  }

  useEffect(() => {
    void reloadPermissions();
  }, []);

  const permsPresenter = usePermissionsPresenter(reloadPermissions);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "users", label: "用户管理" },
    { key: "roles", label: "角色 & 权限" },
    { key: "perms", label: "权限字典" },
  ];

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">用户 & 权限管理</h1>
          <p className="mt-1 text-xs text-slate-600">
            统一管理系统用户、角色与权限。用户只关心角色，角色与权限映射由管理员在此维护。
          </p>
        </div>
      </header>

      <div className="flex gap-2 border-b border-slate-200 pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={[
              "px-3 py-1.5 rounded-t-md text-sm",
              activeTab === tab.key
                ? "bg-white border border-b-white border-slate-200 font-semibold"
                : "text-slate-500 hover:text-slate-800",
            ].join(" ")}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "users" && (
          <UsersPanel presenter={usersPresenter} />
        )}

        {activeTab === "roles" && (
          <RolesPanel
            presenter={rolesPresenter}
            permissions={permissions}
            permissionsLoading={permLoading}
          />
        )}

        {activeTab === "perms" && (
          <PermissionsPanel
            presenter={permsPresenter}
            permissions={permissions}
            loading={permLoading}
            loadError={permError}
          />
        )}
      </div>
    </div>
  );
}
