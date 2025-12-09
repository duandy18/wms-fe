// src/features/admin/users/panels/RolesPanel.tsx
import React, { useState } from "react";
import type { RolesPresenter } from "../hooks/useRolesPresenter";
import type { PermissionDTO } from "../types";

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
  const [editingRoleId, setEditingRoleId] = useState<string | null>(
    null,
  );
  const [selectedPermIds, setSelectedPermIds] = useState<Set<string>>(
    () => new Set(),
  );

  const canCreateRole = true;
  const canEditPerms = true;

  function openEditPerms(roleId: string) {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return;
    setEditingRoleId(roleId);
    const set = new Set<string>();
    for (const p of role.permissions || []) {
      set.add(String(p.id));
    }
    setSelectedPermIds(set);
  }

  function togglePerm(id: string) {
    setSelectedPermIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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
    } catch (err) {
      // presenter 内部已经设置 error，这里只记录日志
      console.error("createRole failed", err);
    }
  }

  async function handleSave() {
    if (!editingRoleId) return;
    try {
      await setRolePermissions(
        editingRoleId,
        Array.from(selectedPermIds),
      );
      setEditingRoleId(null);
      setSelectedPermIds(new Set());
    } catch (err) {
      console.error("setRolePermissions failed", err);
    }
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
        <div className="rounded border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 创建角色卡片 */}
      {canCreateRole && (
        <section className="space-y-3 rounded-xl border bg-white p-4">
          <h3 className="text-base font-semibold">创建角色</h3>
          <form
            className="grid grid-cols-1 gap-3 md:grid-cols-3"
            onSubmit={handleCreate}
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-600">角色名称</label>
              <input
                className="rounded-lg border px-3 py-2"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs text-slate-600">描述</label>
              <input
                className="rounded-lg border px-3 py-2"
                value={newRoleDesc}
                onChange={(e) => setNewRoleDesc(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={creating}
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700 disabled:opacity-60"
              >
                {creating ? "创建中…" : "创建角色"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* 角色列表卡片 */}
      <section className="overflow-hidden rounded-xl border bg-white">
        {loading ? (
          <div className="px-4 py-6">加载中…</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="w-16 px-3 py-2 text-left">ID</th>
                <th className="w-40 px-3 py-2 text-left">角色名</th>
                <th className="px-3 py-2 text-left">描述</th>
                <th className="w-72 px-3 py-2 text-left">权限</th>
                <th className="w-28 px-3 py-2 text-left">操作</th>
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
        <section className="space-y-3 rounded-xl border bg-white p-4">
          <h3 className="text-base font-semibold">
            编辑角色权限：
            {roles.find((r) => r.id === editingRoleId)?.name}
          </h3>

          <div className="max-h-64 overflow-auto rounded-lg border p-2">
            {permissionsLoading ? (
              <div className="px-2 py-1 text-xs text-slate-500">
                权限列表加载中…
              </div>
            ) : permissions.length === 0 ? (
              <div className="px-2 py-1 text-xs text-slate-500">
                暂无权限，请先在权限字典里创建。
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-1 text-xs md:grid-cols-2">
                {permissions.map((p) => (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-center gap-2 px-2 py-1 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermIds.has(String(p.id))}
                      onChange={() => togglePerm(String(p.id))}
                    />
                    <span className="font-mono text-[11px]">
                      {p.name}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => void handleSave()}
            disabled={savingPerms}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700 disabled:opacity-60"
          >
            {savingPerms ? "保存中…" : "保存权限"}
          </button>
        </section>
      )}
    </div>
  );
}
