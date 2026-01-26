// src/features/admin/shipping-providers/pages/edit/ContactsSectionCard.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

  // ✅ 成功提示（与“保存网点信息”一致）
  const [localOk, setLocalOk] = useState<string | null>(null);
  const okTimerRef = useRef<number | null>(null);

  const clearOkTimer = useCallback(() => {
    if (okTimerRef.current != null) {
      window.clearTimeout(okTimerRef.current);
      okTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearOkTimer();
  }, [clearOkTimer]);

  // 输入变化后清掉“成功提示”（避免误导）
  useEffect(() => {
    if (!localOk) return;
    clearOkTimer();
    setLocalOk(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.name, draft.phone, draft.email, draft.wechat, draft.role, draft.is_primary, draft.active]);

  const hasPrimary = useMemo(() => {
    return contacts.some((c) => c.is_primary == true);
  }, [contacts]);

  // 体验优化：当目前没有主联系人时，新增默认“设为主联系人”
  useEffect(() => {
    if (!hasPrimary && !draft.is_primary) {
      onPatchDraft({ is_primary: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPrimary]);

  const nameTrimmed = (draft.name ?? "").trim();

  // 提交门槛（避免“点了才报错”的挫败感）
  const canSubmit = useMemo(() => {
    // 最小可用：姓名必填（你当前 UI 也标了 *）
    if (!nameTrimmed) return false;
    return true;
  }, [nameTrimmed]);

  const disabledReason = useMemo(() => {
    if (!canWrite) return "只读模式：无写权限";
    if (busy) return "当前繁忙：请稍后再试";
    return "";
  }, [busy, canWrite]);

  const submitLabel = savingContact ? "添加中…" : "添加联系人";

  const handleCreate = useCallback(async () => {
    if (disabled || savingContact) return;
    if (!canSubmit) return;

    // 触发成功提示前先清理
    clearOkTimer();
    setLocalOk(null);

    try {
      await onCreateContact();
      // 注意：失败时上层会设置 contactError；这里仅在 promise 完成后给成功提示
      // 若你后续希望“只有无错误才提示成功”，可以把 onCreateContact 改为返回 boolean。
      setLocalOk("已添加联系人");
      okTimerRef.current = window.setTimeout(() => {
        setLocalOk(null);
        okTimerRef.current = null;
      }, 2000);
    } catch {
      // 若上层抛错，这里不做成功提示（错误由 contactError 展示）
    }
  }, [canSubmit, clearOkTimer, disabled, onCreateContact, savingContact]);

  return (
    <section className={UI.card}>
      <div className={`${UI.h2} font-semibold text-slate-900`}>联系人</div>
      <div className="mt-2 text-sm text-slate-600">{!canWrite && <span className="text-slate-500">（只读）</span>}</div>

      {contactError && <div className={`mt-3 ${UI.error}`}>{contactError}</div>}
      {localOk && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {localOk}
        </div>
      )}

      {/* 空状态引导 */}
      {contacts.length === 0 && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          还没有联系人。建议先添加一位<strong>主联系人</strong>，便于异常时快速沟通。
        </div>
      )}

      {/* 输入区 */}
      <form
        className="mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          void handleCreate();
        }}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
          <div className="md:col-span-3">
            <label className={UI.label}>联系人姓名 *</label>
            <input
              className={UI.input}
              value={draft.name}
              disabled={disabled || savingContact}
              placeholder="例如：张三"
              onChange={(e) => onPatchDraft({ name: e.target.value })}
            />
          </div>

          <div className="md:col-span-3">
            <label className={UI.label}>电话</label>
            <input
              className={UI.inputMono}
              value={draft.phone}
              disabled={disabled || savingContact}
              placeholder="例如：13800000000"
              inputMode="tel"
              onChange={(e) => onPatchDraft({ phone: e.target.value })}
            />
          </div>

          <div className="md:col-span-6">
            <details className="rounded-lg border border-slate-200 px-3 py-2">
              <summary className="cursor-pointer select-none text-sm text-slate-700">更多信息（邮箱 / 微信 / 角色）</summary>

              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-6">
                <div className="md:col-span-2">
                  <label className={UI.label}>邮箱</label>
                  <input
                    className={UI.inputMono}
                    value={draft.email}
                    disabled={disabled || savingContact}
                    placeholder="例如：a@b.com"
                    onChange={(e) => onPatchDraft({ email: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={UI.label}>微信</label>
                  <input
                    className={UI.input}
                    value={draft.wechat}
                    disabled={disabled || savingContact}
                    placeholder="例如：wxid_xxx"
                    onChange={(e) => onPatchDraft({ wechat: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
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
              </div>
            </details>
          </div>

          <div className="md:col-span-6 flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={draft.is_primary}
                  disabled={disabled || savingContact}
                  onChange={(e) => onPatchDraft({ is_primary: e.target.checked })}
                />
                设为主联系人
                {!hasPrimary && <span className="text-xs text-slate-500">（当前无主联系人，已默认勾选）</span>}
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
              type="submit"
              className={UI.btnPrimary}
              disabled={disabled || savingContact || !canSubmit}
              title={disabledReason || (!canSubmit ? "请先填写联系人姓名" : "")}
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </form>

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
