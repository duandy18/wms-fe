// src/features/tms/waybillConfigs/api.ts

import { apiGet, apiPatch, apiPost } from "../../../lib/api";
import type { ListResponse, OneResponse, WaybillConfig } from "./types";

export async function fetchWaybillConfigs(params?: {
  active?: boolean;
  platform?: string;
  shop_id?: string;
  shipping_provider_id?: number;
  q?: string;
}): Promise<WaybillConfig[]> {
  const qs = new URLSearchParams();

  if (params?.active !== undefined) qs.set("active", String(params.active));
  if (params?.platform) qs.set("platform", params.platform);
  if (params?.shop_id) qs.set("shop_id", params.shop_id);
  if (params?.shipping_provider_id) {
    qs.set("shipping_provider_id", String(params.shipping_provider_id));
  }
  if (params?.q) qs.set("q", params.q);

  const query = qs.toString();
  const path = query ? `/ship/waybill-configs?${query}` : "/ship/waybill-configs";

  const res = await apiGet<ListResponse<WaybillConfig>>(path);
  return res.data;
}

export async function fetchWaybillConfigDetail(id: number): Promise<WaybillConfig> {
  const res = await apiGet<OneResponse<WaybillConfig>>(`/ship/waybill-configs/${id}`);
  return res.data;
}

export async function createWaybillConfig(payload: {
  platform: string;
  shop_id: string;
  shipping_provider_id: number;
  customer_code: string;
  sender_name?: string | null;
  sender_mobile?: string | null;
  sender_phone?: string | null;
  sender_province?: string | null;
  sender_city?: string | null;
  sender_district?: string | null;
  sender_address?: string | null;
  active?: boolean;
}): Promise<WaybillConfig> {
  const res = await apiPost<OneResponse<WaybillConfig>>("/ship/waybill-configs", payload);
  return res.data;
}

export type UpdateWaybillConfigPayload = Partial<{
  platform: string;
  shop_id: string;
  shipping_provider_id: number;
  customer_code: string;
  sender_name: string | null;
  sender_mobile: string | null;
  sender_phone: string | null;
  sender_province: string | null;
  sender_city: string | null;
  sender_district: string | null;
  sender_address: string | null;
  active: boolean;
}>;

export async function updateWaybillConfig(
  id: number,
  payload: UpdateWaybillConfigPayload,
): Promise<WaybillConfig> {
  const res = await apiPatch<OneResponse<WaybillConfig>>(`/ship/waybill-configs/${id}`, payload);
  return res.data;
}
