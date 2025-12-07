// src/features/admin/users/panels/RolesPanel.tsx
import React, { useState } from "react";
import { useAuth } from "../../../../app/auth/useAuth";
import type { RolesPresenter } from "../hooks/useRolesPresenter";
import type { PermissionDTO } from "../types";

type Props = {
  presenter: RolesPresenter;
  permissions: PermissionDTO[];
  permissionsLoading?: boolean;
};

export function RolesPanel({ presenter, permissions, permissionsLoading }: Props) {
  const { can } = useAuth();
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

  const canCreateRole = can("create_role");
  const canEditPerms = can("add_permission_to_role");

  function openEditPerms(roleId: string) {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return;
    setEditingRoleId(roleId);
    const set = new Set<string>();
    for (const p of role.permissions || []) set.add(String(p.id));
    setSelectedPermIds(set);
  }

  function togglePerm(id: string) {
    setSelectedPermIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleCreate(e: React.FormEvent) {
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
    } catch {}
  }

  async function handleSave() {
    if (!editingRoleId) return;
    try {
      await setRolePermissions(editingRoleId, Array.from(selectedPermIds));
      setEditingRoleId(null);
      setSelectedPermIds(new Set());
    } catch {}
  }

  function permNames(roleId: string) {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return "-";
    return role.permissions.map((p) => p.name).join(", ") || "-";
  }

  return (
    <div className="space-y-4 text-sm">
      <h2 className="text-lg font-semibold">角色 & 权限</h2>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border px-3 py-2 rounded">
          {error}
        </div>
      )}

      {/* 创建角色卡片 */}
      {canCreateRole && (
        <section className="bg-white p-4 rounded-xl border space-y-3">
          <h3 className="text-base font-semibold">创建角色</h3>
          <form
            className="grid grid-cols-1 md:grid-cols-3 gap-3"
            onSubmit={handleCreate}
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-600">角色名称</label>
              <input
                className="border rounded-lg px-3 py-2"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs text-slate-600">描述</label>
              <input
                className="border rounded-lg px-3 py-2"
                value={newRoleDesc}
                onChange={(e) => setNewRoleDesc(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm hover:bg-sky-700 disabled:opacity-60"
              >
                {creating ? "创建中…" : "创建角色"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* 角色列表卡片 */}
      <section className="bg-white border rounded-xl overflow-hidden">
        {loading ? (
          <div className="px-4 py-6">加载中…</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left w-16">ID</th>
                <th className="px-3 py-2 text-left w-40">角色名</th>
                <th className="px-3 py-2 text-left">描述</th>
                <th className="px-3 py-2 text-left w-72">权限</th>
                <th className="px-3 py-2 text-left w-28">操作</th>
              </tr>
            </thead>

            <tbody>
              {roles.map((r) => (
                <tr key={r.id} className="border-b hover:bg-slate-50">
                  <td className="px-3 py-2">{r.id}</td>
                  <td className="px-3 py-2">{r.name}</td>
                  <td className="px-3 py-2">
                    {r.description || (
                      <span className="text-slate-400">-</span>
                    )}
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

      {/* 编辑角色权限卡片 */}
      {editingRoleId && (
        <section className="bg-white border rounded-xl p-4 space-y-3">
          <h3 className="text-base font-semibold">
            编辑角色权限：{roles.find((r) => r.id === editingRoleId)?.name}
          </h3>

          <div className="max-h-64 overflow-auto border rounded-lg p-2">
            {permissionsLoading ? (
              <div className="text-xs text-slate-500 px-2 py-1">
                权限列表加载中…
              </div>
            ) : permissions.length === 0 ? (
              <div className="text-xs text-slate-500 px-2 py-1">
                暂无权限，请先在权限字典里创建。
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
            onClick={handleSave}
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
