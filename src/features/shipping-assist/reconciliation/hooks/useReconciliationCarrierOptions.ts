import { useCallback, useEffect, useState } from "react";
import { fetchShippingProviders } from "../../providers/api/providers";
import type { ShippingProvider } from "../../providers/api/types";
import type { ReconciliationCarrierOption } from "../types";

function toCarrierOption(
  provider: ShippingProvider,
): ReconciliationCarrierOption | null {
  const code = String(provider.shipping_provider_code ?? "").trim();
  const name = String(provider.name ?? "").trim();
  if (!code || !name) return null;
  return { shipping_provider_code: code, name };
}

export function useReconciliationCarrierOptions() {
  const [options, setOptions] = useState<ReconciliationCarrierOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reload = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError("");
    try {
      const providers = await fetchShippingProviders({});
      const next = providers
        .map((provider: ShippingProvider) => toCarrierOption(provider))
        .filter(
          (item: ReconciliationCarrierOption | null): item is ReconciliationCarrierOption =>
            item !== null,
        )
        .sort((a: ReconciliationCarrierOption, b: ReconciliationCarrierOption) =>
          a.name.localeCompare(b.name, "zh-CN"),
        );
      setOptions(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载物流网点失败");
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    options,
    loading,
    error,
    reload,
  };
}
