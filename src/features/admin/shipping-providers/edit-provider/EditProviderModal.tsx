// src/features/admin/shipping-providers/edit-provider/EditProviderModalImpl.tsx

import React from "react";
import { UI } from "../ui";
import type { ShippingProvider, ShippingProviderContact } from "../api";
import { ProviderForm, type EditProviderFormState } from "./ProviderForm";
import { ContactsForm } from "./ContactsForm";
import { ContactsTable } from "./ContactsTable";

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

        <ProviderForm
          state={state}
          busy={busy}
          savingProvider={savingProvider}
          onChange={onChange}
          onSaveProvider={onSaveProvider}
        />

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-900">联系人</div>

          <ContactsForm
            state={state}
            busy={busy}
            savingContact={savingContact}
            onChange={onChange}
            onCreateContact={onCreateContact}
          />

          <ContactsTable
            contacts={provider.contacts ?? []}
            busy={busy}
            savingContact={savingContact}
            onSetPrimary={onSetPrimary}
            onToggleContactActive={onToggleContactActive}
            onRemoveContact={onRemoveContact}
          />
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

export type { EditProviderFormState };
export default EditProviderModal;
