// src/features/admin/roles/RolesPanel.tsx
//
// 【最终版】角色管理（多角色 RBAC 结构化版本）
// - 列出角色
// - 创建角色
// - 编辑角色权限
// - 完全兼容新的 roles/api.ts + useRolesPresenter.ts
//

import React, { useState } from "react";
import type { RolesPresenter } from "./useRolesPresenter";
import type { PermissionDTO } from "../permissions/api";

type Props = {
  presenter: RolesPresenter;
  permissions: PermissionDTO[];
  permissionsLoading?: boolean;
};

export function RolesPanel({
  presenter,
  permissions,
  permissionsLoading = false,
}: Props) {
  const {
    roles,
    loading,
    creating,
    savingPerms,
    error,
    createRole,
    setRolePermissions,
    setError,
  } = presenter;

  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");

  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [selectedPermIds, setSelectedPermIds] = useState<Set<string>>(
    () => new Set(),
  );

  const canCreateRole = true; // 权限 gating 交给上层
  const canEditPerms = true;

  // ------------------------------------------------------------
  // 角色权限编辑
  // ------------------------------------------------------------
  function openEditPerms(roleId: string) {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return;

    setEditingRoleId(roleId);

    const newSet = new Set<string>();
    for (const p of role.permissions || []) newSet.add(String(p.id));

    setSelectedPermIds(newSet);
  }

  function togglePerm(id: string) {
    setSelectedPermIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleSaveRolePerms() {
    if (!editingRoleId) return;

    try {
      await setRolePermissions(editingRoleId, Array.from(selectedPermIds));
      setEditingRoleId(null);
      setSelectedPermIds(new Set());
    } catch (err) {
      console.error("setRolePermissions failed", err);
    }
  }

  // ------------------------------------------------------------
  // 创建角色
  // ------------------------------------------------------------
  async function handleCreateRole(e: React.FormEvent) {
    e.preventDefault();
    if (!newRoleName.trim()) {
      setError("角色名称不能为空");
      return;
    }

    try {
      await createRole({
        name: newRoleName.trim(),
        description: newRoleDesc || null,
      });

      setNewRoleName("");
      setNewRoleDesc("");
    } catch (err) {
      console.error("createRole failed", err);
    }
  }

  function permNames(roleId: string) {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return "-";
    const names = role.permissions.map((p) => p.name);
    return names.length ? names.join(", ") : "-";
  }

  // ------------------------------------------------------------
  // 渲染区域
  // ------------------------------------------------------------
  return (
    <div className="space-y-4 text-sm">
      <h2 className="text-lg font-semibold">角色管理</h2>

      {/* 错误提示 */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border px-3 py-2 rounded">
          {error}
        </div>
      )}

      {/* 创建角色 */}
      {canCreateRole && (
        <section className="bg-white border rounded-xl p-4 space-y-3">
          <h3 className="text-base font-semibold">创建角色</h3>

          <form
            className="grid grid-cols-1 md:grid-cols-3 gap-3"
            onSubmit={handleCreateRole}
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-600">角色名称</label>
              <input
                className="border rounded-lg px-3 py-2"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="如 warehouse_manager"
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs text-slate-600">描述（可选）</label>
              <input
                className="border rounded-lg px-3 py-2"
                value={newRoleDesc}
                onChange={(e) => setNewRoleDesc(e.target.value)}
                placeholder="该角色的说明"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 rounded-lg bg-sky-600 text-white text-sm hover:bg-sky-700 disabled:opacity-60"
              >
                {creating ? "创建中…" : "创建角色"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* 角色列表 */}
      <section className="bg-white border rounded-xl overflow-hidden">
        {loading ? (
          <div className="px-4 py-6">加载中…</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left w-12">ID</th>
                <th className="px-3 py-2 text-left">角色名</th>
                <th className="px-3 py-2 text-left">描述</th>
                <th className="px-3 py-2 text-left">权限</th>
                <th className="px-3 py-2 text-left w-28">操作</th>
              </tr>
            </thead>

            <tbody>
              {roles.map((r) => (
                <tr key={r.id} className="border-b hover:bg-slate-50">
                  <td className="px-3 py-2">{r.id}</td>
                  <td className="px-3 py-2">{r.name}</td>
                  <td className="px-3 py-2">
                    {r.description || <span className="text-slate-400">-</span>}
                  </td>
                  <td className="px-3 py-2">{permNames(r.id)}</td>
                  <td className="px-3 py-2">
                    {canEditPerms && (
                      <button
                        className="text-xs text-sky-700 hover:underline"
                        onClick={() => openEditPerms(r.id)}
                      >
                        编辑权限
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* 编辑角色权限 */}
      {editingRoleId && (
        <section className="bg-white border rounded-xl p-4 space-y-3">
          <h3 className="text-base font-semibold">
            编辑角色权限：{roles.find((r) => r.id === editingRoleId)?.name}
          </h3>

          <div className="max-h-64 overflow-auto border rounded-lg p-2">
            {permissionsLoading ? (
              <div className="px-2 py-1 text-xs text-slate-500">
                权限列表加载中…
              </div>
            ) : permissions.length === 0 ? (
              <div className="px-2 py-1 text-xs text-slate-500">
                暂无权限，请先创建权限。
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
                {permissions.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermIds.has(String(p.id))}
                      onChange={() => togglePerm(String(p.id))}
                    />
                    <span className="font-mono text-[11px]">{p.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleSaveRolePerms}
            disabled={savingPerms}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm hover:bg-sky-700 disabled:opacity-60"
          >
            {savingPerms ? "保存中…" : "保存权限"}
          </button>
        </section>
      )}
    </div>
  );
}
