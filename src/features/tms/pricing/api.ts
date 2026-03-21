// src/features/tms/pricing/api.ts

import { apiGet, apiPatch, apiPost } from "../../../lib/api";
import type { PricingListResponse } from "./types";

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
