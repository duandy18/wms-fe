// src/features/admin/stores/api.ts
import { apiGet, apiPost, apiPatch, apiDelete } from "../../../lib/api";
import { assertOk } from "../../../lib/assertOk";

import type {
  StoreListResponse,
  StoreDetailResponse,
  StoreCreatePayload,
  StoreUpdatePayload,
  BindWarehousePayload,
  UpdateBindingPayload,
  DefaultWarehouseResponse,
  StorePlatformAuthStatus,
  StoreSkuListOut,
  StoreSkuAddIn,
  StoreSkuAddOut,
  StoreSkuRemoveOut,
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

export async function bindWarehouse(storeId: number, payload: BindWarehousePayload) {
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
  return apiGet<DefaultWarehouseResponse>(`/stores/${storeId}/default-warehouse`);
}

// /stores/{store_id}/platform-auth：后端返回 { ok, data }
export async function fetchStorePlatformAuth(storeId: number): Promise<StorePlatformAuthStatus> {
  const resp = await apiGet<{ ok: boolean; data: StorePlatformAuthStatus }>(
    `/stores/${storeId}/platform-auth`,
  );
  return assertOk(resp, "GET /stores/{store_id}/platform-auth");
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

/* ================================
 * 商铺 SKU（store_items）- 新主线
 * ================================ */

export async function fetchStoreSkus(storeId: number): Promise<StoreSkuListOut> {
  // 约定：GET /stores/{store_id}/items
  // 注意：后端尚未接入时可能 404；调用方负责降级提示
  return apiGet<StoreSkuListOut>(`/stores/${storeId}/items`);
}

export async function addStoreSku(storeId: number, payload: StoreSkuAddIn): Promise<StoreSkuAddOut> {
  // 约定：POST /stores/{store_id}/items  body: { item_id }
  return apiPost<StoreSkuAddOut>(`/stores/${storeId}/items`, payload);
}

export async function removeStoreSku(storeId: number, itemId: number): Promise<StoreSkuRemoveOut> {
  // 约定：DELETE /stores/{store_id}/items/{item_id}
  return apiDelete<StoreSkuRemoveOut>(`/stores/${storeId}/items/${itemId}`);
}

// ================================
// 省级路由表（Province Routing）
// ================================

export type ProvinceRouteItem = {
  id: number;
  store_id: number;
  province: string;

  warehouse_id: number;
  warehouse_name?: string | null;
  warehouse_code?: string | null;
  warehouse_active?: boolean;

  priority: number;
  active: boolean;
};

type ProvinceRoutesEnvelope = { ok: boolean; data: ProvinceRouteItem[] };

export async function fetchProvinceRoutes(storeId: number): Promise<ProvinceRouteItem[]> {
  const resp = await apiGet<ProvinceRoutesEnvelope>(`/stores/${storeId}/routes/provinces`);
  return assertOk(resp, "GET /stores/{store_id}/routes/provinces");
}

type RouteWriteOut = { ok: boolean; data: { id: number | null } };

export async function createProvinceRoute(
  storeId: number,
  payload: { province: string; warehouse_id: number; priority: number; active: boolean },
): Promise<{ id: number | null }> {
  const resp = await apiPost<RouteWriteOut>(`/stores/${storeId}/routes/provinces`, payload);
  return assertOk(resp, "POST /stores/{store_id}/routes/provinces");
}

export async function updateProvinceRoute(
  storeId: number,
  routeId: number,
  payload: Partial<{ province: string; warehouse_id: number; priority: number; active: boolean }>,
): Promise<{ id: number | null }> {
  const resp = await apiPatch<RouteWriteOut>(
    `/stores/${storeId}/routes/provinces/${routeId}`,
    payload,
  );
  return assertOk(resp, "PATCH /stores/{store_id}/routes/provinces/{route_id}");
}

export async function deleteProvinceRoute(
  storeId: number,
  routeId: number,
): Promise<{ id: number | null }> {
  const resp = await apiDelete<RouteWriteOut>(`/stores/${storeId}/routes/provinces/${routeId}`);
  return assertOk(resp, "DELETE /stores/{store_id}/routes/provinces/{route_id}");
}

// ================================
// Routing Health
// ================================

export type StoreRoutingHealth = {
  store_id: number;
  bindings_count: number;
  default_count: number;
  routes_count: number;
  status: "OK" | "WARN" | "ERROR" | string;
  warnings: string[];
  errors: string[];
};

type RoutingHealthEnvelope = { ok: boolean; data: StoreRoutingHealth };

export async function fetchRoutingHealth(storeId: number): Promise<StoreRoutingHealth> {
  const resp = await apiGet<RoutingHealthEnvelope>(`/stores/${storeId}/routing/health`);
  return assertOk(resp, "GET /stores/{store_id}/routing/health");
}
