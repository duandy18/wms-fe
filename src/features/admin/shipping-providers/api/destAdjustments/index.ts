// src/features/admin/shipping-providers/api/destAdjustments/index.ts
import { apiGet, apiPost, apiPatch, apiDelete } from "../../../../../lib/api";
import type { PricingSchemeDestAdjustment } from "../types";

export type DestAdjustmentScope = "province" | "city";

export async function fetchDestAdjustments(schemeId: number): Promise<PricingSchemeDestAdjustment[]> {
  return apiGet<PricingSchemeDestAdjustment[]>(`/pricing-schemes/${schemeId}/dest-adjustments`);
}

export type DestAdjustmentUpsertPayload = {
  scope: DestAdjustmentScope;
  province_code: string;
  city_code?: string | null;
  province_name?: string | null;
  city_name?: string | null;
  amount: number;
  active?: boolean;
  priority?: number;
};

export async function upsertDestAdjustment(
  schemeId: number,
  payload: DestAdjustmentUpsertPayload,
): Promise<PricingSchemeDestAdjustment> {
  const body = {
    scope: payload.scope,
    province_code: (payload.province_code || "").trim(),
    city_code: payload.scope === "city" ? (payload.city_code || "").trim() : null,
    province_name: payload.province_name ? String(payload.province_name).trim() : null,
    city_name: payload.scope === "city" && payload.city_name ? String(payload.city_name).trim() : null,
    amount: payload.amount,
    active: typeof payload.active === "boolean" ? payload.active : true,
    priority: typeof payload.priority === "number" ? payload.priority : 100,
  };
  return apiPost<PricingSchemeDestAdjustment>(`/pricing-schemes/${schemeId}/dest-adjustments:upsert`, body);
}

export type PatchDestAdjustmentPayload = Partial<{
  scope: DestAdjustmentScope;
  province_code: string;
  city_code: string | null;
  province_name: string | null;
  city_name: string | null;
  amount: number;
  active: boolean;
  priority: number;
}>;

export async function patchDestAdjustment(
  destAdjustmentId: number,
  payload: PatchDestAdjustmentPayload,
): Promise<PricingSchemeDestAdjustment> {
  const next: PatchDestAdjustmentPayload = { ...payload };

  if (typeof next.province_code === "string") next.province_code = next.province_code.trim();
  if (typeof next.city_code === "string") next.city_code = next.city_code.trim();

  if (typeof next.province_name === "string") next.province_name = next.province_name.trim();
  if (typeof next.city_name === "string") next.city_name = next.city_name.trim();

  return apiPatch<PricingSchemeDestAdjustment>(`/dest-adjustments/${destAdjustmentId}`, next);
}

export async function deleteDestAdjustment(destAdjustmentId: number): Promise<{ ok: boolean }> {
  return apiDelete<{ ok: boolean }>(`/dest-adjustments/${destAdjustmentId}`);
}
