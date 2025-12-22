// src/features/admin/warehouses/api.ts
import { apiGet, apiPost, apiPatch } from "../../../lib/api";
import type {
  WarehouseListResponse,
  WarehouseCreatePayload,
  WarehouseUpdatePayload,
  WarehouseListItem,
  WarehouseDetailResponse,
} from "./types";

export async function fetchWarehouses(): Promise<WarehouseListResponse> {
  return apiGet<WarehouseListResponse>("/warehouses");
}

export async function fetchActiveWarehouses(): Promise<WarehouseListItem[]> {
  const res = await apiGet<WarehouseListResponse>("/warehouses?active=true");
  return res.data;
}

export async function createWarehouse(
  payload: WarehouseCreatePayload,
): Promise<WarehouseListItem> {
  const res = await apiPost<WarehouseDetailResponse>("/warehouses", payload);
  return res.data;
}

export async function updateWarehouse(
  warehouseId: number,
  payload: WarehouseUpdatePayload,
): Promise<WarehouseListItem> {
  const res = await apiPatch<WarehouseDetailResponse>(
    `/warehouses/${warehouseId}`,
    payload,
  );
  return res.data;
}

export async function fetchWarehouseDetail(
  warehouseId: number,
): Promise<WarehouseListItem> {
  const res = await apiGet<WarehouseDetailResponse>(
    `/warehouses/${warehouseId}`,
  );
  return res.data;
}
