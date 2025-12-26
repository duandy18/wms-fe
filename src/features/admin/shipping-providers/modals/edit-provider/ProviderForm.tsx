// src/features/admin/shipping-providers/modals/edit-provider/ProviderForm.tsx
//
// 公司信息表单（交互控件集合）
// - 不持有 state，只用 props + onChange

import React from "react";
import { UI } from "../../ui";
import { MUI } from "./ui";

export type ProviderFormState = {
  editName: string;
  editCode: string;
  editActive: boolean;
  editPriority: string;
};

export const ProviderForm: React.FC<{
  disabled: boolean;
  saving: boolean;

  state: ProviderFormState;
  onChange: (patch: Partial<ProviderFormState>) => void;

  onSave: () => void | Promise<void>;
}> = ({ disabled, saving, state, onChange, onSave }) => {
  return (
    <div className={MUI.providerGrid}>
      <div className={MUI.providerNameCol}>
        <label className={UI.label}>公司名称 *</label>
        <input
          className={UI.input}
          value={state.editName}
          disabled={disabled}
          onChange={(e) => onChange({ editName: e.target.value })}
        />
      </div>

      <div>
        <label className={UI.label}>编码</label>
        <input
          className={UI.inputMono}
          value={state.editCode}
          disabled={disabled}
          onChange={(e) => onChange({ editCode: e.target.value })}
        />
      </div>

      <div>
        <label className={UI.label}>优先级</label>
        <input
          className={UI.inputMono}
          value={state.editPriority}
          disabled={disabled}
          onChange={(e) => onChange({ editPriority: e.target.value })}
        />
      </div>

      <div className={MUI.providerFooterRow}>
        <label className={MUI.checkboxRow}>
          <input
            type="checkbox"
            checked={state.editActive}
            disabled={disabled}
            onChange={(e) => onChange({ editActive: e.target.checked })}
          />
          启用
        </label>

        <button type="button" className={UI.btnPrimaryGreen} disabled={disabled || saving} onClick={() => void onSave()}>
          {saving ? "保存中…" : "保存公司信息"}
        </button>
      </div>
    </div>
  );
};

export default ProviderForm;
