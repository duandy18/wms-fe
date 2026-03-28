// src/features/admin/stores/api.ts
import { apiGet, apiPost, apiPatch, apiDelete, apiPut } from "../../../lib/api";
import { assertOk } from "../../../lib/assertOk";

import type {
  StoreListResponse,
  StoreDetailResponse,
  StoreCreatePayload,
  StoreUpdatePayload,
  BindWarehousePayload,
  UpdateBindingPayload,
  DefaultWarehouseResponse,
} from "./types";

type OkEnvelope<T> = { ok: boolean; data: T };

export async function fetchStores() {
  const resp = await apiGet<StoreListResponse>("/oms/stores");
  // 保持返回结构不变，但合同失败直接抛错
  assertOk(resp as unknown as OkEnvelope<unknown>, "GET /oms/stores");
  return resp;
}

export async function fetchStoreDetail(storeId: number) {
  const resp = await apiGet<StoreDetailResponse>(`/oms/stores/${storeId}`);
  assertOk(resp as unknown as OkEnvelope<unknown>, "GET /oms/stores/{store_id}");
  return resp;
}

export async function createStore(payload: StoreCreatePayload) {
  const resp = await apiPost<StoreDetailResponse>("/oms/stores", payload);
  assertOk(resp as unknown as OkEnvelope<unknown>, "POST /oms/stores");
  return resp;
}

export async function updateStore(storeId: number, payload: StoreUpdatePayload) {
  const resp = await apiPatch<StoreDetailResponse>(`/oms/stores/${storeId}`, payload);
  assertOk(resp as unknown as OkEnvelope<unknown>, "PATCH /oms/stores/{store_id}");
  return resp;
}

export async function bindWarehouse(storeId: number, payload: BindWarehousePayload) {
  // 后端通常仍是 { ok, data }，这里用 envelope 护栏，不改变调用方行为
  const resp = await apiPost<OkEnvelope<Record<string, unknown>>>(
    `/oms/stores/${storeId}/warehouses/bind`,
    payload,
  );
  assertOk(resp, "POST /oms/stores/{store_id}/warehouses/bind");
  return resp;
}

export async function updateBinding(
  storeId: number,
  warehouseId: number,
  payload: UpdateBindingPayload,
) {
  const resp = await apiPatch<OkEnvelope<Record<string, unknown>>>(
    `/oms/stores/${storeId}/warehouses/${warehouseId}`,
    payload,
  );
  assertOk(resp, "PATCH /oms/stores/{store_id}/warehouses/{warehouse_id}");
  return resp;
}

export async function deleteBinding(storeId: number, warehouseId: number) {
  const resp = await apiDelete<OkEnvelope<Record<string, unknown>>>(
    `/oms/stores/${storeId}/warehouses/${warehouseId}`,
  );
  assertOk(resp, "DELETE /oms/stores/{store_id}/warehouses/{warehouse_id}");
  return resp;
}

export async function fetchDefaultWarehouse(storeId: number) {
  const resp = await apiGet<DefaultWarehouseResponse>(
    `/oms/stores/${storeId}/default-warehouse`,
  );
  assertOk(
    resp as unknown as OkEnvelope<unknown>,
    "GET /oms/stores/{store_id}/default-warehouse",
  );
  return resp;
}

// ================================
// 订单模拟：商家清单 / 填写码候选
// ================================

export type OrderSimFilledCodeOption = {
  filled_code: string;
  suggested_title: string;
  components_summary: string;
};

type OrderSimFilledCodeOptionsEnvelope = {
  ok: boolean;
  data: { items: OrderSimFilledCodeOption[] };
};

export async function fetchOrderSimFilledCodeOptions(
  storeId: number,
): Promise<OrderSimFilledCodeOption[]> {
  const resp = await apiGet<OrderSimFilledCodeOptionsEnvelope>(
    `/oms/stores/${storeId}/order-sim/filled-code-options`,
  );
  const out = assertOk(resp, "GET /oms/stores/{store_id}/order-sim/filled-code-options");
  return out.items;
}

export type OrderSimMerchantLineRow = {
  row_no: number;
  filled_code: string | null;
  title: string | null;
  spec: string | null;
  version: number;
  updated_at: string | null;
};

type OrderSimMerchantLinesEnvelope = {
  ok: boolean;
  data: { store_id: number; items: OrderSimMerchantLineRow[] };
};

export async function fetchOrderSimMerchantLines(
  storeId: number,
): Promise<OrderSimMerchantLineRow[]> {
  const resp = await apiGet<OrderSimMerchantLinesEnvelope>(
    `/oms/stores/${storeId}/order-sim/merchant-lines`,
  );
  const out = assertOk(resp, "GET /oms/stores/{store_id}/order-sim/merchant-lines");
  return out.items;
}

export type OrderSimMerchantLinePutItem = {
  row_no: number;
  filled_code?: string | null;
  title?: string | null;
  spec?: string | null;
  if_version?: number | null;
};

type OrderSimMerchantLinesPutIn = { items: OrderSimMerchantLinePutItem[] };

export async function putOrderSimMerchantLines(
  storeId: number,
  payload: OrderSimMerchantLinesPutIn,
): Promise<OrderSimMerchantLineRow[]> {
  const resp = await apiPut<OrderSimMerchantLinesEnvelope>(
    `/oms/stores/${storeId}/order-sim/merchant-lines`,
    payload,
  );
  const out = assertOk(resp, "PUT /oms/stores/{store_id}/order-sim/merchant-lines");
  return out.items;
}

// ================================
// 订单模拟：客户购物车（cart）+ 地址
// ================================

// ✅ 契约：qty 永远为 integer（未勾选行用 0），不传 null
export type OrderSimCartRow = {
  row_no: number;
  checked: boolean;
  qty: number;
  version: number;
  updated_at: string | null;
};

type OrderSimCartEnvelope = {
  ok: boolean;
  data: {
    store_id: number;
    province: string | null;
    city: string | null;
    items: OrderSimCartRow[];
  };
};

export type OrderSimCartPutItem = {
  row_no: number;
  checked: boolean;
  qty: number;
  if_version?: number | null;
};

type OrderSimCartPutIn = {
  province: string | null;
  city: string | null;
  items: OrderSimCartPutItem[];
};

export async function fetchOrderSimCart(
  storeId: number,
): Promise<{ province: string | null; city: string | null; items: OrderSimCartRow[] }> {
  const resp = await apiGet<OrderSimCartEnvelope>(`/oms/stores/${storeId}/order-sim/cart`);
  const out = assertOk(resp, "GET /oms/stores/{store_id}/order-sim/cart");
  return { province: out.province ?? null, city: out.city ?? null, items: out.items };
}

export async function putOrderSimCart(
  storeId: number,
  payload: OrderSimCartPutIn,
): Promise<{ province: string | null; city: string | null; items: OrderSimCartRow[] }> {
  const resp = await apiPut<OrderSimCartEnvelope>(`/oms/stores/${storeId}/order-sim/cart`, payload);
  const out = assertOk(resp, "PUT /oms/stores/{store_id}/order-sim/cart");
  return { province: out.province ?? null, city: out.city ?? null, items: out.items };
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
  const resp = await apiGet<ProvinceRoutesEnvelope>(`/oms/stores/${storeId}/routes/provinces`);
  return assertOk(resp, "GET /oms/stores/{store_id}/routes/provinces");
}

type RouteWriteOut = { ok: boolean; data: { id: number | null } };

export async function createProvinceRoute(
  storeId: number,
  payload: { province: string; warehouse_id: number; priority: number; active: boolean },
): Promise<{ id: number | null }> {
  const resp = await apiPost<RouteWriteOut>(`/oms/stores/${storeId}/routes/provinces`, payload);
  return assertOk(resp, "POST /oms/stores/{store_id}/routes/provinces");
}

export async function updateProvinceRoute(
  storeId: number,
  routeId: number,
  payload: Partial<{ province: string; warehouse_id: number; priority: number; active: boolean }>,
): Promise<{ id: number | null }> {
  const resp = await apiPatch<RouteWriteOut>(
    `/oms/stores/${storeId}/routes/provinces/${routeId}`,
    payload,
  );
  return assertOk(resp, "PATCH /oms/stores/{store_id}/routes/provinces/{route_id}");
}

export async function deleteProvinceRoute(
  storeId: number,
  routeId: number,
): Promise<{ id: number | null }> {
  const resp = await apiDelete<RouteWriteOut>(
    `/oms/stores/${storeId}/routes/provinces/${routeId}`,
  );
  return assertOk(resp, "DELETE /oms/stores/{store_id}/routes/provinces/{route_id}");
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
  const resp = await apiGet<RoutingHealthEnvelope>(`/oms/stores/${storeId}/routing/health`);
  return assertOk(resp, "GET /oms/stores/{store_id}/routing/health");
}
