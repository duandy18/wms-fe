// src/features/admin/shipping-providers/pages/edit/ContactsSectionCard.tsx
import React from "react";
import { UI } from "../../ui";
import { ContactsTable } from "../../edit-provider/ContactsTable";
import type { ShippingProviderContact } from "../../api/types";
import type { CreateContactDraft } from "./useShippingProviderEditModel";

export const ContactsSectionCard: React.FC<{
  canWrite: boolean;
  busy: boolean;

  contacts: ShippingProviderContact[];

  draft: CreateContactDraft;
  onPatchDraft: (p: Partial<CreateContactDraft>) => void;
  savingContact: boolean;
  contactError: string | null;

  onCreateContact: () => void | Promise<void>;
  onSetPrimary: (contactId: number) => void | Promise<void>;
  onToggleContactActive: (c: ShippingProviderContact) => void | Promise<void>;
  onRemoveContact: (contactId: number) => void | Promise<void>;
}> = ({
  canWrite,
  busy,
  contacts,
  draft,
  onPatchDraft,
  savingContact,
  contactError,
  onCreateContact,
  onSetPrimary,
  onToggleContactActive,
  onRemoveContact,
}) => {
  const disabled = busy || !canWrite;

  return (
    <section className={UI.card}>
      <div className={`${UI.h2} font-semibold text-slate-900`}>联系人</div>
      <div className="mt-2 text-sm text-slate-600">用于网点对接、异常处理与合作沟通。</div>

      {contactError && <div className={`mt-3 ${UI.error}`}>{contactError}</div>}

      {/* 输入区：按你截图的“输入框一行 + 新增按钮” */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-6">
        <div className="md:col-span-2">
          <label className={UI.label}>联系人姓名 *</label>
          <input
            className={UI.input}
            value={draft.name}
            disabled={disabled || savingContact}
            placeholder="例如：张三"
            onChange={(e) => onPatchDraft({ name: e.target.value })}
          />
        </div>

        <div>
          <label className={UI.label}>电话</label>
          <input
            className={UI.inputMono}
            value={draft.phone}
            disabled={disabled || savingContact}
            placeholder="例如：13800000000"
            onChange={(e) => onPatchDraft({ phone: e.target.value })}
          />
        </div>

        <div>
          <label className={UI.label}>邮箱</label>
          <input
            className={UI.inputMono}
            value={draft.email}
            disabled={disabled || savingContact}
            placeholder="例如：a@b.com"
            onChange={(e) => onPatchDraft({ email: e.target.value })}
          />
        </div>

        <div>
          <label className={UI.label}>微信</label>
          <input
            className={UI.input}
            value={draft.wechat}
            disabled={disabled || savingContact}
            placeholder="例如：wxid_xxx"
            onChange={(e) => onPatchDraft({ wechat: e.target.value })}
          />
        </div>

        <div>
          <label className={UI.label}>角色</label>
          <select
            className={UI.select}
            value={draft.role}
            disabled={disabled || savingContact}
            onChange={(e) => onPatchDraft({ role: e.target.value })}
          >
            <option value="OP">揽收/出库对接</option>
            <option value="SHIP">发货</option>
            <option value="FIN">财务</option>
            <option value="CS">客服</option>
            <option value="OTHER">其他</option>
          </select>
        </div>

        <div className="md:col-span-6 flex items-end justify-between gap-3">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={draft.is_primary}
                disabled={disabled || savingContact}
                onChange={(e) => onPatchDraft({ is_primary: e.target.checked })}
              />
              设为主联系人
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={draft.active}
                disabled={disabled || savingContact}
                onChange={(e) => onPatchDraft({ active: e.target.checked })}
              />
              启用
            </label>
          </div>

          <button
            type="button"
            className={UI.btnPrimary}
            disabled={disabled || savingContact}
            onClick={() => void onCreateContact()}
            title={!canWrite ? "只读模式：无写权限" : ""}
          >
            {savingContact ? "新增中…" : "新增联系人"}
          </button>
        </div>
      </div>

      <ContactsTable
        contacts={contacts}
        busy={disabled}
        savingContact={savingContact}
        onSetPrimary={onSetPrimary}
        onToggleContactActive={onToggleContactActive}
        onRemoveContact={onRemoveContact}
      />
    </section>
  );
};
