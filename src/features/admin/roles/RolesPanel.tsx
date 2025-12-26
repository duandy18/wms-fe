// src/features/admin/roles/RolesPanel.tsx
//
// 角色管理面板（多角色 RBAC）
// - 创建角色
// - 查看角色
// - 编辑角色权限
// - 所有 .map 调用都做了 null/undefined 防御

import React, { useState } from "react";
import type { RolesPresenter } from "./useRolesPresenter";
import type { PermissionDTO } from "../users/types";
import { UI } from "./ui";

type Props = {
  presenter: RolesPresenter;
  permissions: PermissionDTO[];
  permissionsLoading?: boolean;
};

export function RolesPanel({ presenter, permissions, permissionsLoading = false }: Props) {
  const { roles, loading, creating, savingPerms, error, createRole, setRolePermissions, setError } = presenter;

  const safePermissions = Array.isArray(permissions) ? permissions : [];
  const safeRoles = Array.isArray(roles) ? roles : [];

  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");

  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [selectedPermIds, setSelectedPermIds] = useState<Set<string>>(() => new Set());

  const canCreateRole = true;
  const canEditPerms = true;

  function openEditPerms(roleId: number) {
    const role = safeRoles.find((r) => r.id === roleId);
    if (!role) return;

    setEditingRoleId(roleId);

    const newSet = new Set<string>();
    const currentPerms = Array.isArray(role.permissions) ? role.permissions : [];

    for (const p of currentPerms) {
      newSet.add(String(p.id));
    }

    setSelectedPermIds(newSet);
  }

  function togglePerm(id: string) {
    setSelectedPermIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSaveRolePerms() {
    if (editingRoleId == null) return;

    try {
      await setRolePermissions(editingRoleId, Array.from(selectedPermIds));
      setEditingRoleId(null);
      setSelectedPermIds(new Set());
    } catch (err) {
      console.error("setRolePermissions failed", err);
    }
  }

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

  function permNames(roleId: number) {
    const role = safeRoles.find((r) => r.id === roleId);
    if (!role) return "-";
    const permsArr = Array.isArray(role.permissions) ? role.permissions : [];
    const names = permsArr.map((p) => p.name);
    return names.length ? names.join(", ") : "-";
  }

  return (
    <div className={UI.page}>
      <h2 className={UI.h2}>角色管理</h2>

      {error ? <div className={UI.errBanner}>{error}</div> : null}

      {/* 创建角色 */}
      {canCreateRole ? (
        <section className={UI.card}>
          <h3 className={UI.h3}>创建角色</h3>

          <form className={UI.formGrid} onSubmit={handleCreateRole}>
            <div className={UI.field}>
              <label className={UI.label}>角色名称</label>
              <input
                className={UI.input}
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="如 warehouse_manager"
              />
            </div>

            <div className={`${UI.field} md:col-span-2`}>
              <label className={UI.label}>描述（可选）</label>
              <input
                className={UI.input}
                value={newRoleDesc}
                onChange={(e) => setNewRoleDesc(e.target.value)}
                placeholder="该角色的说明"
              />
            </div>

            <div className="flex items-end">
              <button type="submit" disabled={creating} className={UI.btnPrimary}>
                {creating ? "创建中…" : "创建角色"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {/* 角色列表 */}
      <section className={UI.listWrap}>
        {loading ? (
          <div className={UI.listLoading}>加载中…</div>
        ) : safeRoles.length === 0 ? (
          <div className={UI.listEmpty}>暂无角色。</div>
        ) : (
          <table className={UI.table}>
            <thead className={UI.thead}>
              <tr>
                <th className={`${UI.th} w-12`}>ID</th>
                <th className={UI.th}>角色名</th>
                <th className={UI.th}>描述</th>
                <th className={UI.th}>权限</th>
                <th className={`${UI.th} w-28`}>操作</th>
              </tr>
            </thead>

            <tbody>
              {safeRoles.map((r) => (
                <tr key={r.id} className={UI.tr}>
                  <td className={UI.td}>{r.id}</td>
                  <td className={UI.td}>{r.name}</td>
                  <td className={UI.td}>
                    {r.description ? r.description : <span className={UI.dash}>-</span>}
                  </td>
                  <td className={UI.td}>{permNames(r.id)}</td>
                  <td className={UI.td}>
                    {canEditPerms ? (
                      <button className={UI.actionLink} onClick={() => openEditPerms(r.id)}>
                        编辑权限
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* 编辑角色权限 */}
      {editingRoleId != null ? (
        <section className={UI.card}>
          <h3 className={UI.permPanelTitle}>
            编辑角色权限：{safeRoles.find((r) => r.id === editingRoleId)?.name}
          </h3>

          <div className={UI.permBox}>
            {permissionsLoading ? (
              <div className={UI.permHint}>权限列表加载中…</div>
            ) : safePermissions.length === 0 ? (
              <div className={UI.permHint}>暂无权限，请先创建权限。</div>
            ) : (
              <div className={UI.permGrid}>
                {safePermissions.map((p) => (
                  <label key={p.id} className={UI.permRow}>
                    <input
                      type="checkbox"
                      checked={selectedPermIds.has(String(p.id))}
                      onChange={() => togglePerm(String(p.id))}
                    />
                    <span className={UI.permName}>{p.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleSaveRolePerms} disabled={savingPerms} className={UI.btnSavePerms}>
            {savingPerms ? "保存中…" : "保存权限"}
          </button>
        </section>
      ) : null}
    </div>
  );
}
