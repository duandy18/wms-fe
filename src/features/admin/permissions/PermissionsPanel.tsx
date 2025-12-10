// src/features/admin/permissions/PermissionsPanel.tsx
//
// 【最终版】权限字典管理面板（RBAC 拆分版）
// - 展示系统所有权限（Permission Dictionary）
// - 创建权限（幂等）
// - 不依赖 Users / Roles 模块
//

import React, { useEffect, useState } from "react";
import type { PermissionsPresenter } from "./usePermissionsPresenter";
import type { PermissionDTO } from "../users/types";

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
  const { creating, error, setError, createPermission } = presenter;

  const mergedError = loadError || error;

  // 创建权限字段
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      setError("权限名不能为空");
      return;
    }

    await createPermission({
      name: name.trim(),
      description: description || null,
    });

    setName("");
    setDescription("");
  }

  return (
    <div className="space-y-4 text-sm">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">权限字典</h2>
          <p className="mt-1 text-xs text-slate-600">
            系统内所有权限（Permission Code）列表，例如
            <span className="font-mono text-[11px] bg-slate-100 px-1 rounded">
              operations.inbound
            </span>{" "}
            或{" "}
            <span className="font-mono text-[11px] bg-slate-100 px-1 rounded">
              config.store.write
            </span>
            。
          </p>
        </div>
      </header>

      {mergedError && (
        <div className="border border-red-200 bg-red-50 rounded px-3 py-2 text-red-600">
          {mergedError}
        </div>
      )}

      {/* 创建权限 */}
      <section className="bg-white border rounded-xl p-4 space-y-3">
        <h3 className="text-base font-semibold text-slate-800">创建权限</h3>

        <form
          className="grid grid-cols-1 md:grid-cols-3 gap-3"
          onSubmit={handleCreate}
        >
          {/* 权限名 */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">权限名</label>
            <input
              className="border rounded px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如 operations.outbound"
            />
          </div>

          {/* 描述 */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-xs text-slate-600">描述</label>
            <input
              className="border rounded px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="权限说明（可选）"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 bg-sky-600 text-white rounded text-sm disabled:opacity-60"
            >
              {creating ? "创建中…" : "创建权限"}
            </button>
          </div>
        </form>
      </section>

      {/* 权限列表 */}
      <section className="border bg-white rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-4 text-sm text-slate-600">加载中…</div>
        ) : permissions.length === 0 ? (
          <div className="p-4 text-sm text-slate-500">暂无权限。</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-3 py-2 w-16 text-left">ID</th>
                <th className="px-3 py-2 w-48 text-left">权限名</th>
                <th className="px-3 py-2 text-left">描述</th>
              </tr>
            </thead>

            <tbody>
              {permissions.map((p) => (
                <tr key={p.id} className="border-b hover:bg-slate-50">
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
