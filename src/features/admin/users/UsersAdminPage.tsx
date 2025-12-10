// src/features/admin/users/UsersAdminPage.tsx
//
// RBAC 用户 & 权限管理中心
// - Tab1: 用户管理（UsersPanel）
// - Tab2: 角色 & 权限（RolesPanel）
// - Tab3: 权限字典（PermissionsPanel）
// Hooks 全部在组件顶层调用，符合 react-hooks/rules-of-hooks 要求。

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

export default function UsersAdminPage() {
  const { can } = useAuth();

  // 顶层：先算出当前账号有哪些 system.* 权限
  const canManageUsers = can("system.user.manage");
  const canManageRoles = can("system.role.manage");
  const canManagePerms = can("system.permission.manage");

  // visibleTabs 用 useMemo 包起来，避免每次 render 都创建新数组，配合 useEffect 更稳定
  const visibleTabs = useMemo(
    () =>
      [
        ...(canManageUsers ? [{ key: "users", label: "用户管理" as const }] : []),
        ...(canManageRoles ? [{ key: "roles", label: "角色 & 权限" as const }] : []),
        ...(canManagePerms ? [{ key: "perms", label: "权限字典" as const }] : []),
      ] satisfies { key: TabKey; label: string }[],
    [canManageUsers, canManageRoles, canManagePerms],
  );

  // 如果当前账号完全没有 system.* 管理权限
  const hasAnyTab = visibleTabs.length > 0;

  // 所有 hooks 都要在组件顶层调用，不能写在 if 里面
  const [activeTab, setActiveTab] = useState<TabKey>("users");

  // Users / Roles / Permissions 三个 Presenter：始终定义在顶层
  const usersPresenter = useUsersPresenter();
  const rolesPresenter = useRolesPresenter();

  const [permissions, setPermissions] = useState<PermissionDTO[]>([]);
  const [permLoading, setPermLoading] = useState(false);
  const [permError, setPermError] = useState<string | null>(null);

  const permsPresenter = usePermissionsPresenter(reloadPermissions);

  // ---- 权限字典加载 ----
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

  // ---- 保证 activeTab 始终在可见 Tab 集合内 ----
  useEffect(() => {
    if (!hasAnyTab) {
      return;
    }
    if (!visibleTabs.some((t) => t.key === activeTab)) {
      setActiveTab(visibleTabs[0].key);
    }
  }, [activeTab, hasAnyTab, visibleTabs]);

  // ---- 若完全没有 system.* 管理权限 ----
  if (!hasAnyTab) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-semibold">用户 & 权限管理</h1>
        <p className="text-sm text-slate-600">
          当前账号未拥有任何 system.* 管理权限。
          如需开通，请联系系统管理员。
        </p>
      </div>
    );
  }

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
          <UsersPanel presenter={usersPresenter} roles={rolesPresenter.roles} />
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
