// src/features/admin/shipping-providers/hooks/useShippingProvidersPage.ts
import { useEffect, useMemo, useState } from "react";
import { useProvidersList } from "./useProvidersList";
import { useSchemesList } from "./useSchemesList";
import { useEditProviderModal } from "./useEditProviderModal";

export function useShippingProvidersPage() {
  // ===== Providers / Schemes hooks（复用现有行为，不改接口）=====
  const providersHook = useProvidersList();
  const schemesHook = useSchemesList();

  const providers = providersHook.providers;

  // ===== Provider selection =====
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);

  const selectedProvider = useMemo(
    () => (selectedProviderId ? providers.find((p) => p.id === selectedProviderId) ?? null : null),
    [providers, selectedProviderId],
  );

  async function selectProviderForSchemes(id: number) {
    setSelectedProviderId(id);
    await schemesHook.loadSchemes(id);
  }

  function clearProviderForSchemes() {
    setSelectedProviderId(null);
    schemesHook.setSchemes([]);
  }

  // ===== 初次加载 =====
  useEffect(() => {
    void providersHook.loadProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 当 providers 变化时，校验 selectedProviderId 是否还存在（保持原行为）
  useEffect(() => {
    if (selectedProviderId && !providers.some((p) => p.id === selectedProviderId)) {
      setSelectedProviderId(null);
      schemesHook.setSchemes([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providers]);

  // ===== Edit Provider Modal（下沉）=====
  const modal = useEditProviderModal({
    providers,
    loadProviders: providersHook.loadProviders,
  });

  return {
    // downstream hooks
    providersHook,
    schemesHook,

    // selection
    selectedProviderId,
    selectedProvider,
    selectProviderForSchemes,
    clearProviderForSchemes,
    setSelectedProviderId,

    // modal (透传，不改对外接口/字段名)
    editOpen: modal.editOpen,
    editingProvider: modal.editingProvider,
    busyModal: modal.busyModal,
    editSaving: modal.editSaving,
    cSaving: modal.cSaving,
    editError: modal.editError,
    form: modal.form,
    patchForm: modal.patchForm,
    openEditProvider: modal.openEditProvider,
    closeEditProvider: modal.closeEditProvider,
    saveEditProvider: modal.saveEditProvider,
    createContact: modal.createContact,
    setPrimary: modal.setPrimary,
    toggleContactActive: modal.toggleContactActive,
    removeContact: modal.removeContact,
  };
}
