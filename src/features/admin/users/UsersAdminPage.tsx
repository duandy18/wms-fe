// src/features/admin/users/UsersAdminPage.tsx
//
// RBAC 用户 & 权限管理中心（历史入口，已退役为导航页）
// - Phase 5.5：Tab → Page
// - 新入口：
//   - /iam/users  用户管理
//   - /iam/roles  角色管理
//   - /iam/perms  权限字典
//
// 规则：Topbar 负责语义；本页只提供入口导航，不承载业务面板。

import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../shared/useAuth";

type EntryItem = {
  key: "users" | "roles" | "perms";
  label: string;
  to: string;
  enabled: boolean;
  desc: string;
};

export default function UsersAdminPage() {
  const { can } = useAuth();

  const canManageUsers = can("system.user.manage");
  const canManageRoles = can("system.role.manage");
  const canManagePerms = can("system.permission.manage");

  const entries = useMemo<EntryItem[]>(
    () => [
      {
        key: "users",
        label: "用户管理",
        to: "/iam/users",
        enabled: canManageUsers,
        desc: "管理系统用户账号与角色分配。",
      },
      {
        key: "roles",
        label: "角色管理",
        to: "/iam/roles",
        enabled: canManageRoles,
        desc: "创建角色并配置权限集合。",
      },
      {
        key: "perms",
        label: "权限字典",
        to: "/iam/perms",
        enabled: canManagePerms,
        desc: "查看与维护系统权限定义。",
      },
    ],
    [canManageUsers, canManageRoles, canManagePerms],
  );

  const visibleEntries = entries.filter((e) => e.enabled);

  if (visibleEntries.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-slate-600">当前账号未拥有任何 system.* 管理权限。请联系管理员开通。</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 入口列表（无页面级标题，语义由 Topbar 提供） */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {visibleEntries.map((e) => (
          <Link
            key={e.key}
            to={e.to}
            className="block rounded-xl border bg-white p-4 hover:border-slate-300 hover:shadow-sm transition"
          >
            <div className="text-base font-semibold text-slate-900">{e.label}</div>
            <div className="mt-1 text-xs text-slate-600">{e.desc}</div>

            <div className="mt-3 inline-flex items-center text-sm text-sky-700 font-semibold">
              进入
              <span className="ml-1">→</span>
            </div>
          </Link>
        ))}
      </div>

      {/* 兼容提示（可选，保留一点“历史入口”语义，但不当标题） */}
      <p className="text-xs text-slate-500">
        说明：本页为历史入口，仅提供导航。请使用上方入口进入对应页面。
      </p>
    </div>
  );
}
