// src/features/tms/providers/api/providers/index.ts

import { apiGet, apiPost, apiPatch } from "../../../../../lib/api";
import type { ShippingProvider, ListResponse, OneResponse } from "../../api/types";

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
  code: string;
  company_code?: string;
  resource_code?: string;

  // ✅ 网点地址（可选，与后端 address 字段对齐）
  address?: string;

  active?: boolean;
  priority?: number;
}): Promise<ShippingProvider> {
  const res = await apiPost<OneResponse<ShippingProvider>>("/shipping-providers", payload);
  return res.data;
}

export type UpdateShippingProviderPayload = Partial<{
  name: string;
  code: string;
  company_code: string | null;
  resource_code: string | null;
  address: string | null;
  active: boolean;
  priority: number;
}>;

export async function updateShippingProvider(id: number, payload: UpdateShippingProviderPayload): Promise<ShippingProvider> {
  const res = await apiPatch<OneResponse<ShippingProvider>>(`/shipping-providers/${id}`, payload);
  return res.data;
}
