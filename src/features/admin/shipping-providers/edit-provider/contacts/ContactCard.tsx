// src/features/admin/shipping-providers/edit-provider/contacts/ContactCard.tsx

import React from "react";
import type { ShippingProviderContact } from "../../api";

type Props = {
  contact: ShippingProviderContact;

  disabled?: boolean;

  onSetPrimary: (contactId: number) => void | Promise<void>;
  onToggleActive: (contact: ShippingProviderContact) => void | Promise<void>;
  onRemove: (contactId: number) => void | Promise<void>;
};

function roleLabel(role: string): string {
  switch (role) {
    case "shipping":
      return "发货";
    case "billing":
      return "对账";
    case "after_sales":
      return "售后";
    case "other":
      return "其他";
    default:
      return role || "—";
  }
}

function renderText(v?: string | null) {
  return v && v.trim() ? v : "—";
}

export const ContactCard: React.FC<Props> = ({
  contact,
  disabled,
  onSetPrimary,
  onToggleActive,
  onRemove,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      {/* 头部：姓名 + 状态 */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-slate-900">
            {contact.name}
            <span className="ml-2 text-sm text-slate-500">
              （{roleLabel(contact.role)}）
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {contact.is_primary && (
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-800">
              主联系人
            </span>
          )}
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              contact.active
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {contact.active ? "启用" : "停用"}
          </span>
        </div>
      </div>

      {/* 信息区 */}
      <div className="mt-3 space-y-1 text-base text-slate-700">
        <div>📞 电话：{renderText(contact.phone)}</div>
        <div>✉️ 邮箱：{renderText(contact.email)}</div>
        <div>💬 微信：{renderText(contact.wechat)}</div>
      </div>

      {/* 操作区 */}
      <div className="mt-4 flex justify-end gap-2">
        {!contact.is_primary && (
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            disabled={disabled}
            onClick={() => void onSetPrimary(contact.id)}
          >
            设为主
          </button>
        )}

        <button
          type="button"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          disabled={disabled}
          onClick={() => void onToggleActive(contact)}
        >
          {contact.active ? "停用" : "启用"}
        </button>

        <button
          type="button"
          className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
          disabled={disabled}
          onClick={() => void onRemove(contact.id)}
        >
          删除
        </button>
      </div>
    </div>
  );
};

export default ContactCard;
