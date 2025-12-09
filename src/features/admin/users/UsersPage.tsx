// src/features/admin/users/UsersPage.tsx
import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../../lib/api";

type UserOut = {
  id: number;
  username: string;
  role_id: number;
};

type RoleOut = {
  id: string;
  name: string;
  description: string | null;
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserOut[]>([]);
  const [roles, setRoles] = useState<RoleOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRoleId, setNewRoleId] = useState<string>("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        apiGet<UserOut[]>("/users"),
        apiGet<RoleOut[]>("/roles"),
      ]);
      setUsers(usersRes);
      setRoles(rolesRes);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message ?? "加载用户列表失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newUsername || !newPassword || !newRoleId) {
      setError("请填写完整信息");
      return;
    }

    setCreating(true);
    setError(null);
    try {
      await apiPost("/users/register", {
        username: newUsername,
        password: newPassword,
        role_id: Number(newRoleId),
      });
      setNewUsername("");
      setNewPassword("");
      setNewRoleId("");
      await load();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message ?? "创建用户失败");
    } finally {
      setCreating(false);
    }
  }

  function roleNameOf(role_id: number): string {
    const r = roles.find((x) => Number(x.id) === role_id);
    return r?.name ?? `#${role_id}`;
  }

  // 简化：既然能进页面，就允许创建用户（权限控制交给后端）
  const canCreateUser = true;

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">用户管理</h1>
          <p className="mt-1 text-xs text-slate-600">
            管理系统用户与其主角色（primary_role_id），后续权限由角色控制。
          </p>
        </div>
      </header>

      {error && (
        <div className="rounded border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* 创建用户 */}
      {canCreateUser && (
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-800">创建用户</h2>
          <form
            className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3"
            onSubmit={handleCreate}
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">用户名</label>
              <input
                className="rounded-lg border px-3 py-2 text-sm"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="用户名（3-64 字符）"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">密码</label>
              <input
                type="password"
                className="rounded-lg border px-3 py-2 text-sm"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="密码（>=6）"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">角色</label>
              <select
                className="rounded-lg border px-3 py-2 text-sm"
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
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
              >
                {creating ? "创建中…" : "创建"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* 用户列表 */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="px-4 py-6 text-sm text-slate-600">加载中…</div>
        ) : users.length === 0 ? (
          <div className="px-4 py-6 text-sm text-slate-500">暂无用户。</div>
        ) : (
          <table className="min-w-full text-xs">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="w-16 px-3 py-2 text-left">ID</th>
                <th className="px-3 py-2 text-left">用户名</th>
                <th className="px-3 py-2 text-left">角色</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-3 py-2">{u.id}</td>
                  <td className="px-3 py-2">{u.username}</td>
                  <td className="px-3 py-2">{roleNameOf(u.role_id)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
