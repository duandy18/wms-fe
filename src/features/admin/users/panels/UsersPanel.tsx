// src/features/admin/users/panels/UsersPanel.tsx
//
// 用户管理面板（一级页面权限矩阵版）
// - 创建用户（默认不授予页面权限）
// - 编辑用户基础信息
// - 一级页面矩阵读写
// - 删除用户
// - 重置密码

import React, { useEffect, useState } from "react";
import { usePermissionRuntime } from "../../../../shared/runtime";
import type { UsersPresenter } from "../hooks/useUsersPresenter";
import type {
  PermissionMatrixPageDTO,
  PermissionMatrixPagesDTO,
  PermissionMatrixRowDTO,
  UserDTO,
} from "../types";

type Props = {
  presenter: UsersPresenter;
};

type MatrixDraftMap = Record<number, PermissionMatrixPagesDTO>;

function normalizePages(
  source: PermissionMatrixPagesDTO | undefined,
  pageDefs: PermissionMatrixPageDTO[],
): PermissionMatrixPagesDTO {
  const out: PermissionMatrixPagesDTO = {};

  pageDefs.forEach((page) => {
    const cell = source?.[page.page_code];
    out[page.page_code] = {
      read: Boolean(cell?.read),
      write: Boolean(cell?.write),
    };
  });

  return out;
}

function arePagesEqual(
  left: PermissionMatrixPagesDTO,
  right: PermissionMatrixPagesDTO,
  pageDefs: PermissionMatrixPageDTO[],
): boolean {
  return pageDefs.every((page) => {
    const leftCell = left[page.page_code];
    const rightCell = right[page.page_code];
    return (
      Boolean(leftCell?.read) === Boolean(rightCell?.read) &&
      Boolean(leftCell?.write) === Boolean(rightCell?.write)
    );
  });
}

function getCell(
  pages: PermissionMatrixPagesDTO | undefined,
  pageCode: string,
): { read: boolean; write: boolean } {
  const cell = pages?.[pageCode];
  return {
    read: Boolean(cell?.read),
    write: Boolean(cell?.write),
  };
}

export function UsersPanel({ presenter }: Props) {
  const { can } = usePermissionRuntime();

  const {
    matrixPages,
    matrixRows,
    userDetailsById,
    loading,
    creating,
    mutating,
    error,
    createUser,
    updateUser,
    saveUserPermissionMatrix,
    deleteUser,
    resetPassword,
    setError,
  } = presenter;

  const canReadAdmin = can("page.admin.read");
  const canManageUser = can("page.admin.write");

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("000000");
  const [newFullName, setNewFullName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const [editingUser, setEditingUser] = useState<UserDTO | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const [matrixDrafts, setMatrixDrafts] = useState<MatrixDraftMap>({});

  useEffect(() => {
    const next: MatrixDraftMap = {};
    matrixRows.forEach((row) => {
      next[row.user_id] = normalizePages(row.pages, matrixPages);
    });
    setMatrixDrafts(next);
  }, [matrixPages, matrixRows]);

  function openEdit(row: PermissionMatrixRowDTO) {
    if (!canManageUser) return;

    const detail = userDetailsById[row.user_id];

    setEditingUser({
      id: row.user_id,
      username: row.username,
      is_active: row.is_active,
      full_name: detail?.full_name ?? row.full_name ?? null,
      phone: detail?.phone ?? null,
      email: detail?.email ?? null,
      permissions: detail?.permissions ?? [],
    });
    setEditFullName(detail?.full_name ?? row.full_name ?? "");
    setEditPhone(detail?.phone ?? "");
    setEditEmail(detail?.email ?? "");
  }

  function toggleMatrixCell(
    userId: number,
    pageCode: string,
    field: "read" | "write",
  ) {
    if (!canManageUser) return;

    setMatrixDrafts((prev) => {
      const currentPages = normalizePages(prev[userId], matrixPages);
      const currentCell = getCell(currentPages, pageCode);

      if (field === "write") {
        const nextWrite = !currentCell.write;
        currentPages[pageCode] = {
          read: nextWrite ? true : currentCell.read,
          write: nextWrite,
        };
      } else {
        const nextRead = !currentCell.read;
        currentPages[pageCode] = {
          read: nextRead,
          write: nextRead ? currentCell.write : false,
        };
      }

      return {
        ...prev,
        [userId]: currentPages,
      };
    });
  }

  function isRowDirty(row: PermissionMatrixRowDTO): boolean {
    const draftPages = normalizePages(matrixDrafts[row.user_id], matrixPages);
    const originalPages = normalizePages(row.pages, matrixPages);
    return !arePagesEqual(draftPages, originalPages, matrixPages);
  }

  async function handleSaveMatrix(row: PermissionMatrixRowDTO) {
    if (!canManageUser) return;

    const draftPages = normalizePages(matrixDrafts[row.user_id], matrixPages);
    await saveUserPermissionMatrix(row.user_id, draftPages);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    if (!canManageUser) return;
    if (!newUsername.trim()) {
      setError("请填写用户名");
      return;
    }

    await createUser({
      username: newUsername.trim(),
      password: newPassword,
      full_name: newFullName || null,
      phone: newPhone || null,
      email: newEmail || null,
    });

    setNewUsername("");
    setNewPassword("000000");
    setNewFullName("");
    setNewPhone("");
    setNewEmail("");
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

    setEditingUser(null);
  }

  async function handleDeleteUser(row: PermissionMatrixRowDTO) {
    if (!canManageUser) return;
    if (!window.confirm(`确认删除用户「${row.username}」？删除后不可恢复。`)) {
      return;
    }
    await deleteUser(row.user_id);
  }

  async function handleResetPassword(row: PermissionMatrixRowDTO) {
    if (!canManageUser) return;
    if (!window.confirm(`确认将用户「${row.username}」密码重置为 000000？`)) {
      return;
    }
    await resetPassword(row.user_id);
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
          当前为只读模式，不能创建、编辑、删除用户、重置密码或保存权限。
        </div>
      )}

      {canManageUser && (
        <section className="bg-white border rounded-xl p-4 space-y-3">
          <h3 className="text-base font-semibold">创建用户</h3>
          <p className="text-xs text-slate-500">
            新用户默认不授予任何一级页面权限。创建成功后，请在下方矩阵中勾选页面读写权限。
          </p>

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
        ) : matrixRows.length === 0 ? (
          <div className="p-4 text-slate-500">暂无用户。</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-3 py-2 w-12 text-left">ID</th>
                  <th className="px-3 py-2 text-left">用户名</th>
                  <th className="px-3 py-2 text-left">姓名</th>
                  <th className="px-3 py-2 w-24 text-left">状态</th>
                  {matrixPages.map((page) => (
                    <th
                      key={page.page_code}
                      className="px-3 py-2 text-center min-w-[110px]"
                    >
                      <div className="font-medium">{page.page_name}</div>
                      <div className="text-[11px] text-slate-400">{page.page_code}</div>
                    </th>
                  ))}
                  <th className="px-3 py-2 text-left min-w-[220px]">操作</th>
                </tr>
              </thead>

              <tbody>
                {matrixRows.map((row) => (
                  <tr key={row.user_id} className="border-b hover:bg-slate-50 align-top">
                    <td className="px-3 py-2">{row.user_id}</td>
                    <td className="px-3 py-2">{row.username}</td>
                    <td className="px-3 py-2">{row.full_name || "-"}</td>
                    <td className="px-3 py-2">
                      {row.is_active ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs">
                          启用
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs">
                          停用
                        </span>
                      )}
                    </td>

                    {matrixPages.map((page) => {
                      const draftPages = normalizePages(matrixDrafts[row.user_id], matrixPages);
                      const cell = getCell(draftPages, page.page_code);

                      return (
                        <td
                          key={`${row.user_id}-${page.page_code}`}
                          className="px-3 py-2 text-xs text-center"
                        >
                          <div className="inline-flex flex-col items-start gap-1">
                            <label className="inline-flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={cell.read}
                                disabled={!canManageUser || mutating}
                                onChange={() =>
                                  toggleMatrixCell(row.user_id, page.page_code, "read")
                                }
                              />
                              <span>读</span>
                            </label>

                            <label className="inline-flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={cell.write}
                                disabled={!canManageUser || mutating}
                                onChange={() =>
                                  toggleMatrixCell(row.user_id, page.page_code, "write")
                                }
                              />
                              <span>写</span>
                            </label>
                          </div>
                        </td>
                      );
                    })}

                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2 text-xs">
                        <button
                          className="px-2 py-1 border rounded hover:bg-slate-100 disabled:opacity-50"
                          disabled={mutating || !canManageUser || !isRowDirty(row)}
                          onClick={() => handleSaveMatrix(row)}
                        >
                          保存
                        </button>

                        <button
                          className="px-2 py-1 border rounded hover:bg-slate-100 disabled:opacity-50"
                          disabled={mutating || !canManageUser}
                          onClick={() => openEdit(row)}
                        >
                          编辑资料
                        </button>

                        <button
                          className="px-2 py-1 border border-red-300 text-red-700 rounded hover:bg-red-50 disabled:opacity-50"
                          disabled={mutating || !canManageUser}
                          onClick={() => handleDeleteUser(row)}
                        >
                          删除
                        </button>

                        <button
                          className="px-2 py-1 border border-amber-400 text-amber-700 rounded hover:bg-amber-50 disabled:opacity-50"
                          disabled={mutating || !canManageUser}
                          onClick={() => handleResetPassword(row)}
                        >
                          重置密码
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editingUser && canManageUser && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[640px] shadow-xl space-y-4 max-h-[85vh] overflow-auto">
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

              <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                页面权限已改为在下方矩阵中维护，这里只编辑用户基础资料。
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
                  {mutating ? "保存中…" : "保存资料"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
