// src/features/tms/providers/api/bindings/index.ts
import { apiDelete, apiGet, apiPatch, apiPost } from "../../../../../lib/api";

export type ShippingProviderLite = {
  id: number;
  name: string;
  code?: string | null;
  active: boolean;
};

export type WarehouseShippingProvider = {
  warehouse_id: number;
  shipping_provider_id: number;
  active: boolean;
  priority: number;
  pickup_cutoff_time?: string | null;
  remark?: string | null;
  provider: ShippingProviderLite;
};

type ListResponse<T> = {
  ok: boolean;
  data: T[];
};

type OneResponse<T> = {
  ok: boolean;
  data: T;
};

type DeleteResponse = {
  ok: boolean;
  data: {
    warehouse_id: number;
    shipping_provider_id: number;
  };
};

export type BindWarehouseShippingProviderPayload = {
  shipping_provider_id: number;
  active?: boolean;
  priority?: number;
  pickup_cutoff_time?: string | null;
  remark?: string | null;
};

export type UpdateWarehouseShippingProviderPayload = Partial<{
  active: boolean;
  priority: number;
  pickup_cutoff_time: string | null;
  remark: string | null;
}>;

export async function listWarehouseShippingProviders(warehouseId: number): Promise<WarehouseShippingProvider[]> {
  const res = await apiGet<ListResponse<WarehouseShippingProvider>>(`/warehouses/${warehouseId}/shipping-providers`);
  return res.data ?? [];
}

export async function bindProviderToWarehouse(
  warehouseId: number,
  payload: BindWarehouseShippingProviderPayload,
): Promise<WarehouseShippingProvider> {
  const res = await apiPost<OneResponse<WarehouseShippingProvider>>(`/warehouses/${warehouseId}/shipping-providers/bind`, {
    shipping_provider_id: payload.shipping_provider_id,
    active: payload.active ?? true,
    priority: payload.priority ?? 100,
    pickup_cutoff_time: payload.pickup_cutoff_time ?? null,
    remark: payload.remark ?? null,
  });
  return res.data;
}

export async function updateWarehouseProviderBinding(
  warehouseId: number,
  providerId: number,
  payload: UpdateWarehouseShippingProviderPayload,
): Promise<WarehouseShippingProvider> {
  const next: UpdateWarehouseShippingProviderPayload = { ...payload };

  if ("remark" in next) {
    next.remark = next.remark == null ? null : String(next.remark).trim() || null;
  }

  if ("pickup_cutoff_time" in next) {
    next.pickup_cutoff_time =
      next.pickup_cutoff_time == null ? null : String(next.pickup_cutoff_time).trim() || null;
  }

  const res = await apiPatch<OneResponse<WarehouseShippingProvider>>(
    `/warehouses/${warehouseId}/shipping-providers/${providerId}`,
    next,
  );
  return res.data;
}

export async function unbindProviderFromWarehouse(warehouseId: number, providerId: number): Promise<DeleteResponse["data"]> {
  const res = await apiDelete<DeleteResponse>(`/warehouses/${warehouseId}/shipping-providers/${providerId}`);
  return res.data;
}
