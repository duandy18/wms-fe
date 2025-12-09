// src/features/admin/roles/RolesPage.tsx
import React, { useEffect, useState } from "react";
import { apiGet, apiPost, apiPatch } from "../../../lib/api";

type PermissionOut = {
  id: string;
  name: string;
  description: string | null;
};

type RoleOut = {
  id: string;
  name: string;
  description: string | null;
  permissions: PermissionOut[];
};

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleOut[]>([]);
  const [perms, setPerms] = useState<PermissionOut[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");

  const [editingRole, setEditingRole] = useState<RoleOut | null>(null);
  const [selectedPermIds, setSelectedPermIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [savingPerms, setSavingPerms] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        apiGet<RoleOut[]>("/roles"),
        apiGet<PermissionOut[]>("/permissions"),
      ]);
      setRoles(rolesRes);
      setPerms(permsRes);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message ?? "加载角色/权限失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newRoleName.trim()) {
      setError("角色名称不能为空");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      await apiPost<RoleOut>("/roles", {
        name: newRoleName.trim(),
        description: newRoleDesc || null,
      });
      setNewRoleName("");
      setNewRoleDesc("");
      await load();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message ?? "创建角色失败");
    } finally {
      setCreating(false);
    }
  }

  function openEditPerms(role: RoleOut) {
    setEditingRole(role);
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

  async function savePerms() {
    if (!editingRole) return;
    setSavingPerms(true);
    setError(null);
    try {
      const body = {
        permission_ids: Array.from(selectedPermIds),
      };
      const updated = await apiPatch<RoleOut>(
        `/roles/${editingRole.id}/permissions`,
        body,
      );
      setRoles((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r)),
      );
      setEditingRole(null);
      setSelectedPermIds(new Set());
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message ?? "更新角色权限失败");
    } finally {
      setSavingPerms(false);
    }
  }

  function permNames(role: RoleOut): string {
    const names = (role.permissions || []).map((p) => p.name);
    return names.length ? names.join(", ") : "-";
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">角色管理</h1>
          <p className="mt-1 text-xs text-slate-600">
            管理角色与权限绑定。用户通过 primary_role_id 继承权限。
          </p>
        </div>
      </header>

      {error && (
        <div className="rounded border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* 创建角色 */}
      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-800">创建角色</h2>
        <form
          className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3"
          onSubmit={handleCreate}
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">角色名称</label>
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="如 warehouse.admin"
            />
          </div>
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-xs text-slate-500">描述</label>
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              placeholder="角色说明（可选）"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
            >
              {creating ? "创建中…" : "创建"}
            </button>
          </div>
        </form>
      </section>

      {/* 角色列表 */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="px-4 py-6 text-sm text-slate-600">加载中…</div>
        ) : roles.length === 0 ? (
          <div className="px-4 py-6 text-sm text-slate-500">暂无角色。</div>
        ) : (
          <table className="min-w-full text-xs">
            <thead className="border-b border-slate-200 bg-slate-50">
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
                <tr
                  key={r.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-3 py-2">{r.id}</td>
                  <td className="px-3 py-2">{r.name}</td>
                  <td className="px-3 py-2">
                    {r.description || (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2">{permNames(r)}</td>
                  <td className="px-3 py-2">
                    <button
                      className="text-xs text-slate-600 hover:text-slate-900"
                      onClick={() => openEditPerms(r)}
                    >
                      编辑权限
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* 编辑角色权限 */}
      {editingRole && (
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                编辑角色权限: {editingRole.name}
              </h2>
              <p className="mt-1 text-[11px] text-slate-500">
                选中要绑定在该角色下的权限（幂等：重复绑定不会出重复记录）。
              </p>
            </div>
            <button
              className="text-xs text-slate-500 hover:text-slate-800"
              onClick={() => {
                setEditingRole(null);
                setSelectedPermIds(new Set());
              }}
            >
              取消
            </button>
          </div>

          <div className="max-h-64 overflow-auto rounded-lg border border-slate-200 p-2">
            {perms.length === 0 ? (
              <div className="px-2 py-1 text-xs text-slate-500">
                暂无权限，请先创建权限。
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-1 text-xs md:grid-cols-2">
                {perms.map((p) => (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-center gap-2 px-2 py-1 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermIds.has(String(p.id))}
                      onChange={() => togglePerm(String(p.id))}
                    />
                    <span className="font-mono text-[11px]">{p.name}</span>
                    {p.description && (
                      <span className="text-[11px] text-slate-500">
                        · {p.description}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => void savePerms()}
              disabled={savingPerms}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
            >
              {savingPerms ? "保存中…" : "保存权限"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
