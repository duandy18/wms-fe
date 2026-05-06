// src/features/shipping-assist/records/hooks/useShippingLedgerOptions.ts

import { useCallback, useEffect, useState } from "react";
import { apiGet } from "../../../../lib/api";

export interface ShippingLedgerProviderOption {
  id: number;
  name: string;
  shipping_provider_code: string;
}

export interface ShippingLedgerWarehouseOption {
  id: number;
  name: string;
}

interface ShippingRecordsOptionsResponse {
  ok: boolean;
  providers: ShippingLedgerProviderOption[];
  warehouses: ShippingLedgerWarehouseOption[];
}

function toProviderOptions(
  payload: ShippingRecordsOptionsResponse,
): ShippingLedgerProviderOption[] {
  return Array.isArray(payload.providers) ? payload.providers : [];
}

function toWarehouseOptions(
  payload: ShippingRecordsOptionsResponse,
): ShippingLedgerWarehouseOption[] {
  return Array.isArray(payload.warehouses) ? payload.warehouses : [];
}

export function useShippingLedgerOptions() {
  const [providers, setProviders] = useState<ShippingLedgerProviderOption[]>([]);
  const [warehouses, setWarehouses] = useState<ShippingLedgerWarehouseOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reload = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError("");

    try {
      const res = await apiGet<ShippingRecordsOptionsResponse>(
        "/shipping-assist/records/options",
      );

      setProviders(toProviderOptions(res));
      setWarehouses(toWarehouseOptions(res));
    } catch (err) {
      const message = err instanceof Error ? err.message : "加载筛选选项失败";
      setError(message);
      setProviders([]);
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    providers,
    warehouses,
    loading,
    error,
    reload,
  };
}
