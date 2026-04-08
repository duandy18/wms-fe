// src/features/admin/permissions/PermissionsPanel.tsx
//
// 权限字典管理面板
// - 展示系统所有权限
// - 创建新权限
// - mergedError 对 loading/loadError/createError 做统一提示
// - 对 permissions 做严格的数组防御

import React, { useState } from "react";
import { usePermissionRuntime } from "../../../shared/runtime";
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
  const { can } = usePermissionRuntime();
  const { creating, error, setError, createPermission } = presenter;

  const canReadAdmin = can("page.admin.read");
  const canManagePermission = can("page.admin.write");

  const safePermissions = Array.isArray(permissions) ? permissions : [];
  const mergedError = loadError || error;

  const [name, setName] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    if (!canManagePermission) return;

    if (!name.trim()) {
      setError("权限名不能为空");
      return;
    }

    await createPermission({
      name: name.trim(),
    });

    setName("");
  }

  if (!canReadAdmin) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-slate-600">当前账号无系统管理页面访问权限。</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-sm">
      {mergedError && (
        <div className="border border-red-200 bg-red-50 rounded px-3 py-2 text-red-600">
          {mergedError}
        </div>
      )}

      {!canManagePermission && (
        <div className="border border-slate-200 bg-slate-50 text-slate-600 px-3 py-2 rounded">
          当前为只读模式，不能创建权限。
        </div>
      )}

      {canManagePermission && (
        <section className="bg-white border rounded-xl p-4 space-y-3">
          <h3 className="text-base font-semibold text-slate-800">创建权限</h3>

          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
            onSubmit={handleCreate}
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-600">权限名</label>
              <input
                className="border rounded px-3 py-2 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="如 operations.outbound"
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
      )}

      <section className="border bg-white rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-4 text-sm text-slate-600">加载中…</div>
        ) : safePermissions.length === 0 ? (
          <div className="p-4 text-sm text-slate-500">暂无权限。</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-3 py-2 w-16 text-left">ID</th>
                <th className="px-3 py-2 text-left">权限名</th>
              </tr>
            </thead>

            <tbody>
              {safePermissions.map((p) => (
                <tr key={p.id} className="border-b hover:bg-slate-50">
                  <td className="px-3 py-2">{p.id}</td>
                  <td className="px-3 py-2 font-mono text-[12px]">
                    {p.name}
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
