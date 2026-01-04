// src/features/admin/shipping-providers/api/schemes/index.ts
import { apiGet, apiPost, apiPatch } from "../../../../../lib/api";
import type { PricingScheme, PricingSchemeDetail, SchemeListResponse, SchemeDetailResponse } from "../../api.types";

export async function fetchPricingSchemes(providerId: number, params?: { active?: boolean }): Promise<PricingScheme[]> {
  const qs = new URLSearchParams();
  if (params?.active !== undefined) qs.set("active", String(params.active));
  const query = qs.toString();
  const path = query
    ? `/shipping-providers/${providerId}/pricing-schemes?${query}`
    : `/shipping-providers/${providerId}/pricing-schemes`;
  const res = await apiGet<SchemeListResponse>(path);
  return res.data;
}

export async function fetchPricingSchemeDetail(schemeId: number): Promise<PricingSchemeDetail> {
  const res = await apiGet<SchemeDetailResponse>(`/pricing-schemes/${schemeId}`);
  return res.data;
}

export async function createPricingScheme(
  providerId: number,
  payload: {
    name: string;
    active?: boolean;
    priority?: number;
    currency?: string;
    effective_from?: string | null;
    effective_to?: string | null;
    billable_weight_rule?: Record<string, unknown> | null;
  },
): Promise<PricingSchemeDetail> {
  const res = await apiPost<SchemeDetailResponse>(`/shipping-providers/${providerId}/pricing-schemes`, payload);
  return res.data;
}

export async function patchPricingScheme(
  schemeId: number,
  payload: Partial<{
    name: string;
    active: boolean;
    priority: number;
    currency: string;
    effective_from: string | null;
    effective_to: string | null;
    billable_weight_rule: Record<string, unknown> | null;
  }>,
): Promise<PricingSchemeDetail> {
  const res = await apiPatch<SchemeDetailResponse>(`/pricing-schemes/${schemeId}`, payload);
  return res.data;
}
