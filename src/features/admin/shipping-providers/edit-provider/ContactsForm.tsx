// src/features/admin/shipping-providers/edit-provider/ContactsForm.tsx

import React from "react";
import type { EditProviderFormState } from "@/features/admin/shipping-providers/edit-provider/ProviderForm";
import { UI } from "@/features/admin/shipping-providers/ui";

function Row(props: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-20 shrink-0 text-sm text-slate-600 text-right">
        {props.label}
      </div>
      <div className="flex-1">{props.children}</div>
    </div>
  );
}

export const ContactsForm: React.FC<{
  state: EditProviderFormState;
  busy: boolean;
  savingContact: boolean;
  onChange: (patch: Partial<EditProviderFormState>) => void;
  onCreateContact: () => void | Promise<void>;
}> = ({ state, busy, savingContact, onChange, onCreateContact }) => {
  return (
    <div className="mt-3 space-y-3">
      <Row label="姓名 *">
        <input
          className={UI.input}
          value={state.cName}
          disabled={busy}
          onChange={(e) => onChange({ cName: e.target.value })}
          placeholder="联系人姓名"
        />
      </Row>

      <Row label="电话">
        <input
          className={UI.inputMono}
          value={state.cPhone}
          disabled={busy}
          onChange={(e) => onChange({ cPhone: e.target.value })}
          placeholder="手机号 / 座机"
        />
      </Row>

      <Row label="邮箱">
        <input
          className={UI.inputMono}
          value={state.cEmail}
          disabled={busy}
          onChange={(e) => onChange({ cEmail: e.target.value })}
          placeholder="example@company.com"
        />
      </Row>

      <Row label="微信">
        <input
          className={UI.inputMono}
          value={state.cWechat}
          disabled={busy}
          onChange={(e) => onChange({ cWechat: e.target.value })}
          placeholder="微信号"
        />
      </Row>

      <Row label="职位">
        <input
          className={UI.input}
          value={state.cRole}
          disabled={busy}
          onChange={(e) => onChange({ cRole: e.target.value })}
          placeholder="如：发货 / 对账 / 客服 / 售后"
        />
      </Row>

      <div className="flex items-center gap-4 pt-2">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={state.cPrimary}
            disabled={busy}
            onChange={(e) => onChange({ cPrimary: e.target.checked })}
          />
          设为主联系人
        </label>

        <button
          type="button"
          className={UI.btnPrimaryGreen}
          disabled={busy || savingContact}
          onClick={() => void onCreateContact()}
        >
          {savingContact ? "新增中…" : "新增联系人"}
        </button>
      </div>
    </div>
  );
};

export default ContactsForm;
