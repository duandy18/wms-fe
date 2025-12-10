// src/features/admin/users/UsersAdminPage.tsx
//
// 【最终版】RBAC 用户管理总控页（模块化 + 多角色）
// - Users / Roles / Permissions 三大板块
// - 每块用各自的 Presenter + API
//

import React, { useEffect, useState } from "react";

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

export default function UsersAdminPage() {
  const { can } = useAuth();

  // --- 前端权限 gating ---
  const canManageUsers = can("system.user.manage");
  const canManageRoles = can("system.role.manage");
  const canManagePerms = can("system.permission.manage");

  const visibleTabs: { key: TabKey; label: string }[] = [
    ...(canManageUsers ? [{ key: "users", label: "用户管理" }] : []),
    ...(canManageRoles ? [{ key: "roles", label: "角色 & 权限" }] : []),
    ...(canManagePerms ? [{ key: "perms", label: "权限字典" }] : []),
  ];

  if (visibleTabs.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-semibold">用户 & 权限管理</h1>
        <p className="text-sm text-slate-600">
          当前账号没有 system.* 管理权限，如需开通请联系系统管理员。
        </p>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<TabKey>(visibleTabs[0].key);

  // --- Users ---
  const usersPresenter = useUsersPresenter();

  // --- Roles ---
  const rolesPresenter = useRolesPresenter();

  // --- Permissions ---
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
    } catch (e: any) {
      setPermError(e?.message ?? "加载权限列表失败");
    } finally {
      setPermLoading(false);
    }
  }

  useEffect(() => {
    void reloadPermissions();
  }, []);

  // 当权限变化导致当前 Tab 不可见时，自动切换到第一个可见 Tab
  useEffect(() => {
    if (!visibleTabs.some((t) => t.key === activeTab)) {
      setActiveTab(visibleTabs[0].key);
    }
  }, [activeTab, visibleTabs]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <header>
        <h1 className="text-lg font-semibold">用户 & 权限管理中心</h1>
        <p className="mt-1 text-xs text-slate-500">
          统一管理系统用户、角色与权限。RBAC（基于角色的访问控制）配置均在此完成。
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
        {activeTab === "users" && canManageUsers && (
          <UsersPanel
            presenter={usersPresenter}
            roles={rolesPresenter.roles} // ⭐ 关键修复：把角色传给 UsersPanel
          />
        )}

        {activeTab === "roles" && canManageRoles && (
          <RolesPanel
            presenter={rolesPresenter}
            permissions={permissions}
            permissionsLoading={permLoading}
          />
        )}

        {activeTab === "perms" && canManagePerms && (
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
