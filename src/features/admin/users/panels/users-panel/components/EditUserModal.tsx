// src/features/admin/users/panels/users-panel/components/EditUserModal.tsx

import React from "react";
import type { RoleDTO } from "../../../types";
import { UI } from "../ui";

export const EditUserModal: React.FC<{
  open: boolean;
  username: string;

  roles: RoleDTO[];
  mutating: boolean;

  editFullName: string;
  editPhone: string;
  editEmail: string;

  editPrimaryRoleId: string;
  editExtraRoleIds: Set<string>;

  onChangeFullName: (v: string) => void;
  onChangePhone: (v: string) => void;
  onChangeEmail: (v: string) => void;

  onChangePrimaryRoleId: (v: string) => void;
  onToggleExtraRole: (id: string) => void;

  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
}> = ({
  open,
  username,
  roles,
  mutating,
  editFullName,
  editPhone,
  editEmail,
  editPrimaryRoleId,
  editExtraRoleIds,
  onChangeFullName,
  onChangePhone,
  onChangeEmail,
  onChangePrimaryRoleId,
  onToggleExtraRole,
  onCancel,
  onSubmit,
}) => {
  if (!open) return null;

  return (
    <div className={UI.modalMask}>
      <div className={UI.modalCard}>
        <h3 className={UI.modalTitle}>编辑用户：{username}</h3>

        <form className={UI.modalForm} onSubmit={onSubmit}>
          <div className={UI.modalGrid}>
            <div>
              <label className={UI.label}>姓名</label>
              <input className={UI.input} value={editFullName} onChange={(e) => onChangeFullName(e.target.value)} />
            </div>

            <div>
              <label className={UI.label}>电话</label>
              <input className={UI.input} value={editPhone} onChange={(e) => onChangePhone(e.target.value)} />
            </div>

            <div>
              <label className={UI.label}>邮箱</label>
              <input className={UI.input} value={editEmail} onChange={(e) => onChangeEmail(e.target.value)} />
            </div>

            <div>
              <label className={UI.label}>主角色</label>
              <select className={UI.select} value={editPrimaryRoleId} onChange={(e) => onChangePrimaryRoleId(e.target.value)}>
                <option value="">不变</option>
                {roles.map((r) => (
                  <option key={r.id} value={String(r.id)}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={UI.label}>附加角色</label>
            <div className={UI.modalRolesWrap}>
              {roles.map((r) => (
                <label key={r.id} className={UI.roleCheck}>
                  <input type="checkbox" checked={editExtraRoleIds.has(String(r.id))} onChange={() => onToggleExtraRole(String(r.id))} />
                  <span>{r.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={UI.modalFooter}>
            <button type="button" className={UI.modalCancel} onClick={onCancel} disabled={mutating}>
              取消
            </button>

            <button type="submit" className={UI.modalSave} disabled={mutating}>
              {mutating ? "保存中…" : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
