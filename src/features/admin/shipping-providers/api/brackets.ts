// src/features/admin/shipping-providers/api/brackets.ts
import { apiPost, apiPatch, apiDelete } from "../../../../lib/api";
import type { PricingSchemeZoneBracket } from "./types";

type PricingMode = "flat" | "linear_total" | "step_over" | "manual_quote";

export async function createZoneBracket(
  zoneId: number,
  payload: {
    min_kg: number;
    max_kg?: number | null;

    pricing_mode: PricingMode;

    // flat
    flat_amount?: number;

    // linear_total / step_over
    base_amount?: number;
    rate_per_kg?: number;

    // step_over
    base_kg?: number;

    active?: boolean;
  },
): Promise<PricingSchemeZoneBracket> {
  return apiPost<PricingSchemeZoneBracket>(`/zones/${zoneId}/brackets`, {
    min_kg: payload.min_kg,
    max_kg: payload.max_kg ?? null,

    pricing_mode: payload.pricing_mode,

    // 允许为 null（由后端/DB 约束决定哪些模式必须填）
    flat_amount: payload.flat_amount ?? null,
    base_amount: payload.base_amount ?? null,
    rate_per_kg: payload.rate_per_kg ?? null,
    base_kg: payload.base_kg ?? null,

    active: payload.active ?? true,
  });
}

export async function patchZoneBracket(
  bracketId: number,
  payload: Partial<{
    min_kg: number;
    max_kg: number | null;

    pricing_mode: PricingMode;

    // flat
    flat_amount: number | null;

    // linear_total / step_over
    base_amount: number | null;
    rate_per_kg: number | null;

    // step_over
    base_kg: number | null;

    active: boolean;
  }>,
): Promise<PricingSchemeZoneBracket> {
  return apiPatch<PricingSchemeZoneBracket>(`/zone-brackets/${bracketId}`, payload);
}

export async function deleteZoneBracket(bracketId: number): Promise<{ ok: boolean }> {
  return apiDelete<{ ok: boolean }>(`/zone-brackets/${bracketId}`);
}
