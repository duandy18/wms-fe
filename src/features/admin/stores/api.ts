// src/features/admin/stores/api.ts
import { apiGet, apiPost, apiPatch, apiDelete } from "../../../lib/api";
import type {
  StoreListResponse,
  StoreDetailResponse,
  StoreCreatePayload,
  StoreUpdatePayload,
  BindWarehousePayload,
  UpdateBindingPayload,
  DefaultWarehouseResponse,
  StorePlatformAuthStatus,
} from "./types";

export async function fetchStores() {
  return apiGet<StoreListResponse>("/stores");
}

export async function fetchStoreDetail(storeId: number) {
  return apiGet<StoreDetailResponse>(`/stores/${storeId}`);
}

export async function createStore(payload: StoreCreatePayload) {
  return apiPost<StoreDetailResponse>("/stores", payload);
}

export async function updateStore(storeId: number, payload: StoreUpdatePayload) {
  return apiPatch<StoreDetailResponse>(`/stores/${storeId}`, payload);
}

export async function bindWarehouse(
  storeId: number,
  payload: BindWarehousePayload,
) {
  return apiPost(`/stores/${storeId}/warehouses/bind`, payload);
}

export async function updateBinding(
  storeId: number,
  warehouseId: number,
  payload: UpdateBindingPayload,
) {
  return apiPatch(`/stores/${storeId}/warehouses/${warehouseId}`, payload);
}

export async function deleteBinding(storeId: number, warehouseId: number) {
  return apiDelete(`/stores/${storeId}/warehouses/${warehouseId}`);
}

export async function fetchDefaultWarehouse(storeId: number) {
  return apiGet<DefaultWarehouseResponse>(
    `/stores/${storeId}/default-warehouse`,
  );
}

// /stores/{store_id}/platform-auth：后端返回 { ok, data }
export async function fetchStorePlatformAuth(
  storeId: number,
): Promise<StorePlatformAuthStatus> {
  const resp = await apiGet<{ ok: boolean; data: StorePlatformAuthStatus }>(
    `/stores/${storeId}/platform-auth`,
  );
  return resp.data;
}

// 手工录入 / 更新平台凭据：POST /platform-shops/credentials
export async function saveStorePlatformCredentials(input: {
  platform: string;
  shopId: string;
  accessToken: string;
}) {
  return apiPost("/platform-shops/credentials", {
    platform: input.platform,
    shop_id: input.shopId,
    access_token: input.accessToken,
    status: "ACTIVE",
  });
}
