// src/features/admin/shipping-providers/modals/edit-provider/ContactCreateForm.tsx
//
// 新增联系人表单（交互控件集合）
// - 不持有 state，只用 props + onChange
// - 角色选项来自 roles.ts

import React from "react";
import { ROLE_OPTIONS } from "./roles";
import { MUI } from "./ui";

export type ContactCreateState = {
  cName: string;
  cPhone: string;
  cEmail: string;
  cWechat: string;
  cRole: string;
  cPrimary: boolean;
};

export const ContactCreateForm: React.FC<{
  disabled: boolean;
  saving: boolean;

  state: ContactCreateState;
  onChange: (patch: Partial<ContactCreateState>) => void;

  onCreate: () => void | Promise<void>;
}> = ({ disabled, saving, state, onChange, onCreate }) => {
  return (
    <div className={MUI.contactCreateGrid}>
      <div className={MUI.contactNameCol}>
        <label className={MUI.label}>姓名 *</label>
        <input className={MUI.input} value={state.cName} disabled={disabled} onChange={(e) => onChange({ cName: e.target.value })} />
      </div>

      <div>
        <label className={MUI.label}>电话</label>
        <input className={MUI.inputMono} value={state.cPhone} disabled={disabled} onChange={(e) => onChange({ cPhone: e.target.value })} />
      </div>

      <div>
        <label className={MUI.label}>邮箱</label>
        <input className={MUI.inputMono} value={state.cEmail} disabled={disabled} onChange={(e) => onChange({ cEmail: e.target.value })} />
      </div>

      <div>
        <label className={MUI.label}>微信</label>
        <input className={MUI.inputMono} value={state.cWechat} disabled={disabled} onChange={(e) => onChange({ cWechat: e.target.value })} />
      </div>

      <div>
        <label className={MUI.label}>角色</label>
        <select className={MUI.select} value={state.cRole} disabled={disabled} onChange={(e) => onChange({ cRole: e.target.value })}>
          {ROLE_OPTIONS.map((x) => (
            <option key={x.value} value={x.value}>
              {x.label}
            </option>
          ))}
        </select>
      </div>

      <div className={MUI.contactFooterRow}>
        <label className={MUI.checkboxRow}>
          <input type="checkbox" checked={state.cPrimary} disabled={disabled} onChange={(e) => onChange({ cPrimary: e.target.checked })} />
          设为主联系人
        </label>

        <button type="button" className={MUI.btnSuccessXs} disabled={disabled || saving} onClick={() => void onCreate()}>
          {saving ? "新增中…" : "新增联系人"}
        </button>
      </div>
    </div>
  );
};

export default ContactCreateForm;
