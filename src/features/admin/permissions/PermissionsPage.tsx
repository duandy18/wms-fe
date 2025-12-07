// src/features/admin/permissions/PermissionsPage.tsx
import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../../lib/api";
import { useAuth } from "../../../app/auth/useAuth";

type PermissionOut = {
  id: string;
  name: string;
  description: string | null;
};

export default function PermissionsPage() {
  const { can } = useAuth();
  const [perms, setPerms] = useState<PermissionOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet<PermissionOut[]>("/permissions");
      setPerms(res);
    } catch (err: any) {
      setError(err?.message ?? "加载权限列表失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("权限名不能为空");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      await apiPost<PermissionOut>("/permissions", {
        name: name.trim(),
        description: description || null,
      });
      setName("");
      setDescription("");
      await load();
    } catch (err: any) {
      setError(err?.message ?? "创建权限失败");
    } finally {
      setCreating(false);
    }
  }

  const canCreatePermission = can("create_permission");

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">权限管理</h1>
          <p className="text-xs text-slate-600 mt-1">
            管理系统内的权限码（Permission），例如 stock.read /
            order.approve 等。
          </p>
        </div>
      </header>

      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
          {error}
        </div>
      )}

      {/* 创建权限 */}
      {canCreatePermission && (
        <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-800">创建权限</h2>
          <form
            className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm"
            onSubmit={handleCreate}
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">权限名</label>
              <input
                className="border rounded-lg px-3 py-2 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="如 stock.read"
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs text-slate-500">描述</label>
              <input
                className="border rounded-lg px-3 py-2 text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="权限说明（可选）"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm disabled:opacity-60"
              >
                {creating ? "创建中…" : "创建"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* 权限列表 */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="px-4 py-6 text-sm text-slate-600">加载中…</div>
        ) : perms.length === 0 ? (
          <div className="px-4 py-6 text-sm text-slate-500">暂无权限。</div>
        ) : (
          <table className="min-w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 text-left w-16">ID</th>
                <th className="px-3 py-2 text-left w-40">权限名</th>
                <th className="px-3 py-2 text-left">描述</th>
              </tr>
            </thead>
            <tbody>
              {perms.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-3 py-2">{p.id}</td>
                  <td className="px-3 py-2 font-mono text-[11px]">
                    {p.name}
                  </td>
                  <td className="px-3 py-2">
                    {p.description || (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
