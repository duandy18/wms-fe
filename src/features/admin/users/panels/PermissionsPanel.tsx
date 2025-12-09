// src/features/admin/users/panels/PermissionsPanel.tsx
import React, { useState } from "react";
import type { PermissionsPresenter } from "../hooks/usePermissionsPresenter";
import type { PermissionDTO } from "../types";

type Props = {
  presenter: PermissionsPresenter;
  permissions: PermissionDTO[];
  loading: boolean;
  loadError: string | null;
};

export function PermissionsPanel({
  presenter,
  permissions,
  loading,
  loadError,
}: Props) {
  const { creating, error, createPermission, setError } = presenter;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const mergedError = loadError || error;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("权限名不能为空");
      return;
    }

    try {
      await createPermission({
        name: name.trim(),
        description: description || null,
      });
      setName("");
      setDescription("");
    } catch {
      // presenter 内部已经处理 error
    }
  }

  return (
    <div className="space-y-4 text-sm">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">权限字典</h2>
          <p className="mt-1 text-xs text-slate-600">
            管理系统内的权限码（Permission），例如 stock.read / order.approve 等。
          </p>
        </div>
      </header>

      {mergedError && (
        <div className="rounded border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
          {mergedError}
        </div>
      )}

      {/* 创建权限卡片 */}
      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-base font-semibold text-slate-800">创建权限</h3>
        <form
          className="grid grid-cols-1 gap-3 md:grid-cols-3"
          onSubmit={handleCreate}
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">权限名</label>
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如 stock.read"
            />
          </div>
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-xs text-slate-600">描述</label>
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="权限说明（可选）"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700 disabled:opacity-60"
            >
              {creating ? "创建中…" : "创建权限"}
            </button>
          </div>
        </form>
      </section>

      {/* 权限列表卡片 */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="px-4 py-6 text-sm text-slate-600">加载中…</div>
        ) : permissions.length === 0 ? (
          <div className="px-4 py-6 text-sm text-slate-500">暂无权限。</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="w-16 px-3 py-2 text-left">ID</th>
                <th className="w-40 px-3 py-2 text-left">权限名</th>
                <th className="px-3 py-2 text-left">描述</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-3 py-2">{p.id}</td>
                  <td className="px-3 py-2 font-mono text-[12px]">
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
