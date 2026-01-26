// src/features/admin/shipping-providers/edit-provider/ContactsTable.tsx

import React, { useMemo } from "react";
import type { ShippingProviderContact } from "../api";
import { roleLabel } from "./contactRoles";

function renderText(v: string | null | undefined): string {
  return v && v.trim() ? v : "—";
}

function maskPhone(phone: string | null | undefined): string {
  const p = (phone ?? "").trim();
  if (!p) return "—";
  if (p.length <= 7) return p;
  // 简单脱敏：138****0000
  return `${p.slice(0, 3)}****${p.slice(-4)}`;
}

function sortContacts(a: ShippingProviderContact, b: ShippingProviderContact): number {
  // 主联系人优先
  const ap = a.is_primary ? 1 : 0;
  const bp = b.is_primary ? 1 : 0;
  if (ap !== bp) return bp - ap;

  // 启用优先
  const aa = a.active ? 1 : 0;
  const ba = b.active ? 1 : 0;
  if (aa !== ba) return ba - aa;

  // 最近优先（用 id 倒序做稳定近似）
  return b.id - a.id;
}

export const ContactsTable: React.FC<{
  contacts: ShippingProviderContact[];
  busy: boolean;
  savingContact: boolean;
  onSetPrimary: (contactId: number) => void | Promise<void>;
  onToggleContactActive: (c: ShippingProviderContact) => void | Promise<void>;
  onRemoveContact: (contactId: number) => void | Promise<void>;
}> = ({ contacts, busy, savingContact, onSetPrimary, onToggleContactActive, onRemoveContact }) => {
  const rows = useMemo(() => {
    return [...contacts].sort(sortContacts);
  }, [contacts]);

  const disabled = busy || savingContact;

  return (
    <div className="mt-4 overflow-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50">
          <tr className="border-b">
            <th className="px-3 py-2 text-left">姓名</th>
            <th className="px-3 py-2 text-left">电话</th>
            <th className="px-3 py-2 text-left">邮箱</th>
            <th className="px-3 py-2 text-left">角色</th>
            <th className="px-3 py-2 text-left">主</th>
            <th className="px-3 py-2 text-left">启用</th>
            <th className="px-3 py-2 text-right">操作</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((c) => {
            const primaryCell = c.is_primary ? (
              <span className="inline-flex items-center rounded-full bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white">
                主联系人
              </span>
            ) : (
              <span className="text-slate-500">—</span>
            );

            const canSetPrimary = !c.is_primary;

            return (
              <tr key={c.id} className="border-b">
                <td className="px-3 py-2">{renderText(c.name)}</td>
                <td className="px-3 py-2 font-mono">{maskPhone(c.phone ?? null)}</td>
                <td className="px-3 py-2 font-mono">{renderText(c.email ?? null)}</td>
                <td className="px-3 py-2">{roleLabel(c.role ?? null)}</td>
                <td className="px-3 py-2">{primaryCell}</td>
                <td className="px-3 py-2">{c.active ? "是" : "否"}</td>

                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    {canSetPrimary ? (
                      <button
                        type="button"
                        className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        disabled={disabled}
                        onClick={() => void onSetPrimary(c.id)}
                        title="设为主联系人"
                      >
                        设为主
                      </button>
                    ) : null}

                    <button
                      type="button"
                      className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      disabled={disabled}
                      onClick={() => void onToggleContactActive(c)}
                      title={c.active ? "停用该联系人" : "启用该联系人"}
                    >
                      {c.active ? "停用" : "启用"}
                    </button>

                    <button
                      type="button"
                      className="rounded-lg border border-red-300 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                      disabled={disabled}
                      onClick={() => {
                        const name = renderText(c.name);
                        const phone = maskPhone(c.phone ?? null);
                        const ok = window.confirm(`删除联系人「${name} / ${phone}」？\n删除后不可恢复。`);
                        if (!ok) return;
                        void onRemoveContact(c.id);
                      }}
                      title="删除联系人（不可恢复）"
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}

          {rows.length === 0 ? (
            <tr>
              <td className="px-3 py-6 text-center text-sm text-slate-500" colSpan={7}>
                还没有联系人，请先添加一位主联系人。
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
};
