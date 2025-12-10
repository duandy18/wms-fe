// src/features/admin/users/UsersAdminPage.tsx

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../app/auth/useAuth";

// Users
import { useUsersPresenter } from "./hooks/useUsersPresenter";
import { UsersPanel } from "./panels/UsersPanel";

// Roles
import { useRolesPresenter } from "../roles/useRolesPresenter";
import { RolesPanel } from "../roles/RolesPanel";

// Permissions
import { usePermissionsPresenter } from "../permissions/usePermissionsPresenter";
import { PermissionsPanel } from "../permissions/PermissionsPanel";
import { fetchPermissions } from "../permissions/api";

import type { PermissionDTO } from "./types";

type TabKey = "users" | "roles" | "perms";

type TabItem = { key: TabKey; label: string };

export default function UsersAdminPage() {
  const { can } = useAuth();

  const canManageUsers = can("system.user.manage");
  const canManageRoles = can("system.role.manage");
  const canManagePerms = can("system.permission.manage");

  const visibleTabs = useMemo<TabItem[]>(() => {
    const tabs: TabItem[] = [];
    if (canManageUsers) tabs.push({ key: "users", label: "用户管理" });
    if (canManageRoles) tabs.push({ key: "roles", label: "角色 & 权限" });
    if (canManagePerms) tabs.push({ key: "perms", label: "权限字典" });
    return tabs;
  }, [canManageUsers, canManageRoles, canManagePerms]);

  const hasAnyTab = visibleTabs.length > 0;

  const [activeTab, setActiveTab] = useState<TabKey>("users");

  const usersPresenter = useUsersPresenter();
  const rolesPresenter = useRolesPresenter();

  const [permissions, setPermissions] = useState<PermissionDTO[]>([]);
  const [permLoading, setPermLoading] = useState(false);
  const [permError, setPermError] = useState<string | null>(null);

  const permsPresenter = usePermissionsPresenter(reloadPermissions);

  async function reloadPermissions() {
    setPermLoading(true);
    setPermError(null);
    try {
      const data = await fetchPermissions();
      setPermissions(data);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message)
          : "加载权限列表失败";
      setPermError(message);
    } finally {
      setPermLoading(false);
    }
  }

  useEffect(() => {
    void reloadPermissions();
  }, []);

  useEffect(() => {
    if (!hasAnyTab) return;
    if (!visibleTabs.some((t) => t.key === activeTab)) {
      setActiveTab(visibleTabs[0].key);
    }
  }, [activeTab, hasAnyTab, visibleTabs]);

  if (!hasAnyTab) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-semibold">用户 & 权限管理</h1>
        <p className="text-sm text-slate-600">
          当前账号未拥有任何 system.* 管理权限。请联系管理员开通。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-lg font-semibold">用户 & 权限管理中心</h1>
        <p className="mt-1 text-xs text-slate-500">
          管理系统用户、角色、权限的统一中枢。
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-1">
        {visibleTabs.map((tab) => (
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

      {/* Panels */}
      <div>
        {activeTab === "users" && canManageUsers ? (
          <UsersPanel presenter={usersPresenter} roles={rolesPresenter.roles} />
        ) : null}

        {activeTab === "roles" && canManageRoles ? (
          <RolesPanel
            presenter={rolesPresenter}
            permissions={permissions}
            permissionsLoading={permLoading}
          />
        ) : null}

        {activeTab === "perms" && canManagePerms ? (
          <PermissionsPanel
            presenter={permsPresenter}
            permissions={permissions}
            loading={permLoading}
            loadError={permError}
          />
        ) : null}
      </div>
    </div>
  );
}
