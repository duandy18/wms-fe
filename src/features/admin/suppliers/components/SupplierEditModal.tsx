// src/features/admin/suppliers/components/SupplierEditModal.tsx

import React from "react";
import type { SupplierContactRole } from "../api";
import { type ContactDraft } from "../suppliersHelpers";
import { validateContacts } from "../suppliersHelpers";
import type { SupplierEditDraft } from "../hooks/useSuppliersController";

export const SupplierEditModal: React.FC<{
  TITLE: string;
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

  editing: SupplierEditDraft;
  setEditing: (next: SupplierEditDraft) => void;

  editSaving: boolean;
  editError: string | null;

  onClose: () => void;
  onAddContact: () => void;
  onRemoveContact: (idx: number) => void;
  onSetPrimary: (idx: number) => void;
  onSetContact: (idx: number, patch: Partial<ContactDraft>) => void;
  onSubmit: (e: React.FormEvent) => void;
  setEditError: (v: string | null) => void;
}> = ({
  TITLE,
  H2,
  BODY,
  SUBCARD,
  INPUT,
  SELECT,
  BTN,
  BTN_PRIMARY,
  BTN_DANGER,
  ERROR_BOX,
  editing,
  setEditing,
  editSaving,
  editError,
  onClose,
  onAddContact,
  onRemoveContact,
  onSetPrimary,
  onSetContact,
  onSubmit,
  setEditError,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-8">
      <div className="w-full max-w-6xl rounded-2xl bg-white p-10 shadow-xl space-y-8">
        <div className="flex items-center justify-between gap-6">
          <div className={`${TITLE} font-semibold text-slate-900`}>
            编辑供应商（ID：<span className="font-mono">{editing.id}</span>）
          </div>
          <button type="button" onClick={onClose} className={BTN} disabled={editSaving}>
            关闭
          </button>
        </div>

        {editError && <div className={ERROR_BOX}>{editError}</div>}

        <form
          onSubmit={(e) => {
            setEditError(null);
            const contactErr = validateContacts(editing.contacts);
            if (contactErr) {
              e.preventDefault();
              setEditError(contactErr);
              return;
            }
            onSubmit(e);
          }}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex flex-col gap-3 md:col-span-2">
              <label className={`${BODY} text-slate-700`}>供应商名称 *</label>
              <input className={INPUT} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} disabled={editSaving} />
            </div>

            <div className="flex flex-col gap-3">
              <label className={`${BODY} text-slate-700`}>供应商编码（手动填写）*</label>
              <input className={`${INPUT} font-mono`} value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value })} disabled={editSaving} />
            </div>

            <div className="flex flex-col gap-3">
              <label className={`${BODY} text-slate-700`}>状态 *</label>
              <select className={SELECT} value={editing.active ? "1" : "0"} onChange={(e) => setEditing({ ...editing, active: e.target.value === "1" })} disabled={editSaving}>
                <option value="1">合作中</option>
                <option value="0">已停用</option>
              </select>
            </div>

            <div className="flex flex-col gap-3 md:col-span-4">
              <label className={`${BODY} text-slate-700`}>公司网址</label>
              <input className={INPUT} value={editing.website} onChange={(e) => setEditing({ ...editing, website: e.target.value })} disabled={editSaving} />
            </div>
          </div>

          <div className={`${SUBCARD} space-y-6`}>
            <div className="flex items-center justify-between">
              <div className={`${H2} font-semibold text-slate-900`}>联系人</div>
              <button type="button" className={BTN} onClick={onAddContact} disabled={editSaving}>
                + 添加联系人
              </button>
            </div>

            <div className="space-y-6">
              {editing.contacts.map((c, idx) => (
                <div key={idx} className="rounded-2xl bg-white border border-slate-200 p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className={`${BODY} text-slate-900`}>
                      联系人 #{idx + 1} {c.is_primary ? "（主联系人）" : ""}
                    </div>
                    <div className="flex items-center gap-4">
                      <button type="button" className={BTN} onClick={() => onSetPrimary(idx)} disabled={editSaving}>
                        设为主联系人
                      </button>
                      {editing.contacts.length > 1 && (
                        <button type="button" className={BTN_DANGER} onClick={() => onRemoveContact(idx)} disabled={editSaving}>
                          删除
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="flex flex-col gap-3 md:col-span-2">
                      <label className={`${BODY} text-slate-700`}>姓名 *</label>
                      <input className={INPUT} value={c.name} onChange={(e) => onSetContact(idx, { name: e.target.value })} disabled={editSaving} />
                    </div>

                    <div className="flex flex-col gap-3">
                      <label className={`${BODY} text-slate-700`}>角色</label>
                      <select className={SELECT} value={c.role} onChange={(e) => onSetContact(idx, { role: e.target.value as SupplierContactRole })} disabled={editSaving}>
                        <option value="purchase">采购</option>
                        <option value="billing">对账</option>
                        <option value="shipping">发货</option>
                        <option value="after_sales">售后</option>
                        <option value="other">其他</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-3">
                      <label className={`${BODY} text-slate-700`}>在职</label>
                      <select className={SELECT} value={c.active ? "1" : "0"} onChange={(e) => onSetContact(idx, { active: e.target.value === "1" })} disabled={editSaving}>
                        <option value="1">是</option>
                        <option value="0">否</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-3">
                      <label className={`${BODY} text-slate-700`}>电话</label>
                      <input className={`${INPUT} font-mono`} value={c.phone} onChange={(e) => onSetContact(idx, { phone: e.target.value })} disabled={editSaving} />
                    </div>

                    <div className="flex flex-col gap-3 md:col-span-2">
                      <label className={`${BODY} text-slate-700`}>邮箱</label>
                      <input className={INPUT} value={c.email} onChange={(e) => onSetContact(idx, { email: e.target.value })} disabled={editSaving} />
                    </div>

                    <div className="flex flex-col gap-3">
                      <label className={`${BODY} text-slate-700`}>微信</label>
                      <input className={INPUT} value={c.wechat} onChange={(e) => onSetContact(idx, { wechat: e.target.value })} disabled={editSaving} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={editSaving} className={BTN_PRIMARY}>
              {editSaving ? "保存中…" : "保存修改"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierEditModal;
