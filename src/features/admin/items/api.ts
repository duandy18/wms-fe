// src/features/admin/items/api.ts
import { apiGet, apiPost, apiPatch } from "../../../lib/api";

export interface Item {
  id: number;
  sku: string;
  name: string;
  spec?: string | null;
  uom?: string | null;
  barcode?: string | null;
  enabled: boolean;
  supplier_id?: number | null;
  supplier_name?: string | null;
  created_at?: string | null;
  updated_at?: string | null;

  // ⭐ 新增：单件净重（kg）
  weight_kg?: number | null;
}

export interface ItemCreateInput {
  sku: string;
  name: string;
  spec?: string | null;
  uom?: string | null;
  barcode?: string | null;
  enabled?: boolean;
  supplier_id?: number | null;

  weight_kg?: number | null;
}

export interface ItemUpdateInput {
  name?: string | null;
  spec?: string | null;
  uom?: string | null;
  enabled?: boolean;
  supplier_id?: number | null;

  weight_kg?: number | null;
}

// 获取所有商品
export async function fetchItems(): Promise<Item[]> {
  return apiGet<Item[]>("/items");
}

// 创建商品（按 SKU）
export async function createItem(input: ItemCreateInput): Promise<Item> {
  const body: any = {
    sku: input.sku.trim(),
    name: input.name.trim(),
    spec: input.spec?.trim() || undefined,
    uom: input.uom?.trim() || undefined,
    barcode: input.barcode?.trim() || undefined,
    enabled: input.enabled ?? true,
  };
  if (input.supplier_id !== undefined) {
    body.supplier_id = input.supplier_id;
  }
  if (input.weight_kg !== undefined && input.weight_kg !== null) {
    body.weight_kg = input.weight_kg;
  }
  return apiPost<Item>("/items", body);
}

// 更新商品（名称 / 规格 / 单位 / 启用 / 供应商 / 重量）
export async function updateItem(
  id: number,
  input: ItemUpdateInput,
): Promise<Item> {
  const body: any = {};
  if (input.name !== undefined) {
    body.name = input.name?.trim() || "";
  }
  if (input.spec !== undefined) {
    body.spec = input.spec?.trim() || null;
  }
  if (input.uom !== undefined) {
    body.uom = input.uom?.trim() || null;
  }
  if (input.enabled !== undefined) {
    body.enabled = input.enabled;
  }
  if (input.supplier_id !== undefined) {
    body.supplier_id = input.supplier_id;
  }
  if (input.weight_kg !== undefined) {
    body.weight_kg = input.weight_kg;
  }
  return apiPatch<Item>(`/items/${id}`, body);
}
