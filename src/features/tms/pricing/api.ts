// src/features/tms/pricing/api.ts

import { apiGet, apiPost, apiPatch } from "../../../lib/api";
import type { PricingListResponse } from "./types";

export async function fetchPricingList(): Promise<PricingListResponse> {
  return await apiGet<PricingListResponse>("/tms/pricing/list");
}

// 绑定
export async function bindPricing(
  providerId: number,
  warehouseId: number,
): Promise<void> {
  await apiPost("/tms/pricing/bindings", {
    provider_id: providerId,
    warehouse_id: warehouseId,
    priority: 0,
  });
}

// 更新（启停 / priority）
export async function updatePricingBinding(
  providerId: number,
  warehouseId: number,
  payload: { active?: boolean; priority?: number },
): Promise<void> {
  await apiPatch(
    `/tms/pricing/bindings/${providerId}/${warehouseId}`,
    payload,
  );
}
