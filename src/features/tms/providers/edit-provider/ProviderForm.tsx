// src/features/tms/providers/edit-provider/ProviderForm.tsx
//
// 网点基础信息表单
// 语义说明：
// - 当前表单编辑对象为「快递网点本体」
// - code 为内部业务键：创建/编辑都可填写，但保持唯一与规范化
// - 仓库不属于本表单事实；仓库关系应走 warehouse_shipping_providers 绑定链路
// - company_code / resource_code 为电子面单固定接入参数，不承载店铺维度配置

import React from "react";
import { UI } from "../ui";

export type EditProviderFormState = {
  editName: string;
  editCode: string;
  editCompanyCode: string;
  editResourceCode: string;
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
        <label className={UI.label}>网点编号 *</label>
        <input
          className={UI.inputMono}
          value={state.editCode}
          disabled={busy}
          placeholder="例如：STO-SJZ-01"
          onChange={(e) => onChange({ editCode: e.target.value })}
        />
        <div className="mt-2 text-xs text-slate-500">编号会按系统规则自动去空格并转为大写，且必须全局唯一。</div>
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

      <div>
        <label className={UI.label}>公司码</label>
        <input
          className={UI.inputMono}
          value={state.editCompanyCode}
          disabled={busy}
          placeholder="电子面单公司码"
          onChange={(e) => onChange({ editCompanyCode: e.target.value })}
        />
      </div>

      <div>
        <label className={UI.label}>资源码</label>
        <input
          className={UI.inputMono}
          value={state.editResourceCode}
          disabled={busy}
          placeholder="电子面单资源码"
          onChange={(e) => onChange({ editResourceCode: e.target.value })}
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
