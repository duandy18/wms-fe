// src/features/tms/pricing/api.ts

import { apiGet, apiPatch, apiPost } from "../../../lib/api";
import type {
  PricingBindingTemplateCandidate,
  PricingListResponse,
} from "./types";

type ListResponse<T> = {
  ok: boolean;
  data: T[];
};

type ShippingProviderLite = {
  id: number;
  name: string;
  code?: string | null;
  active?: boolean;
};

export type PricingProviderOption = {
  provider_id: number;
  provider_name: string;
  provider_code: string;
  provider_active: boolean;
};

export type PricingBindingRef = {
  warehouseId: number;
  providerId: number;
};

export type CreatePricingBindingInput = PricingBindingRef & {
  active?: boolean;
  activeTemplateId?: number;
};

export type PricingBindingUpdatePayload = PricingBindingRef & {
  active?: boolean;
  activeTemplateId?: number;
};

export type ActivatePricingBindingInput = PricingBindingRef & {
  effectiveFrom?: string | null;
};

export async function fetchPricingList(): Promise<PricingListResponse> {
  return await apiGet<PricingListResponse>("/tms/pricing/list");
}

export async function fetchPricingProviderOptions(): Promise<
  PricingProviderOption[]
> {
  const res = await apiGet<ListResponse<ShippingProviderLite>>(
    "/shipping-providers",
  );
  const providers = Array.isArray(res?.data) ? res.data : [];

  return providers
    .map((item) => ({
      provider_id: item.id,
      provider_name: item.name,
      provider_code: String(item.code ?? ""),
      provider_active: Boolean(item.active),
    }))
    .sort((a, b) => {
      const aInactive = a.provider_active ? 0 : 1;
      const bInactive = b.provider_active ? 0 : 1;
      if (aInactive !== bInactive) return aInactive - bInactive;

      const byCode = a.provider_code.localeCompare(b.provider_code, "zh-CN");
      if (byCode !== 0) return byCode;

      return a.provider_name.localeCompare(b.provider_name, "zh-CN");
    });
}

export async function bindPricing({
  warehouseId,
  providerId,
  active = false,
  activeTemplateId,
}: CreatePricingBindingInput): Promise<void> {
  await apiPost(`/tms/pricing/warehouses/${warehouseId}/bindings`, {
    shipping_provider_id: providerId,
    active,
    priority: 0,
    active_template_id: activeTemplateId,
  });
}

export async function updatePricingBinding({
  warehouseId,
  providerId,
  active,
  activeTemplateId,
}: PricingBindingUpdatePayload): Promise<void> {
  const payload: {
    active?: boolean;
    active_template_id?: number;
  } = {};

  if (typeof active === "boolean") {
    payload.active = active;
  }
  if (typeof activeTemplateId === "number") {
    payload.active_template_id = activeTemplateId;
  }

  await apiPatch(
    `/tms/pricing/warehouses/${warehouseId}/bindings/${providerId}`,
    payload,
  );
}

export async function activatePricingBinding({
  warehouseId,
  providerId,
  effectiveFrom,
}: ActivatePricingBindingInput): Promise<void> {
  await apiPost(
    `/tms/pricing/warehouses/${warehouseId}/bindings/${providerId}/activate`,
    {
      effective_from: effectiveFrom ?? null,
    },
  );
}

export async function deactivatePricingBinding({
  warehouseId,
  providerId,
}: PricingBindingRef): Promise<void> {
  await apiPost(
    `/tms/pricing/warehouses/${warehouseId}/bindings/${providerId}/deactivate`,
    {},
  );
}

export async function fetchPricingBindingTemplateCandidates({
  warehouseId,
  providerId,
}: PricingBindingRef): Promise<PricingBindingTemplateCandidate[]> {
  const res = await apiGet<ListResponse<PricingBindingTemplateCandidate>>(
    `/tms/pricing/warehouses/${warehouseId}/bindings/${providerId}/template-candidates`,
  );
  return Array.isArray(res?.data) ? res.data : [];
}
