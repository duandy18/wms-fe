// src/features/admin/shipping-providers/api/brackets/index.ts
import { apiPost, apiPatch, apiDelete } from "../../../../../lib/api";
import type { PricingSchemeZoneBracket } from "../../api/types";
import type { CreateZoneBracketPayload, PatchZoneBracketPayload } from "./types";

export async function createZoneBracket(
  zoneId: number,
  payload: CreateZoneBracketPayload,
): Promise<PricingSchemeZoneBracket> {
  return apiPost<PricingSchemeZoneBracket>(`/zones/${zoneId}/brackets`, {
    min_kg: payload.min_kg,
    max_kg: payload.max_kg ?? null,

    pricing_mode: payload.pricing_mode,

    flat_amount: payload.flat_amount ?? null,
    base_amount: payload.base_amount ?? null,
    rate_per_kg: payload.rate_per_kg ?? null,
    base_kg: payload.base_kg ?? null,

    active: payload.active ?? true,
  });
}

export async function patchZoneBracket(
  bracketId: number,
  payload: PatchZoneBracketPayload,
): Promise<PricingSchemeZoneBracket> {
  return apiPatch<PricingSchemeZoneBracket>(`/zone-brackets/${bracketId}`, payload);
}

export async function deleteZoneBracket(bracketId: number): Promise<{ ok: boolean }> {
  return apiDelete<{ ok: boolean }>(`/zone-brackets/${bracketId}`);
}
