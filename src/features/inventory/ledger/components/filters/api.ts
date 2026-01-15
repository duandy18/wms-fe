// src/features/inventory/ledger/components/filters/api.ts
import { apiGet } from "../../../../../lib/api";

export type WarehouseOut = {
  id: number;
  name: string;
  code: string | null;
  active: boolean;
};

export type WarehouseListOut = {
  ok?: boolean;
  data: WarehouseOut[];
};

export type ItemOut = {
  id: number;
  sku: string;
  name: string;
};

export async function fetchActiveWarehouses(): Promise<WarehouseOut[]> {
  const res = await apiGet<WarehouseListOut>("/warehouses?active=true");
  if (!res || !Array.isArray(res.data)) {
    throw new Error("后端合同不一致：GET /warehouses 必须返回 { data: WarehouseOut[] }");
  }
  return res.data;
}

export async function fetchItems(): Promise<ItemOut[]> {
  const res = await apiGet<ItemOut[]>("/items");
  if (!Array.isArray(res)) {
    throw new Error("后端合同不一致：GET /items 必须返回 ItemOut[] 数组");
  }
  return res;
}
