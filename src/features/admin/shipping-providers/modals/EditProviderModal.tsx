// src/features/admin/shipping-providers/modals/EditProviderModal.tsx

import React from "react";
import type { ShippingProvider, ShippingProviderContact } from "../api";

import ModalFrame from "./edit-provider/ModalFrame";
import ProviderForm from "./edit-provider/ProviderForm";
import ContactCreateForm from "./edit-provider/ContactCreateForm";
import ContactsTable from "./edit-provider/ContactsTable";
import { MUI } from "./edit-provider/ui";

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
    <ModalFrame
      title="编辑物流/快递公司"
      subtitle={
        <>
          #{provider.id} · <span className="font-mono">{provider.name}</span>
        </>
      }
      busy={busy}
      error={error}
      onClose={onClose}
    >
      {/* Provider 基本信息 */}
      <ProviderForm
        disabled={busy}
        saving={savingProvider}
        state={{
          editName: state.editName,
          editCode: state.editCode,
          editActive: state.editActive,
          editPriority: state.editPriority,
        }}
        onChange={(patch) => onChange(patch)}
        onSave={onSaveProvider}
      />

      {/* Contacts */}
      <div className={MUI.contactsCard}>
        <div className={MUI.contactsTitle}>联系人</div>

        <ContactCreateForm
          disabled={busy}
          saving={savingContact}
          state={{
            cName: state.cName,
            cPhone: state.cPhone,
            cEmail: state.cEmail,
            cWechat: state.cWechat,
            cRole: state.cRole,
            cPrimary: state.cPrimary,
          }}
          onChange={(patch) => onChange(patch)}
          onCreate={onCreateContact}
        />

        <ContactsTable
          contacts={provider.contacts ?? []}
          disabled={busy || savingContact}
          onSetPrimary={onSetPrimary}
          onToggleContactActive={onToggleContactActive}
          onRemoveContact={onRemoveContact}
        />
      </div>
    </ModalFrame>
  );
};

export default EditProviderModal;
