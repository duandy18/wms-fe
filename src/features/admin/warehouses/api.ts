// src/features/admin/warehouses/api.ts
import { apiGet, apiPost, apiPatch } from "../../../lib/api";
import type {
  WarehouseListResponse,
  WarehouseCreatePayload,
  WarehouseUpdatePayload,
  WarehouseListItem,
  WarehouseDetailResponse,
} from "./types";

// GET /warehouses
// 用于仓库管理列表：保留 {ok, data} 结构，方便分页/过滤时扩展
export async function fetchWarehouses(): Promise<WarehouseListResponse> {
  return apiGet<WarehouseListResponse>("/warehouses");
}

// GET /warehouses?active=true
// 用于店铺绑定下拉：只返回 data（纯数组），组件拿来直接渲染
export async function fetchActiveWarehouses(): Promise<WarehouseListItem[]> {
  const res = await apiGet<WarehouseListResponse>("/warehouses?active=true");
  return res.data;
}

// POST /warehouses
// 返回创建后的仓库对象（已 unwrap data）
export async function createWarehouse(
  payload: WarehouseCreatePayload,
): Promise<WarehouseListItem> {
  const res = await apiPost<WarehouseDetailResponse>("/warehouses", payload);
  return res.data;
}

// PATCH /warehouses/{id}
// 返回更新后的仓库对象（已 unwrap data）
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

// GET /warehouses/{id}
// 返回单个仓库详情（已 unwrap data）
export async function fetchWarehouseDetail(
  warehouseId: number,
): Promise<WarehouseListItem> {
  const res = await apiGet<WarehouseDetailResponse>(
    `/warehouses/${warehouseId}`,
  );
  return res.data;
}
