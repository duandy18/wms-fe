// src/features/admin/shipping-providers/api/surcharges.ts
import { apiPost, apiPatch, apiDelete } from "../../../../lib/api";
import type { PricingSchemeSurcharge } from "./types";

export async function createSurcharge(
  schemeId: number,
  payload: {
    name: string;
    priority?: number;
    active?: boolean;
    condition_json: Record<string, unknown>;
    amount_json: Record<string, unknown>;
  },
): Promise<PricingSchemeSurcharge> {
  return apiPost<PricingSchemeSurcharge>(`/pricing-schemes/${schemeId}/surcharges`, {
    name: payload.name,
    priority: payload.priority ?? 100,
    active: payload.active ?? true,
    condition_json: payload.condition_json,
    amount_json: payload.amount_json,
  });
}

export async function patchSurcharge(
  surchargeId: number,
  payload: Partial<{
    name: string;
    priority: number;
    active: boolean;
    condition_json: Record<string, unknown>;
    amount_json: Record<string, unknown>;
  }>,
): Promise<PricingSchemeSurcharge> {
  return apiPatch<PricingSchemeSurcharge>(`/surcharges/${surchargeId}`, payload);
}

export async function deleteSurcharge(surchargeId: number): Promise<{ ok: boolean }> {
  return apiDelete<{ ok: boolean }>(`/surcharges/${surchargeId}`);
}
