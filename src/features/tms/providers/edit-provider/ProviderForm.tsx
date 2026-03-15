// src/features/tms/providers/edit-provider/ProviderForm.tsx
//
// 网点基础信息表单
// 语义说明：
// - 当前表单编辑对象为「快递网点本体」
// - code 为内部业务键：仅创建时填写，创建后只读
// - 仓库不属于本表单事实；仓库关系应走 warehouse_shipping_providers 绑定链路

import React from "react";
import { UI } from "../ui";

export type EditProviderFormState = {
  editName: string;
  editCode: string;
  editAddress: string;
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
  isCreate: boolean;
  savingProvider: boolean;
  onChange: (patch: Partial<EditProviderFormState>) => void;
  onSaveProvider: () => void | Promise<void>;
}> = ({ state, busy, isCreate, savingProvider, onChange, onSaveProvider }) => {
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
        <label className={UI.label}>{isCreate ? "网点编号 *" : "网点编号"}</label>
        <input
          className={UI.inputMono}
          value={state.editCode}
          disabled={busy || !isCreate}
          placeholder="例如：STO-SJZ-01"
          onChange={(e) => onChange({ editCode: e.target.value })}
        />
        {!isCreate ? <div className="mt-2 text-xs text-slate-500">编号为内部业务键，创建后不可修改。</div> : null}
      </div>

      <div>
        <label className={UI.label}>默认优先级</label>
        <input
          className={UI.inputMono}
          value={state.editPriority}
          disabled={busy}
          onChange={(e) => onChange({ editPriority: e.target.value })}
        />
      </div>

      <div className="md:col-span-4">
        <label className={UI.label}>网点地址</label>
        <textarea
          className={UI.input}
          value={state.editAddress}
          disabled={busy}
          placeholder="例如：河北省石家庄市长安区xxx路xxx号（用于揽收/交接）"
          rows={2}
          onChange={(e) => onChange({ editAddress: e.target.value })}
        />
      </div>

      <div className="flex items-end gap-3 md:col-span-4">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={state.editActive} disabled={busy} onChange={(e) => onChange({ editActive: e.target.checked })} />
          网点启用（参与比价/推荐）
        </label>

        <button
          type="button"
          className={UI.btnPrimaryGreen}
          disabled={busy || savingProvider}
          onClick={() => void onSaveProvider()}
          title={busy ? "当前不可保存：请检查权限/等待加载完成" : ""}
        >
          {savingProvider ? "保存中…" : "保存网点信息"}
        </button>
      </div>
    </div>
  );
};
