// src/features/admin/shipping-providers/edit-provider/ContactsForm.tsx

import React from "react";
import type { EditProviderFormState } from "./ProviderForm";
import { CONTACT_ROLE_OPTIONS } from "./contactRoles";

export const ContactsForm: React.FC<{
  state: EditProviderFormState;
  busy: boolean;
  savingContact: boolean;
  onChange: (patch: Partial<EditProviderFormState>) => void;
  onCreateContact: () => void | Promise<void>;
}> = ({ state, busy, savingContact, onChange, onCreateContact }) => {
  return (
    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-6">
      <div className="md:col-span-2">
        <label className="text-xs text-slate-600">姓名 *</label>
        <input
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          value={state.cName}
          disabled={busy}
          onChange={(e) => onChange({ cName: e.target.value })}
        />
      </div>

      <div>
        <label className="text-xs text-slate-600">电话</label>
        <input
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
          value={state.cPhone}
          disabled={busy}
          onChange={(e) => onChange({ cPhone: e.target.value })}
        />
      </div>

      <div>
        <label className="text-xs text-slate-600">邮箱</label>
        <input
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
          value={state.cEmail}
          disabled={busy}
          onChange={(e) => onChange({ cEmail: e.target.value })}
        />
      </div>

      <div>
        <label className="text-xs text-slate-600">微信</label>
        <input
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
          value={state.cWechat}
          disabled={busy}
          onChange={(e) => onChange({ cWechat: e.target.value })}
        />
      </div>

      <div>
        <label className="text-xs text-slate-600">角色</label>
        <select
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          value={state.cRole}
          disabled={busy}
          onChange={(e) => onChange({ cRole: e.target.value })}
        >
          {CONTACT_ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-end gap-2 md:col-span-6">
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
          className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
          disabled={busy || savingContact}
          onClick={() => void onCreateContact()}
        >
          {savingContact ? "新增中…" : "新增联系人"}
        </button>
      </div>
    </div>
  );
};
