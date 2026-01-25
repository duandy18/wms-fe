// src/features/admin/shipping-providers/api/providers/index.ts

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
  code?: string;

  // ✅ Phase 6+：创建必须归属仓库（后端缺失直接 422）
  warehouse_id: number;

  active?: boolean;
  priority?: number;
}): Promise<ShippingProvider> {
  const res = await apiPost<OneResponse<ShippingProvider>>("/shipping-providers", payload);
  return res.data;
}

// ✅ Phase 6+（方案2）：支持迁仓（warehouse_id 可 patch）
// - 后端会校验 warehouse_id 必须存在（你 grep 已确认）
// - 前端保存前做 confirm（在 edit model）
export type UpdateShippingProviderPayload = Partial<{
  name: string;
  code: string | null;
  active: boolean;
  priority: number;
  warehouse_id: number;
}>;

export async function updateShippingProvider(id: number, payload: UpdateShippingProviderPayload): Promise<ShippingProvider> {
  const clean: Record<string, unknown> = { ...payload };
  if (typeof clean.code === "string" && !clean.code.trim()) delete clean.code;

  const res = await apiPatch<OneResponse<ShippingProvider>>(`/shipping-providers/${id}`, clean);
  return res.data;
}
