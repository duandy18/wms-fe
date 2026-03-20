// src/features/tms/pricing/api.ts

import { apiDelete, apiGet, apiPatch, apiPost } from "../../../lib/api";
import type {
  PricingSchemeDetail,
  SchemeDetailResponse,
} from "../providers/api/types";
import type { PricingListResponse } from "./types";

type ListResponse<T> = {
  ok: boolean;
  data: T[];
};

type OneResponse<T> = {
  ok: boolean;
  data: T;
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

export type PricingSchemeCreateResult = {
  id: number;
  shipping_provider_id: number;
  warehouse_id?: number;
  name: string;
  status?: string;
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

// 建立 provider × warehouse 服务关系。
// 当前后端合同仍接受 priority；这里只在 API 内部兼容，不向页面层暴露。
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

export async function setPricingBindingActive(
  providerId: number,
  warehouseId: number,
  active: boolean,
): Promise<void> {
  await apiPatch(`/tms/pricing/bindings/${providerId}/${warehouseId}`, {
    active,
  });
}

// 当前后端创建合同仍挂在 provider 路径上；
// 这里统一封装到 pricing 主线，页面层不再直接依赖 providers/api/schemes。
export async function createPricingSchemeForBinding(args: {
  providerId: number;
  warehouseId: number;
  name: string;
  currency?: string;
}): Promise<PricingSchemeCreateResult> {
  const res = await apiPost<OneResponse<PricingSchemeCreateResult>>(
    `/shipping-providers/${args.providerId}/pricing-schemes`,
    {
      warehouse_id: args.warehouseId,
      name: args.name,
      currency: args.currency ?? "CNY",
    },
  );
  return res.data;
}

// ===== Scheme by id：统一收口到 Pricing 主线 =====

export async function fetchPricingSchemeDetail(
  schemeId: number,
): Promise<PricingSchemeDetail> {
  const res = await apiGet<SchemeDetailResponse>(`/pricing-schemes/${schemeId}`);
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
  const res = await apiPatch<SchemeDetailResponse>(
    `/pricing-schemes/${schemeId}`,
    payload,
  );
  return res.data;
}

export async function publishPricingScheme(
  schemeId: number,
): Promise<PricingSchemeDetail> {
  const res = await apiPost<SchemeDetailResponse>(
    `/pricing-schemes/${schemeId}/publish`,
    {},
  );
  return res.data;
}

export async function clonePricingScheme(
  schemeId: number,
): Promise<PricingSchemeDetail> {
  const res = await apiPost<SchemeDetailResponse>(
    `/pricing-schemes/${schemeId}/clone`,
    {},
  );
  return res.data;
}

export async function deletePricingScheme(
  schemeId: number,
): Promise<{ ok: boolean }> {
  return apiDelete<{ ok: boolean }>(`/pricing-schemes/${schemeId}`);
}
