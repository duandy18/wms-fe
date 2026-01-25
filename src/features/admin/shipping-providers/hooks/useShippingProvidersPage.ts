// src/features/admin/shipping-providers/hooks/useShippingProvidersPage.ts
import { useEffect } from "react";
import { useProvidersList } from "./useProvidersList";

export function useShippingProvidersPage() {
  const providersHook = useProvidersList();

  useEffect(() => {
    void providersHook.loadProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { providersHook };
}
