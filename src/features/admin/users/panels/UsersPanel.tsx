// src/features/admin/users/panels/UsersPanel.tsx
//
// 用户管理面板（用户直配权限版）
// - 创建用户（直配权限）
// - 编辑用户基础信息 + 覆盖权限
// - 启用 / 停用
// - 重置密码

import React, { useMemo, useState } from "react";
import { usePermissionRuntime } from "../../../../shared/runtime";
import type { UsersPresenter } from "../hooks/useUsersPresenter";
import type { PermissionDTO, UserDTO } from "../types";

type Props = {
  presenter: UsersPresenter;
};

function PermissionChecklist(props: {
  permissions: PermissionDTO[];
  selected: Set<number>;
  onToggle: (id: number) => void;
}) {
  const { permissions, selected, onToggle } = props;

  if (permissions.length === 0) {
    return (
      <div className="text-xs text-slate-500 border rounded px-3 py-2">
        权限字典未加载，当前无法配置用户权限。
      </div>
    );
  }

  return (
    <div className="max-h-56 overflow-auto border rounded-lg p-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
        {permissions.map((p) => (
          <label
            key={p.id}
            className="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 cursor-pointer rounded"
          >
            <input
              type="checkbox"
              checked={selected.has(p.id)}
              onChange={() => onToggle(p.id)}
            />
            <span className="font-mono text-[11px]">{p.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function UsersPanel({ presenter }: Props) {
  const { can } = usePermissionRuntime();

  const {
    users,
    permissions,
    loading,
    creating,
    mutating,
    error,
    createUser,
    updateUser,
    setUserPermissions,
    resetPassword,
    setError,
  } = presenter;

  const canReadAdmin = can("page.admin.read");
  const canManageUser = can("page.admin.write");

  const permissionIdByName = useMemo(() => {
    const map = new Map<string, number>();
    permissions.forEach((p) => map.set(p.name, p.id));
    return map;
  }, [permissions]);

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("000000");
  const [newFullName, setNewFullName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPermissionIds, setNewPermissionIds] = useState<Set<number>>(new Set());

  const [editingUser, setEditingUser] = useState<UserDTO | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPermissionIds, setEditPermissionIds] = useState<Set<number>>(new Set());

  function toggleNewPermission(id: number) {
    setNewPermissionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleEditPermission(id: number) {
    setEditPermissionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    if (!canManageUser) return;
    if (!newUsername.trim()) {
      setError("请填写用户名");
      return;
    }
    if (permissions.length === 0) {
      setError("权限字典未加载，当前无法创建用户并配置权限");
      return;
    }

    await createUser({
      username: newUsername.trim(),
      password: newPassword,
      permission_ids: Array.from(newPermissionIds),
      full_name: newFullName || null,
      phone: newPhone || null,
      email: newEmail || null,
    });

    setNewUsername("");
    setNewPassword("000000");
    setNewFullName("");
    setNewPhone("");
    setNewEmail("");
    setNewPermissionIds(new Set());
  }

  function openEdit(u: UserDTO) {
    if (!canManageUser) return;

    setEditingUser(u);
    setEditFullName(u.full_name || "");
    setEditPhone(u.phone || "");
    setEditEmail(u.email || "");

    const selected = new Set<number>();
    (u.permissions || []).forEach((name) => {
      const pid = permissionIdByName.get(name);
      if (pid != null) selected.add(pid);
    });
    setEditPermissionIds(selected);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    if (!canManageUser) return;

    await updateUser(editingUser.id, {
      full_name: editFullName || null,
      phone: editPhone || null,
      email: editEmail || null,
    });

    if (permissions.length > 0) {
      await setUserPermissions(editingUser.id, Array.from(editPermissionIds));
    }

    setEditingUser(null);
  }

  async function handleToggleActive(u: UserDTO) {
    if (!canManageUser) return;
    await updateUser(u.id, { is_active: !u.is_active });
  }

  async function handleResetPassword(u: UserDTO) {
    if (!canManageUser) return;
    if (!window.confirm(`确认将用户「${u.username}」密码重置为 000000？`)) {
      return;
    }
    await resetPassword(u.id);
    alert("密码已重置为 000000");
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
      {error && (
        <div className="border border-red-200 bg-red-50 text-red-600 px-3 py-2 rounded">
          {error}
        </div>
      )}

      {!canManageUser && (
        <div className="border border-slate-200 bg-slate-50 text-slate-600 px-3 py-2 rounded">
          当前为只读模式，不能创建、编辑、停用用户或重置密码。
        </div>
      )}

      {canManageUser && (
        <section className="bg-white border rounded-xl p-4 space-y-3">
          <h3 className="text-base font-semibold">创建用户</h3>

          <form className="grid grid-cols-1 md:grid-cols-3 gap-3" onSubmit={handleCreate}>
            <div>
              <label className="text-xs text-slate-600">登录名</label>
              <input
                className="border rounded px-3 py-2 w-full"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-slate-600">密码（默认 000000）</label>
              <input
                type="password"
                className="border rounded px-3 py-2 w-full"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

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

            <div className="md:col-span-3">
              <label className="text-xs text-slate-600 block mb-1">直配权限</label>
              <PermissionChecklist
                permissions={permissions}
                selected={newPermissionIds}
                onToggle={toggleNewPermission}
              />
            </div>

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
                <th className="px-3 py-2 text-left">权限</th>
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
                  <td className="px-3 py-2">
                    {u.permissions.length === 0 ? (
                      <span className="text-slate-400">-</span>
                    ) : (
                      u.permissions.map((name) => (
                        <span
                          key={name}
                          className="inline-block px-2 py-0.5 bg-slate-100 rounded text-xs mr-1 mb-1"
                        >
                          {name}
                        </span>
                      ))
                    )}
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
                      <button
                        className="px-2 py-1 border rounded hover:bg-slate-100 disabled:opacity-50"
                        disabled={mutating || !canManageUser}
                        onClick={() => openEdit(u)}
                      >
                        编辑
                      </button>

                      <button
                        className="px-2 py-1 border rounded hover:bg-slate-100 disabled:opacity-50"
                        disabled={mutating || !canManageUser}
                        onClick={() => handleToggleActive(u)}
                      >
                        {u.is_active ? "停用" : "启用"}
                      </button>

                      <button
                        className="px-2 py-1 border border-amber-400 text-amber-700 rounded hover:bg-amber-50 disabled:opacity-50"
                        disabled={mutating || !canManageUser}
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

      {editingUser && canManageUser && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[760px] shadow-xl space-y-4 max-h-[85vh] overflow-auto">
            <h3 className="text-lg font-semibold">编辑用户：{editingUser.username}</h3>

            <form className="space-y-4" onSubmit={handleSaveEdit}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600">姓名</label>
                  <input
                    className="border rounded px-3 py-2 w-full"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600">电话</label>
                  <input
                    className="border rounded px-3 py-2 w-full"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600">邮箱</label>
                  <input
                    className="border rounded px-3 py-2 w-full"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 block mb-1">直配权限</label>
                <PermissionChecklist
                  permissions={permissions}
                  selected={editPermissionIds}
                  onToggle={toggleEditPermission}
                />
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
