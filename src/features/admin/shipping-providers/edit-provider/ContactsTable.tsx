// src/features/admin/shipping-providers/edit-provider/ContactsTable.tsx

import React from "react";
import type { ShippingProviderContact } from "../api";
import { roleLabel } from "./contactRoles";

function renderText(v: string | null | undefined): string {
  return v && v.trim() ? v : "—";
}

export const ContactsTable: React.FC<{
  contacts: ShippingProviderContact[];
  busy: boolean;
  savingContact: boolean;
  onSetPrimary: (contactId: number) => void | Promise<void>;
  onToggleContactActive: (c: ShippingProviderContact) => void | Promise<void>;
  onRemoveContact: (contactId: number) => void | Promise<void>;
}> = ({ contacts, busy, savingContact, onSetPrimary, onToggleContactActive, onRemoveContact }) => {
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
          {contacts.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="px-3 py-2">{renderText(c.name)}</td>
              <td className="px-3 py-2 font-mono">{renderText(c.phone ?? null)}</td>
              <td className="px-3 py-2 font-mono">{renderText(c.email ?? null)}</td>
              <td className="px-3 py-2">{roleLabel(c.role ?? null)}</td>
              <td className="px-3 py-2">{c.is_primary ? "是" : "否"}</td>
              <td className="px-3 py-2">{c.active ? "是" : "否"}</td>
              <td className="px-3 py-2 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    disabled={busy || savingContact}
                    onClick={() => void onSetPrimary(c.id)}
                  >
                    设主
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    disabled={busy || savingContact}
                    onClick={() => void onToggleContactActive(c)}
                  >
                    {c.active ? "停用" : "启用"}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-red-300 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                    disabled={busy || savingContact}
                    onClick={() => void onRemoveContact(c.id)}
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {contacts.length === 0 ? (
            <tr>
              <td className="px-3 py-6 text-center text-sm text-slate-500" colSpan={7}>
                暂无联系人
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
};
