// src/features/admin/users/panels/UsersPanel.tsx
import React, { useState } from "react";
import { useAuth } from "../../../../app/auth/useAuth";
import type { UsersPresenter } from "../hooks/useUsersPresenter";
import type { UserDTO } from "../types";

type Props = { presenter: UsersPresenter };

export function UsersPanel({ presenter }: Props) {
  // 当前阶段：只要登录即可创建 / 修改 / 重置密码，RBAC 以后再接入
  const { isAuthenticated } = useAuth();

  const {
    users,
    roles,
    loading,
    creating,
    mutating,
    error,
    createUser,
    setError,
    updateUser,
    resetPassword,
  } = presenter;

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("000000"); // 默认密码
  const [newRoleId, setNewRoleId] = useState<string>("");
  const [newFullName, setNewFullName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const [editingUser, setEditingUser] = useState<UserDTO | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRoleId, setEditRoleId] = useState<string>("");

  // 权限开关：统一基于是否登录
  const canCreateUser = isAuthenticated;
  const canUpdateUser = isAuthenticated;
  const canResetPassword = isAuthenticated;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!canCreateUser) return;

    if (!newUsername || !newPassword || !newRoleId) {
      setError("请至少填写：登录名 / 密码 / 角色");
      return;
    }

    try {
      await createUser({
        username: newUsername,
        password: newPassword,
        role_id: Number(newRoleId),
        full_name: newFullName || null,
        phone: newPhone || null,
        email: newEmail || null,
      });
      setNewUsername("");
      setNewPassword("000000"); // 恢复默认
      setNewRoleId("");
      setNewFullName("");
      setNewPhone("");
      setNewEmail("");
    } catch {
      // error 已在 presenter 内部处理
    }
  }

  function roleName(role_id: number | null | undefined) {
    const r = roles.find((x) => Number(x.id) === Number(role_id));
    return r?.name ?? (role_id != null ? `#${role_id}` : "-");
  }

  function openEdit(u: UserDTO) {
    setEditingUser(u);
    setEditFullName(u.full_name || "");
    setEditPhone(u.phone || "");
    setEditEmail(u.email || "");
    setEditRoleId(u.role_id != null ? String(u.role_id) : "");
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser || !canUpdateUser) return;

    try {
      await updateUser(editingUser.id, {
        full_name: editFullName || null,
        phone: editPhone || null,
        email: editEmail || null,
        role_id: editRoleId ? Number(editRoleId) : null,
      });
      setEditingUser(null);
    } catch {
      // 错误已在 presenter 里处理
    }
  }

  async function handleToggleActive(u: UserDTO) {
    if (!canUpdateUser) return;
    try {
      await updateUser(u.id, { is_active: !u.is_active });
    } catch {
      // presenter 已处理错误
    }
  }

  async function handleResetPassword(u: UserDTO) {
    if (!canResetPassword) return;

    if (!window.confirm(`确认将用户「${u.username}」密码重置为 000000？`)) {
      return;
    }
    try {
      await resetPassword(u.id);
      alert("密码已重置为 000000");
    } catch {
      // presenter 已处理错误
    }
  }

  return (
    <div className="space-y-4 text-sm">
      <h2 className="text-lg font-semibold">用户管理</h2>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border px-3 py-2 rounded">
          {error}
        </div>
      )}

      {/* 创建用户卡片 */}
      {canCreateUser && (
        <section className="bg-white border rounded-xl p-4 space-y-3">
          <h3 className="text-base font-semibold">创建用户</h3>

          <form
            className="grid grid-cols-1 md:grid-cols-3 gap-3"
            onSubmit={handleCreate}
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-600">登录名</label>
              <input
                className="border rounded-lg px-3 py-2"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="登录用户名"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-600">
                密码（默认 000000）
              </label>
              <input
                type="password"
                className="border rounded-lg px-3 py-2"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-600">姓名</label>
              <input
                className="border rounded-lg px-3 py-2"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-600">联系电话</label>
              <input
                className="border rounded-lg px-3 py-2"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-600">邮件地址</label>
              <input
                className="border rounded-lg px-3 py-2"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-600">角色</label>
              <select
                className="border rounded-lg px-3 py-2"
                value={newRoleId}
                onChange={(e) => setNewRoleId(e.target.value)}
              >
                <option value="">请选择角色</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 rounded-lg bg-sky-600 text-white text-sm hover:bg-sky-700 disabled:opacity-60"
              >
                {creating ? "创建中…" : "创建用户"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* 用户列表卡片 */}
      <section className="bg-white border rounded-xl overflow-hidden">
        {loading ? (
          <div className="px-4 py-6">加载中…</div>
        ) : users.length === 0 ? (
          <div className="px-4 py-6 text-slate-500">暂无用户。</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left w-12">ID</th>
                <th className="px-3 py-2 text-left">登录名</th>
                <th className="px-3 py-2 text-left">姓名</th>
                <th className="px-3 py-2 text-left">联系电话</th>
                <th className="px-3 py-2 text-left">邮件地址</th>
                <th className="px-3 py-2 text-left">角色</th>
                <th className="px-3 py-2 text-left">状态</th>
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
                    {u.is_active ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700">
                        启用
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-500">
                        停用
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2 text-xs">
                      {canUpdateUser && (
                        <>
                          <button
                            className="px-2 py-1 rounded border border-slate-300 hover:bg-slate-100"
                            onClick={() => openEdit(u)}
                            disabled={mutating}
                          >
                            编辑
                          </button>
                          <button
                            className="px-2 py-1 rounded border border-slate-300 hover:bg-slate-100"
                            onClick={() => handleToggleActive(u)}
                            disabled={mutating}
                          >
                            {u.is_active ? "停用" : "启用"}
                          </button>
                        </>
                      )}
                      {canResetPassword && (
                        <button
                          className="px-2 py-1 rounded border border-amber-400 text-amber-700 hover:bg-amber-50"
                          onClick={() => handleResetPassword(u)}
                          disabled={mutating}
                        >
                          重置密码
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* 编辑用户弹窗 */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-[480px] shadow-xl space-y-4">
            <h3 className="text-lg font-semibold">
              编辑用户：{editingUser.username}
            </h3>

            <form className="space-y-3" onSubmit={handleSaveEdit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-600">姓名</label>
                  <input
                    className="border rounded-lg px-3 py-2"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-600">联系电话</label>
                  <input
                    className="border rounded-lg px-3 py-2"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-600">邮件地址</label>
                  <input
                    className="border rounded-lg px-3 py-2"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-600">主角色</label>
                  <select
                    className="border rounded-lg px-3 py-2"
                    value={editRoleId}
                    onChange={(e) => setEditRoleId(e.target.value)}
                  >
                    <option value="">不变</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
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
                  className="px-4 py-2 text-sm rounded-lg bg-slate-900 text-white disabled:opacity-60"
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
