// src/features/admin/shipping-providers/components/EditProviderModal.tsx
import React from "react";
import { UI } from "../ui";
import type { ShippingProvider, ShippingProviderContact } from "../api";

export type EditProviderFormState = {
  editName: string;
  editCode: string;
  editActive: boolean;
  editPriority: string;

  cName: string;
  cPhone: string;
  cEmail: string;
  cWechat: string;
  cRole: string;
  cPrimary: boolean;
};

function renderText(v: string | null | undefined): string {
  return v && v.trim() ? v : "—";
}

export const EditProviderModal: React.FC<{
  open: boolean;
  provider: ShippingProvider;
  busy: boolean;
  savingProvider: boolean;
  savingContact: boolean;

  error: string | null;

  state: EditProviderFormState;
  onChange: (patch: Partial<EditProviderFormState>) => void;

  onClose: () => void;
  onSaveProvider: () => void | Promise<void>;
  onCreateContact: () => void | Promise<void>;
  onSetPrimary: (contactId: number) => void | Promise<void>;
  onToggleContactActive: (c: ShippingProviderContact) => void | Promise<void>;
  onRemoveContact: (contactId: number) => void | Promise<void>;
}> = ({
  open,
  provider,
  busy,
  savingProvider,
  savingContact,
  error,
  state,
  onChange,
  onClose,
  onSaveProvider,
  onCreateContact,
  onSetPrimary,
  onToggleContactActive,
  onRemoveContact,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-6">
      <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-slate-900">编辑物流/快递公司</div>
            <div className="mt-1 text-sm text-slate-600">
              #{provider.id} · <span className="font-mono">{provider.name}</span>
            </div>
          </div>

          <button
            type="button"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={onClose}
            disabled={busy}
          >
            关闭
          </button>
        </div>

        {error ? <div className={`${UI.error} mt-3`}>{error}</div> : null}

        {/* Provider 基本信息 */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className={UI.label}>公司名称 *</label>
            <input
              className={UI.input}
              value={state.editName}
              disabled={busy}
              onChange={(e) => onChange({ editName: e.target.value })}
            />
          </div>

          <div>
            <label className={UI.label}>编码</label>
            <input
              className={UI.inputMono}
              value={state.editCode}
              disabled={busy}
              onChange={(e) => onChange({ editCode: e.target.value })}
            />
          </div>

          <div>
            <label className={UI.label}>优先级</label>
            <input
              className={UI.inputMono}
              value={state.editPriority}
              disabled={busy}
              onChange={(e) => onChange({ editPriority: e.target.value })}
            />
          </div>

          <div className="flex items-end gap-3 md:col-span-4">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={state.editActive}
                disabled={busy}
                onChange={(e) => onChange({ editActive: e.target.checked })}
              />
              启用
            </label>

            <button
              type="button"
              className={UI.btnPrimaryGreen}
              disabled={busy || savingProvider}
              onClick={() => void onSaveProvider()}
            >
              {savingProvider ? "保存中…" : "保存公司信息"}
            </button>
          </div>
        </div>

        {/* Contacts */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-900">联系人</div>

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
                <option value="shipping">shipping</option>
                <option value="billing">billing</option>
                <option value="after_sales">after_sales</option>
                <option value="other">other</option>
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

          {/* 联系人列表 */}
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
                {(provider.contacts ?? []).map((c) => (
                  <tr key={c.id} className="border-b">
                    <td className="px-3 py-2">{renderText(c.name)}</td>
                    <td className="px-3 py-2 font-mono">{renderText(c.phone ?? null)}</td>
                    <td className="px-3 py-2 font-mono">{renderText(c.email ?? null)}</td>
                    <td className="px-3 py-2 font-mono">{renderText(c.role ?? null)}</td>
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
                {(provider.contacts ?? []).length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-center text-sm text-slate-500" colSpan={7}>
                      暂无联系人
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={onClose}
            disabled={busy}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProviderModal;
