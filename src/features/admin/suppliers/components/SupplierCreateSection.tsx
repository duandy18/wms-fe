// src/features/admin/suppliers/components/SupplierCreateSection.tsx

import React from "react";
import type { SupplierContactRole } from "../api";
import { DEFAULT_CONTACT, setPrimaryInDraft, validateContacts, type ContactDraft } from "../suppliersHelpers";

export const SupplierCreateSection: React.FC<{
  // UI tokens
  H2: string;
  BODY: string;
  CARD: string;
  SUBCARD: string;
  INPUT: string;
  SELECT: string;
  BTN: string;
  BTN_PRIMARY: string;
  BTN_DANGER: string;
  ERROR_BOX: string;

  // state
  newName: string;
  setNewName: (v: string) => void;
  newCode: string;
  setNewCode: (v: string) => void;
  newWebsite: string;
  setNewWebsite: (v: string) => void;
  newActive: boolean;
  setNewActive: (v: boolean) => void;
  newContacts: ContactDraft[];
  setNewContacts: (fn: (prev: ContactDraft[]) => ContactDraft[]) => void;

  creating: boolean;
  createError: string | null;
  onSubmit: (e: React.FormEvent) => void;
}> = ({
  H2,
  BODY,
  CARD,
  SUBCARD,
  INPUT,
  SELECT,
  BTN,
  BTN_PRIMARY,
  BTN_DANGER,
  ERROR_BOX,
  newName,
  setNewName,
  newCode,
  setNewCode,
  newWebsite,
  setNewWebsite,
  newActive,
  setNewActive,
  newContacts,
  setNewContacts,
  creating,
  createError,
  onSubmit,
}) => {
  return (
    <section className={`${CARD} space-y-8`}>
      <div className={`${H2} font-semibold text-slate-900`}>创建供应商</div>

      {createError && <div className={ERROR_BOX}>{createError}</div>}

      <form
        onSubmit={(e) => {
          // 提前校验联系人（不代替 controller 硬校验）
          const contactErr = validateContacts(newContacts);
          if (contactErr) {
            e.preventDefault();
            return;
          }
          onSubmit(e);
        }}
        className="space-y-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex flex-col gap-3 md:col-span-2">
            <label className={`${BODY} text-slate-700`}>供应商名称 *</label>
            <input className={INPUT} value={newName} onChange={(e) => setNewName(e.target.value)} disabled={creating} />
          </div>

          <div className="flex flex-col gap-3">
            <label className={`${BODY} text-slate-700`}>供应商编码（手动填写）*</label>
            <input className={`${INPUT} font-mono`} value={newCode} onChange={(e) => setNewCode(e.target.value)} disabled={creating} />
          </div>

          <div className="flex flex-col gap-3">
            <label className={`${BODY} text-slate-700`}>状态 *</label>
            <select className={SELECT} value={newActive ? "1" : "0"} onChange={(e) => setNewActive(e.target.value === "1")} disabled={creating}>
              <option value="1">合作中</option>
              <option value="0">已停用</option>
            </select>
          </div>

          <div className="flex flex-col gap-3 md:col-span-4">
            <label className={`${BODY} text-slate-700`}>公司网址</label>
            <input className={INPUT} value={newWebsite} onChange={(e) => setNewWebsite(e.target.value)} placeholder="https://example.com" disabled={creating} />
          </div>
        </div>

        <div className={`${SUBCARD} space-y-6`}>
          <div className="flex items-center justify-between">
            <div className={`${H2} font-semibold text-slate-900`}>联系人</div>
            <button
              type="button"
              className={BTN}
              onClick={() => setNewContacts((prev) => [...prev, { ...DEFAULT_CONTACT, is_primary: false }])}
              disabled={creating}
            >
              + 添加联系人
            </button>
          </div>

          <div className="space-y-6">
            {newContacts.map((c, idx) => (
              <div key={idx} className="rounded-2xl bg-white border border-slate-200 p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className={`${BODY} text-slate-900`}>
                    联系人 #{idx + 1} {c.is_primary ? "（主联系人）" : ""}
                  </div>
                  <div className="flex items-center gap-4">
                    <button type="button" className={BTN} onClick={() => setNewContacts((prev) => setPrimaryInDraft(prev, idx))} disabled={creating}>
                      设为主联系人
                    </button>
                    {newContacts.length > 1 && (
                      <button
                        type="button"
                        className={BTN_DANGER}
                        onClick={() =>
                          setNewContacts((prev) => {
                            const next = prev.filter((_, i) => i !== idx);
                            return next.some((x) => x.is_primary) ? next : setPrimaryInDraft(next, 0);
                          })
                        }
                        disabled={creating}
                      >
                        删除
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="flex flex-col gap-3 md:col-span-2">
                    <label className={`${BODY} text-slate-700`}>姓名 *</label>
                    <input
                      className={INPUT}
                      value={c.name}
                      onChange={(e) => setNewContacts((prev) => prev.map((x, i) => (i === idx ? { ...x, name: e.target.value } : x)))}
                      disabled={creating}
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className={`${BODY} text-slate-700`}>角色</label>
                    <select
                      className={SELECT}
                      value={c.role}
                      onChange={(e) =>
                        setNewContacts((prev) => prev.map((x, i) => (i === idx ? { ...x, role: e.target.value as SupplierContactRole } : x)))
                      }
                      disabled={creating}
                    >
                      <option value="purchase">采购</option>
                      <option value="billing">对账</option>
                      <option value="shipping">发货</option>
                      <option value="after_sales">售后</option>
                      <option value="other">其他</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className={`${BODY} text-slate-700`}>在职</label>
                    <select
                      className={SELECT}
                      value={c.active ? "1" : "0"}
                      onChange={(e) => setNewContacts((prev) => prev.map((x, i) => (i === idx ? { ...x, active: e.target.value === "1" } : x)))}
                      disabled={creating}
                    >
                      <option value="1">是</option>
                      <option value="0">否</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className={`${BODY} text-slate-700`}>电话</label>
                    <input
                      className={`${INPUT} font-mono`}
                      value={c.phone}
                      onChange={(e) => setNewContacts((prev) => prev.map((x, i) => (i === idx ? { ...x, phone: e.target.value } : x)))}
                      disabled={creating}
                    />
                  </div>

                  <div className="flex flex-col gap-3 md:col-span-2">
                    <label className={`${BODY} text-slate-700`}>邮箱</label>
                    <input
                      className={INPUT}
                      value={c.email}
                      onChange={(e) => setNewContacts((prev) => prev.map((x, i) => (i === idx ? { ...x, email: e.target.value } : x)))}
                      disabled={creating}
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className={`${BODY} text-slate-700`}>微信</label>
                    <input
                      className={INPUT}
                      value={c.wechat}
                      onChange={(e) => setNewContacts((prev) => prev.map((x, i) => (i === idx ? { ...x, wechat: e.target.value } : x)))}
                      disabled={creating}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={creating} className={BTN_PRIMARY}>
            {creating ? "创建中…" : "创建供应商"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default SupplierCreateSection;
