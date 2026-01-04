// src/features/admin/shipping-providers/api/providers/index.ts
import { apiGet, apiPost, apiPatch } from "../../../../../lib/api";
import type { ShippingProvider, ListResponse, OneResponse } from "../../api.types";

export async function fetchShippingProviders(params?: { active?: boolean; q?: string }): Promise<ShippingProvider[]> {
  const qs = new URLSearchParams();
  if (params?.active !== undefined) qs.set("active", String(params.active));
  if (params?.q) qs.set("q", params.q);
  const query = qs.toString();
  const path = query ? `/shipping-providers?${query}` : "/shipping-providers";
  const res = await apiGet<ListResponse<ShippingProvider>>(path);
  return res.data;
}

export async function fetchShippingProviderDetail(id: number): Promise<ShippingProvider> {
  const res = await apiGet<OneResponse<ShippingProvider>>(`/shipping-providers/${id}`);
  return res.data;
}

export async function createShippingProvider(payload: {
  name: string;
  code?: string;
  active?: boolean;
  priority?: number;
}): Promise<ShippingProvider> {
  const res = await apiPost<OneResponse<ShippingProvider>>("/shipping-providers", payload);
  return res.data;
}

export async function updateShippingProvider(
  id: number,
  payload: Partial<{
    name: string;
    code: string | null;
    active: boolean;
    priority: number;
  }>,
): Promise<ShippingProvider> {
  const clean: Record<string, unknown> = { ...payload };
  if (typeof clean.code === "string" && !clean.code.trim()) delete clean.code;
  const res = await apiPatch<OneResponse<ShippingProvider>>(`/shipping-providers/${id}`, clean);
  return res.data;
}
