// src/features/admin/stores/hooks/useStoreMetaForm.ts
import { useEffect, useState } from "react";
import { updateStore } from "../api";

export type StoreMetaDetail = {
  store_id: number;
  platform: string;
  shop_id: string;

  name: string;
  email?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
};

export function useStoreMetaForm(args: {
  detail: StoreMetaDetail | null;
  canWrite: boolean;
}) {
  const { detail, canWrite } = args;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [savingMeta, setSavingMeta] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [metaJustSaved, setMetaJustSaved] = useState(false);
  const [metaInitialized, setMetaInitialized] = useState(false);

  useEffect(() => {
    if (!detail || metaInitialized) return;
    setName(detail.name);
    setEmail(detail.email || "");
    setContactName(detail.contact_name || "");
    setContactPhone(detail.contact_phone || "");
    setMetaInitialized(true);
  }, [detail, metaInitialized]);

  function markDirty() {
    if (metaJustSaved) setMetaJustSaved(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!detail) return;
    if (!canWrite) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setMetaError("店铺名称不能为空");
      return;
    }

    setSavingMeta(true);
    setMetaError(null);
    setMetaJustSaved(false);

    try {
      await updateStore(detail.store_id, {
        name: trimmedName,
        email: email.trim() || null,
        contact_name: contactName.trim() || null,
        contact_phone: contactPhone.trim() || null,
      });
      setMetaJustSaved(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "保存店铺信息失败";
      setMetaError(message);
    } finally {
      setSavingMeta(false);
    }
  }

  return {
    // fields
    name,
    setName,
    email,
    setEmail,
    contactName,
    setContactName,
    contactPhone,
    setContactPhone,

    // state
    savingMeta,
    metaError,
    metaJustSaved,

    // actions
    markDirty,
    save,
    clearError: () => setMetaError(null),
  };
}
