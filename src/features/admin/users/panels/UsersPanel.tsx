// src/features/admin/users/panels/UsersPanel.tsx
//
// 【最终版】用户管理面板（多角色 RBAC 完整版）
// - 创建用户（主角色 + 多角色）
// - 编辑用户（基础信息 + 主/多角色）
// - 启用 / 停用
// - 重置密码
//

import React from "react";
import { useAuth } from "../../../../app/auth/useAuth";
import type { UsersPresenter } from "../hooks/useUsersPresenter";
import type { RoleDTO } from "../types";

import { UI } from "./users-panel/ui";
import { useUsersPanelModel } from "./users-panel/useUsersPanelModel";

import ErrorBanner from "./users-panel/components/ErrorBanner";
import CreateUserCard from "./users-panel/components/CreateUserCard";
import UsersTable from "./users-panel/components/UsersTable";
import EditUserModal from "./users-panel/components/EditUserModal";

type Props = {
  presenter: UsersPresenter;
  roles: RoleDTO[]; // 来自 UsersAdminPage，rolesPresenter.roles
};

export function UsersPanel({ presenter, roles }: Props) {
  const { can } = useAuth();

  const { users, loading, creating, mutating, error } = presenter;

  // 权限控制
  const canManageUser = can("system.user.manage");

  const vm = useUsersPanelModel({ presenter, roles, canManageUser });

  return (
    <div className={UI.page}>
      <h2 className={UI.h2}>用户管理</h2>

      <ErrorBanner error={error} />

      {/* 创建用户 */}
      {vm.canManageUser ? (
        <CreateUserCard
          roles={vm.roles}
          creating={creating}
          newUsername={vm.createState.newUsername}
          newPassword={vm.createState.newPassword}
          newPrimaryRoleId={vm.createState.newPrimaryRoleId}
          newExtraRoleIds={vm.createState.newExtraRoleIds}
          newFullName={vm.createState.newFullName}
          newPhone={vm.createState.newPhone}
          newEmail={vm.createState.newEmail}
          onChangeUsername={vm.createState.setNewUsername}
          onChangePassword={vm.createState.setNewPassword}
          onChangePrimaryRoleId={vm.createState.setNewPrimaryRoleId}
          onToggleExtraRole={vm.createState.toggleNewExtraRole}
          onChangeFullName={vm.createState.setNewFullName}
          onChangePhone={vm.createState.setNewPhone}
          onChangeEmail={vm.createState.setNewEmail}
          onSubmit={vm.createState.handleCreate}
        />
      ) : null}

      {/* 用户列表 */}
      <UsersTable
        users={users}
        roles={vm.roles}
        loading={loading}
        mutating={mutating}
        onEdit={vm.editState.openEdit}
        onToggleActive={vm.handleToggleActive}
        onResetPassword={vm.handleResetPassword}
      />

      {/* 编辑弹窗 */}
      <EditUserModal
        open={!!vm.editState.editingUser}
        username={vm.editState.editingUser?.username ?? ""}
        roles={vm.roles}
        mutating={mutating}
        editFullName={vm.editState.editFullName}
        editPhone={vm.editState.editPhone}
        editEmail={vm.editState.editEmail}
        editPrimaryRoleId={vm.editState.editPrimaryRoleId}
        editExtraRoleIds={vm.editState.editExtraRoleIds}
        onChangeFullName={vm.editState.setEditFullName}
        onChangePhone={vm.editState.setEditPhone}
        onChangeEmail={vm.editState.setEditEmail}
        onChangePrimaryRoleId={vm.editState.setEditPrimaryRoleId}
        onToggleExtraRole={vm.editState.toggleEditExtraRole}
        onCancel={vm.editState.closeEdit}
        onSubmit={vm.editState.handleSaveEdit}
      />
    </div>
  );
}
