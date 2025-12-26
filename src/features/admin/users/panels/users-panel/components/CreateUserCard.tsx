// src/features/admin/users/panels/users-panel/components/CreateUserCard.tsx

import React from "react";
import type { RoleDTO } from "../../../types";
import { UI } from "../ui";

export const CreateUserCard: React.FC<{
  roles: RoleDTO[];
  creating: boolean;

  newUsername: string;
  newPassword: string;
  newPrimaryRoleId: string;
  newExtraRoleIds: Set<string>;

  newFullName: string;
  newPhone: string;
  newEmail: string;

  onChangeUsername: (v: string) => void;
  onChangePassword: (v: string) => void;
  onChangePrimaryRoleId: (v: string) => void;
  onToggleExtraRole: (id: string) => void;

  onChangeFullName: (v: string) => void;
  onChangePhone: (v: string) => void;
  onChangeEmail: (v: string) => void;

  onSubmit: (e: React.FormEvent) => void | Promise<void>;
}> = ({
  roles,
  creating,
  newUsername,
  newPassword,
  newPrimaryRoleId,
  newExtraRoleIds,
  newFullName,
  newPhone,
  newEmail,
  onChangeUsername,
  onChangePassword,
  onChangePrimaryRoleId,
  onToggleExtraRole,
  onChangeFullName,
  onChangePhone,
  onChangeEmail,
  onSubmit,
}) => {
  return (
    <section className={UI.card}>
      <h3 className={UI.cardTitle}>创建用户</h3>

      <form className={UI.formGrid} onSubmit={onSubmit}>
        <div>
          <label className={UI.label}>登录名</label>
          <input className={UI.input} value={newUsername} onChange={(e) => onChangeUsername(e.target.value)} />
        </div>

        <div>
          <label className={UI.label}>密码（默认 000000）</label>
          <input type="password" className={UI.input} value={newPassword} onChange={(e) => onChangePassword(e.target.value)} />
        </div>

        <div>
          <label className={UI.label}>主角色</label>
          <select className={UI.select} value={newPrimaryRoleId} onChange={(e) => onChangePrimaryRoleId(e.target.value)}>
            <option value="">请选择主角色</option>
            {roles.map((r) => (
              <option key={r.id} value={String(r.id)}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className={UI.label}>附加角色</label>
          <div className={UI.roleWrap}>
            {roles.map((r) => (
              <label key={r.id} className={UI.roleCheck}>
                <input type="checkbox" checked={newExtraRoleIds.has(String(r.id))} onChange={() => onToggleExtraRole(String(r.id))} />
                <span>{r.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className={UI.label}>姓名</label>
          <input className={UI.input} value={newFullName} onChange={(e) => onChangeFullName(e.target.value)} />
        </div>

        <div>
          <label className={UI.label}>电话</label>
          <input className={UI.input} value={newPhone} onChange={(e) => onChangePhone(e.target.value)} />
        </div>

        <div>
          <label className={UI.label}>邮箱</label>
          <input className={UI.input} value={newEmail} onChange={(e) => onChangeEmail(e.target.value)} />
        </div>

        <div className={UI.btnRow}>
          <button type="submit" className={UI.btnPrimary} disabled={creating}>
            {creating ? "创建中…" : "创建用户"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreateUserCard;
