// src/features/tms/providers/api/schemes/index.ts
import { apiGet, apiPost, apiPatch, apiDelete } from "../../../../../lib/api";
import type {
  PricingScheme,
  PricingSchemeDetail,
  SchemeListResponse,
  SchemeDetailResponse,
} from "../../api/types";

export async function fetchPricingSchemes(
  providerId: number,
  params?: { active?: boolean; include_archived?: boolean; include_inactive?: boolean },
): Promise<PricingScheme[]> {
  const qs = new URLSearchParams();

  if (params?.active !== undefined) qs.set("active", String(params.active));
  if (params?.include_archived !== undefined) qs.set("include_archived", String(params.include_archived));
  if (params?.include_inactive !== undefined) qs.set("include_inactive", String(params.include_inactive));

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
    warehouse_id: number;
    name: string;
    currency?: string;
    default_pricing_mode?: "flat" | "linear_total" | "step_over";
    billable_weight_strategy?: "actual_only" | "max_actual_volume";
    volume_divisor?: number | null;
    rounding_mode?: "none" | "ceil";
    rounding_step_kg?: number | null;
    min_billable_weight_kg?: number | null;
    effective_from?: string | null;
    effective_to?: string | null;
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
    archived_at: string | null;
    priority: number;
    currency: string;
    effective_from: string | null;
    effective_to: string | null;
    billable_weight_rule: Record<string, unknown> | null;
    default_pricing_mode: string;
  }>,
): Promise<PricingSchemeDetail> {
  const res = await apiPatch<SchemeDetailResponse>(`/pricing-schemes/${schemeId}`, payload);
  return res.data;
}

export async function publishPricingScheme(schemeId: number): Promise<PricingSchemeDetail> {
  const res = await apiPost<SchemeDetailResponse>(`/pricing-schemes/${schemeId}/publish`, {});
  return res.data;
}

export async function clonePricingScheme(schemeId: number): Promise<PricingSchemeDetail> {
  const res = await apiPost<SchemeDetailResponse>(`/pricing-schemes/${schemeId}/clone`, {});
  return res.data;
}

export async function deletePricingScheme(schemeId: number): Promise<{ ok: boolean }> {
  return apiDelete<{ ok: boolean }>(`/pricing-schemes/${schemeId}`);
}
