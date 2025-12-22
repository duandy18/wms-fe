// src/features/admin/users/panels/UsersPanel.tsx
//
// 【最终版】用户管理面板（多角色 RBAC 完整版）
// - 创建用户（主角色 + 多角色）
// - 编辑用户（基础信息 + 主/多角色）
// - 启用 / 停用
// - 重置密码
//

import React, { useState } from "react";
import { useAuth } from "../../../../shared/useAuth";
import type { UsersPresenter } from "../hooks/useUsersPresenter";
import type { UserDTO, RoleDTO } from "../types";

type Props = {
  presenter: UsersPresenter;
  roles: RoleDTO[]; // 来自 UsersAdminPage，rolesPresenter.roles
};

export function UsersPanel({ presenter, roles }: Props) {
  const { can } = useAuth();

  const {
    users,
    loading,
    creating,
    mutating,
    error,
    createUser,
    updateUser,
    resetPassword,
    setError,
  } = presenter;

  // 权限控制
  const canManageUser = can("system.user.manage");

  // -------------------------------------------------------
  // 创建用户字段
  // -------------------------------------------------------
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("000000");
  const [newPrimaryRoleId, setNewPrimaryRoleId] = useState<string>("");
  const [newExtraRoleIds, setNewExtraRoleIds] = useState<Set<string>>(new Set());

  const [newFullName, setNewFullName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");

  function toggleNewExtraRole(id: string) {
    setNewExtraRoleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    if (!canManageUser) return;

    if (!newUsername.trim() || !newPrimaryRoleId) {
      setError("请填写用户名 + 主角色");
      return;
    }

    await createUser({
      username: newUsername.trim(),
      password: newPassword,
      primary_role_id: Number(newPrimaryRoleId),
      extra_role_ids: Array.from(newExtraRoleIds).map((x) => Number(x)),
      full_name: newFullName || null,
      phone: newPhone || null,
      email: newEmail || null,
    });

    // 清空
    setNewUsername("");
    setNewPassword("000000");
    setNewPrimaryRoleId("");
    setNewExtraRoleIds(new Set());
    setNewFullName("");
    setNewPhone("");
    setNewEmail("");
  }

  // -------------------------------------------------------
  // 编辑用户字段
  // -------------------------------------------------------
  const [editingUser, setEditingUser] = useState<UserDTO | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const [editPrimaryRoleId, setEditPrimaryRoleId] = useState<string>("");
  const [editExtraRoleIds, setEditExtraRoleIds] = useState<Set<string>>(new Set());

  function openEdit(u: UserDTO) {
    setEditingUser(u);

    setEditFullName(u.full_name || "");
    setEditPhone(u.phone || "");
    setEditEmail(u.email || "");

    // 主角色
    setEditPrimaryRoleId(u.role_id ? String(u.role_id) : "");

    // 多角色（从 u.extra_roles 获取 — 稍后 presenter 会提供）
    const extra = new Set<string>();
    (u.extra_roles || []).forEach((rid) => extra.add(String(rid)));

    setEditExtraRoleIds(extra);
  }

  function toggleEditExtraRole(id: string) {
    setEditExtraRoleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;

    await updateUser(editingUser.id, {
      full_name: editFullName || null,
      phone: editPhone || null,
      email: editEmail || null,
      primary_role_id: editPrimaryRoleId ? Number(editPrimaryRoleId) : null,
      extra_role_ids: Array.from(editExtraRoleIds).map((x) => Number(x)),
    });

    setEditingUser(null);
  }

  async function handleToggleActive(u: UserDTO) {
    await updateUser(u.id, { is_active: !u.is_active });
  }

  async function handleResetPassword(u: UserDTO) {
    if (!window.confirm(`确认将用户「${u.username}」密码重置为 000000？`)) {
      return;
    }
    await resetPassword(u.id);
    alert("密码已重置为 000000");
  }

  function roleName(rid: number | null | undefined) {
    const r = roles.find((x) => Number(x.id) === Number(rid));
    return r?.name ?? (rid ? `#${rid}` : "-");
  }

  return (
    <div className="space-y-4 text-sm">
      <h2 className="text-lg font-semibold">用户管理</h2>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-600 px-3 py-2 rounded">
          {error}
        </div>
      )}

      {/* ===================== 创建用户 ===================== */}
      {canManageUser && (
        <section className="bg-white border rounded-xl p-4 space-y-3">
          <h3 className="text-base font-semibold">创建用户</h3>

          <form
            className="grid grid-cols-1 md:grid-cols-3 gap-3"
            onSubmit={handleCreate}
          >
            {/* 用户名 */}
            <div>
              <label className="text-xs text-slate-600">登录名</label>
              <input
                className="border rounded px-3 py-2 w-full"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>

            {/* 密码 */}
            <div>
              <label className="text-xs text-slate-600">
                密码（默认 000000）
              </label>
              <input
                type="password"
                className="border rounded px-3 py-2 w-full"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            {/* 主角色 */}
            <div>
              <label className="text-xs text-slate-600">主角色</label>
              <select
                className="border rounded px-3 py-2 w-full"
                value={newPrimaryRoleId}
                onChange={(e) => setNewPrimaryRoleId(e.target.value)}
              >
                <option value="">请选择主角色</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 多角色 */}
            <div className="md:col-span-2">
              <label className="text-xs text-slate-600">附加角色</label>
              <div className="flex flex-wrap gap-2">
                {roles.map((r) => (
                  <label key={r.id} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={newExtraRoleIds.has(String(r.id))}
                      onChange={() => toggleNewExtraRole(String(r.id))}
                    />
                    <span>{r.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 真实信息 */}
            <div>
              <label className="text-xs text-slate-600">姓名</label>
              <input
                className="border rounded px-3 py-2 w-full"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-slate-600">电话</label>
              <input
                className="border rounded px-3 py-2 w-full"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-slate-600">邮箱</label>
              <input
                className="border rounded px-3 py-2 w-full"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>

            {/* 提交 */}
            <div className="flex items-end">
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 text-white rounded disabled:opacity-50"
                disabled={creating}
              >
                {creating ? "创建中…" : "创建用户"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* ===================== 用户列表 ===================== */}
      <section className="border bg-white rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-4">加载中…</div>
        ) : users.length === 0 ? (
          <div className="p-4 text-slate-500">暂无用户。</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-3 py-2 w-12 text-left">ID</th>
                <th className="px-3 py-2 text-left">用户名</th>
                <th className="px-3 py-2 text-left">姓名</th>
                <th className="px-3 py-2 text-left">电话</th>
                <th className="px-3 py-2 text-left">邮箱</th>
                <th className="px-3 py-2 text-left">主角色</th>
                <th className="px-3 py-2 text-left">附加角色</th>
                <th className="px-3 py-2 text-left w-28">状态</th>
                <th className="px-3 py-2 text-left w-40">操作</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b hover:bg-slate-50">
                  <td className="px-3 py-2">{u.id}</td>
                  <td className="px-3 py-2">{u.username}</td>
                  <td className="px-3 py-2">{u.full_name || "-"}</td>
                  <td className="px-3 py-2">{u.phone || "-"}</td>
                  <td className="px-3 py-2">{u.email || "-"}</td>
                  <td className="px-3 py-2">{roleName(u.role_id)}</td>
                  <td className="px-3 py-2">
                    {(u.extra_roles || []).map((rid) => (
                      <span
                        key={rid}
                        className="inline-block px-2 py-0.5 bg-slate-100 rounded text-xs mr-1"
                      >
                        {roleName(rid)}
                      </span>
                    ))}
                  </td>

                  <td className="px-3 py-2">
                    {u.is_active ? (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs">
                        启用
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs">
                        停用
                      </span>
                    )}
                  </td>

                  <td className="px-3 py-2">
                    <div className="flex gap-2 text-xs">
                      {/* 编辑 */}
                      <button
                        className="px-2 py-1 border rounded hover:bg-slate-100"
                        disabled={mutating}
                        onClick={() => openEdit(u)}
                      >
                        编辑
                      </button>

                      {/* 启用/停用 */}
                      <button
                        className="px-2 py-1 border rounded hover:bg-slate-100"
                        disabled={mutating}
                        onClick={() => handleToggleActive(u)}
                      >
                        {u.is_active ? "停用" : "启用"}
                      </button>

                      {/* 重置密码 */}
                      <button
                        className="px-2 py-1 border border-amber-400 text-amber-700 rounded hover:bg-amber-50"
                        disabled={mutating}
                        onClick={() => handleResetPassword(u)}
                      >
                        重置密码
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* ===================== 编辑用户弹窗 ===================== */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[520px] shadow-xl space-y-4">
            <h3 className="text-lg font-semibold">
              编辑用户：{editingUser.username}
            </h3>

            <form className="space-y-4" onSubmit={handleSaveEdit}>
              <div className="grid grid-cols-2 gap-3">
                {/* 姓名 */}
                <div>
                  <label className="text-xs text-slate-600">姓名</label>
                  <input
                    className="border rounded px-3 py-2 w-full"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                  />
                </div>

                {/* 电话 */}
                <div>
                  <label className="text-xs text-slate-600">电话</label>
                  <input
                    className="border rounded px-3 py-2 w-full"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                  />
                </div>

                {/* 邮箱 */}
                <div>
                  <label className="text-xs text-slate-600">邮箱</label>
                  <input
                    className="border rounded px-3 py-2 w-full"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </div>

                {/* 主角色 */}
                <div>
                  <label className="text-xs text-slate-600">主角色</label>
                  <select
                    className="border rounded px-3 py-2 w-full"
                    value={editPrimaryRoleId}
                    onChange={(e) => setEditPrimaryRoleId(e.target.value)}
                  >
                    <option value="">不变</option>
                    {roles.map((r) => (
                      <option key={r.id} value={String(r.id)}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 附加角色 */}
              <div>
                <label className="text-xs text-slate-600">附加角色</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {roles.map((r) => (
                    <label key={r.id} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={editExtraRoleIds.has(String(r.id))}
                        onChange={() => toggleEditExtraRole(String(r.id))}
                      />
                      <span>{r.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
                  onClick={() => setEditingUser(null)}
                  disabled={mutating}
                >
                  取消
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 text-sm rounded-lg bg-sky-600 text-white disabled:opacity-50"
                  disabled={mutating}
                >
                  {mutating ? "保存中…" : "保存"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
