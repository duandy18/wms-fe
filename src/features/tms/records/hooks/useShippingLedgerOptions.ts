// src/features/tms/records/hooks/useShippingLedgerOptions.ts

import { useCallback, useEffect, useState } from "react";
import { apiGet } from "../../../../lib/api";

export interface ShippingLedgerProviderOption {
  id: number;
  name: string;
  code: string;
}

export interface ShippingLedgerWarehouseOption {
  id: number;
  name: string;
}

interface ProvidersListResponseItem {
  id?: number;
  shipping_provider_id?: number;
  name?: string;
  code?: string;
}

interface ProvidersListResponse {
  ok?: boolean;
  data?: ProvidersListResponseItem[];
  items?: ProvidersListResponseItem[];
  rows?: ProvidersListResponseItem[];
}

interface WarehousesListResponseItem {
  id?: number;
  name?: string;
}

interface WarehousesListResponse {
  ok?: boolean;
  data?: WarehousesListResponseItem[];
  items?: WarehousesListResponseItem[];
  rows?: WarehousesListResponseItem[];
}

function toProviderOptions(payload: ProvidersListResponse): ShippingLedgerProviderOption[] {
  const raw = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(payload.items)
      ? payload.items
      : Array.isArray(payload.rows)
        ? payload.rows
        : [];

  return raw
    .map((item) => {
      const id =
        typeof item.id === "number"
          ? item.id
          : typeof item.shipping_provider_id === "number"
            ? item.shipping_provider_id
            : null;
      const name = typeof item.name === "string" ? item.name.trim() : "";
      const code = typeof item.code === "string" ? item.code.trim() : "";

      if (id == null || !name) {
        return null;
      }

      return {
        id,
        name,
        code,
      };
    })
    .filter((item): item is ShippingLedgerProviderOption => item !== null);
}

function toWarehouseOptions(payload: WarehousesListResponse): ShippingLedgerWarehouseOption[] {
  const raw = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(payload.items)
      ? payload.items
      : Array.isArray(payload.rows)
        ? payload.rows
        : [];

  return raw
    .map((item) => {
      const id = typeof item.id === "number" ? item.id : null;
      const name = typeof item.name === "string" ? item.name.trim() : "";

      if (id == null || !name) {
        return null;
      }

      return {
        id,
        name,
      };
    })
    .filter((item): item is ShippingLedgerWarehouseOption => item !== null);
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
      const [providersRes, warehousesRes] = await Promise.all([
        apiGet<ProvidersListResponse>("/shipping-providers"),
        apiGet<WarehousesListResponse>("/warehouses"),
      ]);

      setProviders(toProviderOptions(providersRes));
      setWarehouses(toWarehouseOptions(warehousesRes));
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
