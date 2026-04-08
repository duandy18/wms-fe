// src/features/admin/users/panels/UsersPanel.tsx
//
// 用户管理面板（一级页面权限矩阵版）
// - 创建用户（默认不授予页面权限）
// - 编辑用户基础信息
// - 一级页面矩阵读写
// - 删除用户
// - 重置密码
// - 前端易用性补强：
//   * sticky 表头 / sticky 首列
//   * 用户搜索 / 状态筛选
//   * 行级脏状态提示
//   * 行级保存中 / 成功 / 失败反馈
//   * 当前登录用户保护提示更明显

import { useEffect, useMemo, useState } from "react";
import {
  usePermissionRuntime,
  useSessionRuntime,
} from "../../../../shared/runtime";
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
type RowFeedbackTone = "success" | "error" | "info";
type RowFeedback = {
  tone: RowFeedbackTone;
  text: string;
};

const STICKY_WIDTHS = {
  id: 72,
  username: 180,
  fullName: 180,
  status: 96,
} as const;

const STICKY_LEFT = {
  id: 0,
  username: STICKY_WIDTHS.id,
  fullName: STICKY_WIDTHS.id + STICKY_WIDTHS.username,
  status: STICKY_WIDTHS.id + STICKY_WIDTHS.username + STICKY_WIDTHS.fullName,
} as const;

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

function getFeedbackClassName(tone: RowFeedbackTone): string {
  if (tone === "success") {
    return "text-emerald-700 bg-emerald-50 border border-emerald-200";
  }
  if (tone === "error") {
    return "text-red-700 bg-red-50 border border-red-200";
  }
  return "text-sky-700 bg-sky-50 border border-sky-200";
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

export function UsersPanel({ presenter }: Props) {
  const { can } = usePermissionRuntime();
  const { user } = useSessionRuntime();

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
  const currentUsername = user?.username ?? null;

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
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const [rowFeedbacks, setRowFeedbacks] = useState<Record<number, RowFeedback>>({});
  const [rowBusyState, setRowBusyState] = useState<{
    userId: number;
    text: string;
  } | null>(null);

  const rowById = useMemo(() => {
    const out: Record<number, PermissionMatrixRowDTO> = {};
    matrixRows.forEach((row) => {
      out[row.user_id] = row;
    });
    return out;
  }, [matrixRows]);

  const filteredRows = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return matrixRows.filter((row) => {
      if (statusFilter === "active" && !row.is_active) return false;
      if (statusFilter === "inactive" && row.is_active) return false;

      if (!keyword) return true;

      const detail = userDetailsById[row.user_id];
      const haystack = [
        row.username,
        row.full_name ?? "",
        detail?.full_name ?? "",
        detail?.phone ?? "",
        detail?.email ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [matrixRows, searchKeyword, statusFilter, userDetailsById]);

  useEffect(() => {
    const next: MatrixDraftMap = {};
    matrixRows.forEach((row) => {
      next[row.user_id] = normalizePages(row.pages, matrixPages);
    });
    setMatrixDrafts(next);
  }, [matrixPages, matrixRows]);

  function isCurrentUserRow(row: PermissionMatrixRowDTO): boolean {
    return Boolean(currentUsername) && row.username === currentUsername;
  }

  function setRowFeedback(userId: number, feedback: RowFeedback | null) {
    setRowFeedbacks((prev) => {
      const next = { ...prev };
      if (feedback) {
        next[userId] = feedback;
      } else {
        delete next[userId];
      }
      return next;
    });
  }

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

    const row = rowById[userId];

    setMatrixDrafts((prev) => {
      const currentPages = normalizePages(prev[userId], matrixPages);
      const currentCell = getCell(currentPages, pageCode);

      if (
        row &&
        isCurrentUserRow(row) &&
        pageCode === "admin" &&
        ((field === "write" && currentCell.write) ||
          (field === "read" && currentCell.read))
      ) {
        setRowFeedback(userId, {
          tone: "error",
          text: "当前登录用户自己的系统管理写权限不能在前端取消。",
        });
        return prev;
      }

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

      setRowFeedback(userId, null);

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
    const originalAdminCell = getCell(normalizePages(row.pages, matrixPages), "admin");
    const draftAdminCell = getCell(draftPages, "admin");

    if (
      isCurrentUserRow(row) &&
      originalAdminCell.write &&
      !draftAdminCell.write
    ) {
      setRowFeedback(row.user_id, {
        tone: "error",
        text: "当前登录用户自己的系统管理写权限不能取消。",
      });
      return;
    }

    setRowBusyState({ userId: row.user_id, text: "保存中…" });
    setRowFeedback(row.user_id, null);

    try {
      await saveUserPermissionMatrix(row.user_id, draftPages);
      setRowFeedback(row.user_id, {
        tone: "success",
        text: "权限已保存",
      });
    } catch (err) {
      setRowFeedback(row.user_id, {
        tone: "error",
        text: getErrorMessage(err, "保存用户权限失败"),
      });
    } finally {
      setRowBusyState(null);
    }
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

    try {
      await updateUser(editingUser.id, {
        full_name: editFullName || null,
        phone: editPhone || null,
        email: editEmail || null,
      });

      setRowFeedback(editingUser.id, {
        tone: "success",
        text: "资料已保存",
      });
      setEditingUser(null);
    } catch {
      // presenter 已负责设置全局 error，这里不重复抛出
    }
  }

  async function handleToggleActive(row: PermissionMatrixRowDTO) {
    if (!canManageUser) return;

    const nextActive = !row.is_active;
    const actionText = nextActive ? "启用" : "停用";

    if (!window.confirm(`确认${actionText}用户「${row.username}」？`)) {
      return;
    }

    setRowBusyState({ userId: row.user_id, text: `${actionText}中…` });
    setRowFeedback(row.user_id, null);

    try {
      await updateUser(row.user_id, { is_active: nextActive });
      setRowFeedback(row.user_id, {
        tone: "success",
        text: nextActive ? "用户已启用" : "用户已停用",
      });
    } catch (err) {
      setRowFeedback(row.user_id, {
        tone: "error",
        text: getErrorMessage(err, `${actionText}用户失败`),
      });
    } finally {
      setRowBusyState(null);
    }
  }

  async function handleDeleteUser(row: PermissionMatrixRowDTO) {
    if (!canManageUser) return;

    if (isCurrentUserRow(row)) {
      setRowFeedback(row.user_id, {
        tone: "error",
        text: "当前登录用户不能删除自己。",
      });
      return;
    }

    if (!window.confirm(`确认删除用户「${row.username}」？删除后不可恢复。`)) {
      return;
    }

    setRowBusyState({ userId: row.user_id, text: "删除中…" });
    setRowFeedback(row.user_id, null);

    try {
      await deleteUser(row.user_id);
    } catch (err) {
      setRowFeedback(row.user_id, {
        tone: "error",
        text: getErrorMessage(err, "删除用户失败"),
      });
    } finally {
      setRowBusyState(null);
    }
  }

  async function handleResetPassword(row: PermissionMatrixRowDTO) {
    if (!canManageUser) return;
    if (!window.confirm(`确认将用户「${row.username}」密码重置为 000000？`)) {
      return;
    }

    setRowBusyState({ userId: row.user_id, text: "重置中…" });
    setRowFeedback(row.user_id, null);

    try {
      await resetPassword(row.user_id);
      setRowFeedback(row.user_id, {
        tone: "success",
        text: "密码已重置为 000000",
      });
    } catch (err) {
      setRowFeedback(row.user_id, {
        tone: "error",
        text: getErrorMessage(err, "重置密码失败"),
      });
    } finally {
      setRowBusyState(null);
    }
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
          当前为只读模式，不能创建、编辑、停用、删除用户、重置密码或保存权限。
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
        <div className="border-b bg-slate-50 px-4 py-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-semibold">用户矩阵</h3>
            <p className="text-xs text-slate-500">
              当前按一级页面授权。写权限会自动包含读权限。
            </p>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-end">
            <div>
              <label className="block text-xs text-slate-600 mb-1">搜索用户</label>
              <input
                className="border rounded px-3 py-2 w-64"
                placeholder="用户名 / 姓名 / 电话 / 邮箱"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs text-slate-600 mb-1">状态筛选</label>
              <select
                className="border rounded px-3 py-2 w-36"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "all" | "active" | "inactive")
                }
              >
                <option value="all">全部</option>
                <option value="active">仅启用</option>
                <option value="inactive">仅停用</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-4">加载中…</div>
        ) : filteredRows.length === 0 ? (
          <div className="p-4 text-slate-500">暂无符合条件的用户。</div>
        ) : (
          <div className="overflow-auto max-h-[72vh]">
            <table className="min-w-max text-sm border-separate border-spacing-0">
              <thead>
                <tr>
                  <th
                    className="px-3 py-2 text-left border-b border-r bg-slate-50 sticky top-0 z-40"
                    style={{
                      left: STICKY_LEFT.id,
                      minWidth: STICKY_WIDTHS.id,
                      width: STICKY_WIDTHS.id,
                    }}
                  >
                    ID
                  </th>
                  <th
                    className="px-3 py-2 text-left border-b border-r bg-slate-50 sticky top-0 z-40"
                    style={{
                      left: STICKY_LEFT.username,
                      minWidth: STICKY_WIDTHS.username,
                      width: STICKY_WIDTHS.username,
                    }}
                  >
                    用户名
                  </th>
                  <th
                    className="px-3 py-2 text-left border-b border-r bg-slate-50 sticky top-0 z-40"
                    style={{
                      left: STICKY_LEFT.fullName,
                      minWidth: STICKY_WIDTHS.fullName,
                      width: STICKY_WIDTHS.fullName,
                    }}
                  >
                    姓名
                  </th>
                  <th
                    className="px-3 py-2 text-left border-b border-r bg-slate-50 sticky top-0 z-40"
                    style={{
                      left: STICKY_LEFT.status,
                      minWidth: STICKY_WIDTHS.status,
                      width: STICKY_WIDTHS.status,
                    }}
                  >
                    状态
                  </th>

                  {matrixPages.map((page) => (
                    <th
                      key={page.page_code}
                      className="px-3 py-2 text-center min-w-[110px] border-b bg-slate-50 sticky top-0 z-30"
                    >
                      <div className="font-medium">{page.page_name}</div>
                      <div className="text-[11px] text-slate-400">{page.page_code}</div>
                    </th>
                  ))}

                  <th className="px-3 py-2 text-left min-w-[320px] border-b bg-slate-50 sticky top-0 z-30">
                    操作
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((row) => {
                  const detail = userDetailsById[row.user_id];
                  const draftPages = normalizePages(matrixDrafts[row.user_id], matrixPages);
                  const dirty = isRowDirty(row);
                  const feedback = rowFeedbacks[row.user_id];
                  const rowBusy = rowBusyState?.userId === row.user_id;
                  const currentUserRow = isCurrentUserRow(row);

                  return (
                    <tr
                      key={row.user_id}
                      className={`group hover:bg-slate-50 align-top ${
                        currentUserRow ? "bg-amber-50/40" : ""
                      }`}
                    >
                      <td
                        className="px-3 py-2 border-b border-r sticky z-20 bg-white group-hover:bg-slate-50"
                        style={{
                          left: STICKY_LEFT.id,
                          minWidth: STICKY_WIDTHS.id,
                          width: STICKY_WIDTHS.id,
                        }}
                      >
                        {row.user_id}
                      </td>

                      <td
                        className="px-3 py-2 border-b border-r sticky z-20 bg-white group-hover:bg-slate-50"
                        style={{
                          left: STICKY_LEFT.username,
                          minWidth: STICKY_WIDTHS.username,
                          width: STICKY_WIDTHS.username,
                        }}
                      >
                        <div className="space-y-1">
                          <div>{row.username}</div>
                          {currentUserRow && (
                            <span className="inline-flex px-2 py-0.5 rounded text-[11px] bg-amber-100 text-amber-800">
                              当前登录用户
                            </span>
                          )}
                        </div>
                      </td>

                      <td
                        className="px-3 py-2 border-b border-r sticky z-20 bg-white group-hover:bg-slate-50"
                        style={{
                          left: STICKY_LEFT.fullName,
                          minWidth: STICKY_WIDTHS.fullName,
                          width: STICKY_WIDTHS.fullName,
                        }}
                      >
                        <div className="space-y-1">
                          <div>{row.full_name || detail?.full_name || "-"}</div>
                          {(detail?.phone || detail?.email) && (
                            <div className="text-[11px] text-slate-500">
                              {detail?.phone || "-"} / {detail?.email || "-"}
                            </div>
                          )}
                        </div>
                      </td>

                      <td
                        className="px-3 py-2 border-b border-r sticky z-20 bg-white group-hover:bg-slate-50"
                        style={{
                          left: STICKY_LEFT.status,
                          minWidth: STICKY_WIDTHS.status,
                          width: STICKY_WIDTHS.status,
                        }}
                      >
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
                        const cell = getCell(draftPages, page.page_code);

                        return (
                          <td
                            key={`${row.user_id}-${page.page_code}`}
                            className="px-3 py-2 text-xs text-center border-b"
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

                      <td className="px-3 py-2 border-b">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2 text-xs">
                            <button
                              className="px-2 py-1 border rounded hover:bg-slate-100 disabled:opacity-50"
                              disabled={mutating || !canManageUser || !dirty}
                              onClick={() => handleSaveMatrix(row)}
                            >
                              保存权限
                            </button>

                            <button
                              className="px-2 py-1 border rounded hover:bg-slate-100 disabled:opacity-50"
                              disabled={mutating || !canManageUser}
                              onClick={() => openEdit(row)}
                            >
                              编辑资料
                            </button>

                            <button
                              className="px-2 py-1 border rounded hover:bg-slate-100 disabled:opacity-50"
                              disabled={mutating || !canManageUser}
                              onClick={() => handleToggleActive(row)}
                            >
                              {row.is_active ? "停用用户" : "启用用户"}
                            </button>

                            <button
                              className="px-2 py-1 border border-red-300 text-red-700 rounded hover:bg-red-50 disabled:opacity-50"
                              disabled={mutating || !canManageUser || currentUserRow}
                              onClick={() => handleDeleteUser(row)}
                              title={currentUserRow ? "当前登录用户不能删除自己" : undefined}
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

                          <div className="flex flex-wrap gap-2 items-center">
                            {dirty && (
                              <span className="inline-flex px-2 py-0.5 rounded text-[11px] bg-amber-50 text-amber-700 border border-amber-200">
                                本行有未保存修改
                              </span>
                            )}

                            {currentUserRow && (
                              <span className="inline-flex px-2 py-0.5 rounded text-[11px] bg-sky-50 text-sky-700 border border-sky-200">
                                当前登录用户自己的系统管理写权限受保护
                              </span>
                            )}

                            {rowBusy && rowBusyState?.text && (
                              <span className="inline-flex px-2 py-0.5 rounded text-[11px] bg-sky-50 text-sky-700 border border-sky-200">
                                {rowBusyState.text}
                              </span>
                            )}

                            {!rowBusy && feedback && (
                              <span
                                className={`inline-flex px-2 py-0.5 rounded text-[11px] ${getFeedbackClassName(
                                  feedback.tone,
                                )}`}
                              >
                                {feedback.text}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
