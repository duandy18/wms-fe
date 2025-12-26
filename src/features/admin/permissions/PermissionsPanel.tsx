// src/features/admin/permissions/PermissionsPanel.tsx
//
// 权限字典管理面板
// - 展示系统所有权限
// - 创建新权限
// - mergedError 对 loading/loadError/createError 做统一提示
// - 对 permissions 做严格的数组防御

import React, { useState } from "react";
import type { PermissionsPresenter } from "./usePermissionsPresenter";
import type { PermissionDTO } from "../users/types";
import { UI } from "./ui";

type Props = {
  presenter: PermissionsPresenter;
  permissions: PermissionDTO[];
  loading: boolean;
  loadError: string | null;
};

export function PermissionsPanel({ presenter, permissions, loading, loadError }: Props) {
  const { creating, error, setError, createPermission } = presenter;

  const safePermissions = Array.isArray(permissions) ? permissions : [];
  const mergedError = loadError || error;

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
    <div className={UI.page}>
      <header className={UI.header}>
        <div>
          <h2 className={UI.h2}>权限字典</h2>
          <p className={UI.desc}>
            系统内所有权限（Permission Code）列表，例如{" "}
            <span className={UI.codePill}>operations.inbound</span> 或{" "}
            <span className={UI.codePill}>config.store.write</span>。
          </p>
        </div>
      </header>

      {mergedError ? <div className={UI.errBanner}>{mergedError}</div> : null}

      {/* 创建权限 */}
      <section className={UI.card}>
        <h3 className={UI.h3}>创建权限</h3>

        <form className={UI.formGrid} onSubmit={handleCreate}>
          <div className={UI.field}>
            <label className={UI.label}>权限名</label>
            <input
              className={UI.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如 operations.outbound"
            />
          </div>

          <div className={`${UI.field} md:col-span-2`}>
            <label className={UI.label}>描述</label>
            <input
              className={UI.input}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="权限说明（可选）"
            />
          </div>

          <div className="flex items-end">
            <button type="submit" disabled={creating} className={UI.btnPrimary}>
              {creating ? "创建中…" : "创建权限"}
            </button>
          </div>
        </form>
      </section>

      {/* 权限列表 */}
      <section className={UI.listWrap}>
        {loading ? (
          <div className={UI.listLoading}>加载中…</div>
        ) : safePermissions.length === 0 ? (
          <div className={UI.listEmpty}>暂无权限。</div>
        ) : (
          <table className={UI.table}>
            <thead className={UI.thead}>
              <tr>
                <th className={`${UI.th} w-16`}>ID</th>
                <th className={`${UI.th} w-48`}>权限名</th>
                <th className={UI.th}>描述</th>
              </tr>
            </thead>

            <tbody>
              {safePermissions.map((p) => (
                <tr key={p.id} className={UI.tr}>
                  <td className={UI.td}>{p.id}</td>
                  <td className={UI.tdMono}>{p.name}</td>
                  <td className={UI.td}>{p.description ? p.description : <span className={UI.dash}>-</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
