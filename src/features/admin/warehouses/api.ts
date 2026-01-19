// src/features/admin/warehouses/api.ts
import { apiGet, apiPost, apiPatch, apiPut } from "../../../lib/api";
import type {
  WarehouseListResponse,
  WarehouseCreatePayload,
  WarehouseUpdatePayload,
  WarehouseListItem,
  WarehouseDetailResponse,
  WarehouseServiceProvinces,
  WarehouseServiceProvincesPutIn,
  WarehouseServiceProvinceOccupancyOut,
  WarehouseServiceCities,
  WarehouseServiceCitiesPutIn,
  WarehouseServiceCityOccupancyOut,
  WarehouseServiceCitySplitProvincesOut,
  WarehouseServiceCitySplitProvincesPutIn,
} from "./types";

function unwrapOk<T>(resp: unknown, op: string): T {
  const r = resp as { ok?: unknown; data?: unknown };
  if (!r || r.ok !== true) throw new Error(`后端合同失败：${op}`);
  return r.data as T;
}

export async function fetchWarehouses(): Promise<WarehouseListResponse> {
  return apiGet<WarehouseListResponse>("/warehouses");
}

export async function fetchActiveWarehouses(): Promise<WarehouseListItem[]> {
  const res = await apiGet<WarehouseListResponse>("/warehouses?active=true");
  return unwrapOk<WarehouseListItem[]>(res, "GET /warehouses?active=true");
}

export async function createWarehouse(payload: WarehouseCreatePayload): Promise<WarehouseListItem> {
  const res = await apiPost<WarehouseDetailResponse>("/warehouses", payload);
  return unwrapOk<WarehouseListItem>(res, "POST /warehouses");
}

export async function updateWarehouse(
  warehouseId: number,
  payload: WarehouseUpdatePayload,
): Promise<WarehouseListItem> {
  const res = await apiPatch<WarehouseDetailResponse>(`/warehouses/${warehouseId}`, payload);
  return unwrapOk<WarehouseListItem>(res, "PATCH /warehouses/{warehouse_id}");
}

export async function fetchWarehouseDetail(warehouseId: number): Promise<WarehouseListItem> {
  const res = await apiGet<WarehouseDetailResponse>(`/warehouses/${warehouseId}`);
  return unwrapOk<WarehouseListItem>(res, "GET /warehouses/{warehouse_id}");
}

// ---------------------------
// 服务省份（唯一）
// ---------------------------
export async function fetchWarehouseServiceProvinces(
  warehouseId: number,
): Promise<WarehouseServiceProvinces> {
  return apiGet<WarehouseServiceProvinces>(`/warehouses/${warehouseId}/service-provinces`);
}

export async function putWarehouseServiceProvinces(
  warehouseId: number,
  payload: WarehouseServiceProvincesPutIn,
): Promise<WarehouseServiceProvinces> {
  return apiPut<WarehouseServiceProvinces>(`/warehouses/${warehouseId}/service-provinces`, payload);
}

export async function fetchWarehouseServiceProvinceOccupancy(): Promise<WarehouseServiceProvinceOccupancyOut> {
  return apiGet<WarehouseServiceProvinceOccupancyOut>("/warehouses/service-provinces/occupancy");
}

// ---------------------------
// 服务城市（唯一）
// ---------------------------
export async function fetchWarehouseServiceCities(warehouseId: number): Promise<WarehouseServiceCities> {
  return apiGet<WarehouseServiceCities>(`/warehouses/${warehouseId}/service-cities`);
}

export async function putWarehouseServiceCities(
  warehouseId: number,
  payload: WarehouseServiceCitiesPutIn,
): Promise<WarehouseServiceCities> {
  return apiPut<WarehouseServiceCities>(`/warehouses/${warehouseId}/service-cities`, payload);
}

export async function fetchWarehouseServiceCityOccupancy(): Promise<WarehouseServiceCityOccupancyOut> {
  return apiGet<WarehouseServiceCityOccupancyOut>("/warehouses/service-cities/occupancy");
}

// ---------------------------
// 省份按城市细分（全局开关）
// ---------------------------
export async function fetchWarehouseServiceCitySplitProvinces(): Promise<WarehouseServiceCitySplitProvincesOut> {
  return apiGet<WarehouseServiceCitySplitProvincesOut>("/warehouses/service-provinces/city-split");
}

export async function putWarehouseServiceCitySplitProvinces(
  payload: WarehouseServiceCitySplitProvincesPutIn,
): Promise<WarehouseServiceCitySplitProvincesOut> {
  return apiPut<WarehouseServiceCitySplitProvincesOut>("/warehouses/service-provinces/city-split", payload);
}
