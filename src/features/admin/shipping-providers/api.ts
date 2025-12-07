// src/features/admin/shipping-providers/api.ts
import { apiGet, apiPost, apiPatch } from "../../../lib/api";

export interface ShippingProvider {
  id: number;
  name: string;
  code?: string | null;
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  wechat?: string | null;
  active: boolean;

  // 费率配置
  priority: number;
  pricing_model?: Record<string, unknown> | null;
  region_rules?: Record<string, unknown> | null;
}

interface ListResponse {
  ok: boolean;
  data: ShippingProvider[];
}

interface OneResponse {
  ok: boolean;
  data: ShippingProvider;
}

export async function fetchShippingProviders(params?: {
  active?: boolean;
  q?: string;
}): Promise<ShippingProvider[]> {
  const qs = new URLSearchParams();
  if (params?.active !== undefined) {
    qs.set("active", String(params.active));
  }
  if (params?.q) {
    qs.set("q", params.q);
  }
  const query = qs.toString();
  const path = query
    ? `/shipping-providers?${query}`
    : "/shipping-providers";
  const res = await apiGet<ListResponse>(path);
  return res.data;
}

export async function createShippingProvider(payload: {
  name: string;
  code?: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  wechat?: string;
  active?: boolean;

  priority?: number;
  pricing_model?: Record<string, unknown> | null;
  region_rules?: Record<string, unknown> | null;
}): Promise<ShippingProvider> {
  const res = await apiPost<OneResponse>("/shipping-providers", payload);
  return res.data;
}

export async function updateShippingProvider(
  id: number,
  payload: Partial<{
    name: string;
    code: string;
    contact_name: string;
    phone: string;
    email: string;
    wechat: string;
    active: boolean;

    priority: number;
    pricing_model: Record<string, unknown> | null;
    region_rules: Record<string, unknown> | null;
  }>,
): Promise<ShippingProvider> {
  const res = await apiPatch<OneResponse>(
    `/shipping-providers/${id}`,
    payload,
  );
  return res.data;
}
