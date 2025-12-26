// src/features/admin/users/panels/users-panel/useUsersPanelModel.ts
//
// UsersPanel 状态 / orchestration
// - 创建用户表单 state + handlers
// - 编辑用户弹窗 state + handlers
// - 依赖 presenter 完成实际 API mutate

import { useState } from "react";
import type { UsersPresenter } from "../../hooks/useUsersPresenter";
import type { RoleDTO, UserDTO } from "../../types";

export type UsersPanelModel = ReturnType<typeof useUsersPanelModel>;

export function useUsersPanelModel(args: {
  presenter: UsersPresenter;
  roles: RoleDTO[];
  canManageUser: boolean;
}) {
  const { presenter, roles, canManageUser } = args;
  const { createUser, updateUser, resetPassword, setError } = presenter;

  // ---------------------------
  // 创建用户字段
  // ---------------------------
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

    setNewUsername("");
    setNewPassword("000000");
    setNewPrimaryRoleId("");
    setNewExtraRoleIds(new Set());
    setNewFullName("");
    setNewPhone("");
    setNewEmail("");
  }

  // ---------------------------
  // 编辑用户字段
  // ---------------------------
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

    setEditPrimaryRoleId(u.role_id ? String(u.role_id) : "");

    const extra = new Set<string>();
    (u.extra_roles || []).forEach((rid: number) => extra.add(String(rid)));
    setEditExtraRoleIds(extra);
  }

  function closeEdit() {
    setEditingUser(null);
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
    if (!window.confirm(`确认将用户「${u.username}」密码重置为 000000？`)) return;
    await resetPassword(u.id);
    alert("密码已重置为 000000");
  }

  const createState = {
    newUsername,
    setNewUsername,
    newPassword,
    setNewPassword,
    newPrimaryRoleId,
    setNewPrimaryRoleId,
    newExtraRoleIds,
    toggleNewExtraRole,
    newFullName,
    setNewFullName,
    newPhone,
    setNewPhone,
    newEmail,
    setNewEmail,
    handleCreate,
  };

  const editState = {
    editingUser,
    openEdit,
    closeEdit,
    editFullName,
    setEditFullName,
    editPhone,
    setEditPhone,
    editEmail,
    setEditEmail,
    editPrimaryRoleId,
    setEditPrimaryRoleId,
    editExtraRoleIds,
    toggleEditExtraRole,
    handleSaveEdit,
  };

  return {
    roles,
    canManageUser,

    createState,
    editState,

    handleToggleActive,
    handleResetPassword,
  };
}

export default useUsersPanelModel;
