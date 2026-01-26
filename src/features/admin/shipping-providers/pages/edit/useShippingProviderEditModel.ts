// src/features/admin/shipping-providers/pages/edit/useShippingProviderEditModel.ts
import { useCallback, useEffect, useMemo, useState } from "react";

import type { ShippingProvider, ShippingProviderContact, PricingScheme } from "../../api/types";
import { fetchShippingProviderDetail } from "../../api/providers";
import { fetchPricingSchemes } from "../../api/schemes";
import { createShippingProviderContact, updateShippingProviderContact, deleteShippingProviderContact } from "../../api/contacts";

function toErrMsg(e: unknown, fallback: string): string {
  if (e instanceof Error) return e.message || fallback;
  return fallback;
}

export type CreateContactDraft = {
  name: string;
  phone: string;
  email: string;
  wechat: string;
  role: string;
  is_primary: boolean;
  active: boolean;
};

export function useShippingProviderEditModel(providerId: number | null) {
  const [provider, setProvider] = useState<ShippingProvider | null>(null);
  const [loadingProvider, setLoadingProvider] = useState(false);
  const [providerError, setProviderError] = useState<string | null>(null);

  const [schemes, setSchemes] = useState<PricingScheme[]>([]);
  const [loadingSchemes, setLoadingSchemes] = useState(false);
  const [schemesError, setSchemesError] = useState<string | null>(null);

  // ✅ Phase 6+：收费标准列表读链路开关（默认只看“当前可用”）
  // - include_inactive=true：把停用历史也拉回来
  // - include_archived=true：把归档也拉回来
  const [includeInactiveSchemes, setIncludeInactiveSchemes] = useState(false);
  const [includeArchivedSchemes, setIncludeArchivedSchemes] = useState(false);

  const [savingContact, setSavingContact] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const [draft, setDraft] = useState<CreateContactDraft>({
    name: "",
    phone: "",
    email: "",
    wechat: "",
    role: "OP",
    is_primary: true,
    active: true,
  });

  const patchDraft = useCallback((p: Partial<CreateContactDraft>) => {
    setDraft((d) => ({ ...d, ...p }));
  }, []);

  const refreshProvider = useCallback(async () => {
    if (!providerId) return;
    setLoadingProvider(true);
    setProviderError(null);
    try {
      const p = await fetchShippingProviderDetail(providerId);
      setProvider(p);
    } catch (e: unknown) {
      setProvider(null);
      setProviderError(toErrMsg(e, "加载网点失败"));
    } finally {
      setLoadingProvider(false);
    }
  }, [providerId]);

  const refreshSchemes = useCallback(async () => {
    if (!providerId) return;
    setLoadingSchemes(true);
    setSchemesError(null);
    try {
      const list = await fetchPricingSchemes(providerId, {
        include_inactive: includeInactiveSchemes,
        include_archived: includeArchivedSchemes,
      });
      setSchemes(list ?? []);
    } catch (e: unknown) {
      setSchemes([]);
      setSchemesError(toErrMsg(e, "加载运价方案失败"));
    } finally {
      setLoadingSchemes(false);
    }
  }, [providerId, includeInactiveSchemes, includeArchivedSchemes]);

  useEffect(() => {
    void refreshProvider();
  }, [refreshProvider]);

  // ✅ 关键：当 providerId 或“读链路开关”变化时，自动刷新列表
  useEffect(() => {
    void refreshSchemes();
  }, [refreshSchemes]);

  const contacts = useMemo<ShippingProviderContact[]>(() => provider?.contacts ?? [], [provider]);

  async function createContact() {
    if (!providerId) return;
    setContactError(null);

    const name = draft.name.trim();
    if (!name) {
      setContactError("联系人姓名不能为空");
      return;
    }

    setSavingContact(true);
    try {
      await createShippingProviderContact(providerId, {
        name,
        phone: draft.phone.trim() ? draft.phone.trim() : null,
        email: draft.email.trim() ? draft.email.trim() : null,
        wechat: draft.wechat.trim() ? draft.wechat.trim() : null,
        role: draft.role || "OP",
        is_primary: Boolean(draft.is_primary),
        active: Boolean(draft.active),
      });

      setDraft((d) => ({
        ...d,
        name: "",
        phone: "",
        email: "",
        wechat: "",
        is_primary: false,
        active: true,
      }));

      await refreshProvider();
    } catch (e: unknown) {
      setContactError(toErrMsg(e, "新增联系人失败"));
    } finally {
      setSavingContact(false);
    }
  }

  async function setPrimary(contactId: number) {
    setContactError(null);
    setSavingContact(true);
    try {
      await updateShippingProviderContact(contactId, { is_primary: true });
      await refreshProvider();
    } catch (e: unknown) {
      setContactError(toErrMsg(e, "设主失败"));
    } finally {
      setSavingContact(false);
    }
  }

  async function toggleContactActive(c: ShippingProviderContact) {
    setContactError(null);
    setSavingContact(true);
    try {
      await updateShippingProviderContact(c.id, { active: !c.active });
      await refreshProvider();
    } catch (e: unknown) {
      setContactError(toErrMsg(e, "启停失败"));
    } finally {
      setSavingContact(false);
    }
  }

  async function removeContact(contactId: number) {
    setContactError(null);
    setSavingContact(true);
    try {
      await deleteShippingProviderContact(contactId);
      await refreshProvider();
    } catch (e: unknown) {
      setContactError(toErrMsg(e, "删除失败"));
    } finally {
      setSavingContact(false);
    }
  }

  return {
    provider,
    loadingProvider,
    providerError,

    schemes,
    loadingSchemes,
    schemesError,

    // ✅ 暴露读链路开关（给 UI 两个 checkbox）
    includeInactiveSchemes,
    setIncludeInactiveSchemes,
    includeArchivedSchemes,
    setIncludeArchivedSchemes,

    contacts,

    draft,
    patchDraft,
    savingContact,
    contactError,
    createContact,
    setPrimary,
    toggleContactActive,
    removeContact,

    refreshProvider,
    refreshSchemes,
  };
}
