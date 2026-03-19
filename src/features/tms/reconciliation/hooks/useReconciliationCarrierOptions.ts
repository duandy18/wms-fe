import { useCallback, useEffect, useState } from "react";
import { fetchShippingProviders, type ShippingProvider } from "../../providers/api";
import type { ReconciliationCarrierOption } from "../types";

function toCarrierOption(provider: ShippingProvider): ReconciliationCarrierOption | null {
  const code = String(provider.code ?? "").trim();
  const name = String(provider.name ?? "").trim();
  if (!code || !name) return null;
  return { code, name };
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
        .map((provider) => toCarrierOption(provider))
        .filter((item): item is ReconciliationCarrierOption => item !== null)
        .sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
      setOptions(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载快递公司失败");
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
