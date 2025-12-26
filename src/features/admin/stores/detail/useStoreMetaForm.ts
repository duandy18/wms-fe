// src/features/admin/stores/detail/useStoreMetaForm.ts
//
// 店铺基础信息表单：state + init + save（状态/orchestration）
// - 不改变原逻辑：首次初始化一次；保存后显示已保存；编辑任意字段会清掉“已保存”标记

import { useEffect, useState } from "react";
import { updateStore } from "../api";

export function useStoreMetaForm(args: {
  canWrite: boolean;
  detail:
    | {
        store_id: number;
        name: string;
        email?: string | null;
        contact_name?: string | null;
        contact_phone?: string | null;
        platform: string;
        shop_id: string;
      }
    | null;
}) {
  const { canWrite, detail } = args;

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

  function markMetaDirty() {
    if (metaJustSaved) setMetaJustSaved(false);
  }

  async function handleSaveMeta(e: React.FormEvent) {
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
    name,
    setName,
    email,
    setEmail,
    contactName,
    setContactName,
    contactPhone,
    setContactPhone,

    savingMeta,
    metaError,
    metaJustSaved,

    markMetaDirty,
    handleSaveMeta,
  };
}

export default useStoreMetaForm;
