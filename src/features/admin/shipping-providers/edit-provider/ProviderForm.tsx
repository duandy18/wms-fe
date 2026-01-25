// src/features/admin/shipping-providers/edit-provider/ProviderForm.tsx
//
// 网点基础信息表单
// 语义说明：
// - 当前表单编辑对象为「快递网点」（参与某仓库区域运费比价的最小单元）
// - 字段命名保持兼容（editName / editCode），仅做 UI 语义升级
// - 不引入新的后端字段约束

import React from "react";
import { UI } from "../ui";

export type EditProviderFormState = {
  editName: string;
  editCode: string;
  editActive: boolean;
  editPriority: string;

  cName: string;
  cPhone: string;
  cEmail: string;
  cWechat: string;
  cRole: string;
  cPrimary: boolean;
};

export const ProviderForm: React.FC<{
  state: EditProviderFormState;
  busy: boolean;
  savingProvider: boolean;
  onChange: (patch: Partial<EditProviderFormState>) => void;
  onSaveProvider: () => void | Promise<void>;
}> = ({ state, busy, savingProvider, onChange, onSaveProvider }) => {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
      <div className="md:col-span-2">
        <label className={UI.label}>网点名称 *</label>
        <input
          className={UI.input}
          value={state.editName}
          disabled={busy}
          placeholder="例如：石家庄一部"
          onChange={(e) => onChange({ editName: e.target.value })}
        />
      </div>

      <div>
        <label className={UI.label}>网点编号</label>
        <input
          className={UI.inputMono}
          value={state.editCode}
          disabled={busy}
          placeholder="例如：STO-SJZ-01"
          onChange={(e) => onChange({ editCode: e.target.value })}
        />
      </div>

      <div>
        <label className={UI.label}>优先级</label>
        <input
          className={UI.inputMono}
          value={state.editPriority}
          disabled={busy}
          onChange={(e) => onChange({ editPriority: e.target.value })}
        />
      </div>

      <div className="flex items-end gap-3 md:col-span-4">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={state.editActive}
            disabled={busy}
            onChange={(e) => onChange({ editActive: e.target.checked })}
          />
          启用该网点
        </label>

        <button
          type="button"
          className={UI.btnPrimaryGreen}
          disabled={busy || savingProvider}
          onClick={() => void onSaveProvider()}
        >
          {savingProvider ? "保存中…" : "保存网点信息"}
        </button>
      </div>
    </div>
  );
};
