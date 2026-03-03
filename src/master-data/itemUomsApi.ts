// src/master-data/itemUomsApi.ts
import { apiGet, apiPost, apiPatch, apiDelete } from "../lib/api";

export type ItemUom = {
  id: number;
  item_id: number;

  uom: string;
  ratio_to_base: number;

  display_name: string | null;

  is_base: boolean;
  is_purchase_default: boolean;
  is_inbound_default: boolean;
  is_outbound_default: boolean;

  created_at?: string;
  updated_at?: string;
};

export type ItemUomCreateInput = {
  item_id: number;
  uom: string;
  ratio_to_base: number;
  display_name?: string | null;

  is_base?: boolean;
  is_purchase_default?: boolean;
  is_inbound_default?: boolean;
  is_outbound_default?: boolean;
};

export type ItemUomUpdateInput = Partial<ItemUomCreateInput>;

// -----------------------------
// 单个 item 查询
// -----------------------------
export async function fetchItemUoms(itemId: number): Promise<ItemUom[]> {
  return apiGet<ItemUom[]>(`/item-uoms/item/${itemId}`);
}

// -----------------------------
// 批量查询（避免 N+1）
// GET /item-uoms/by-items?item_id=1&item_id=2
// -----------------------------
export async function fetchItemUomsByItems(itemIds: number[]): Promise<ItemUom[]> {
  const ids = itemIds.filter((x) => Number.isFinite(x) && x > 0);
  if (ids.length === 0) return [];

  const qs = new URLSearchParams();
  for (const id of ids) qs.append("item_id", String(id));

  return apiGet<ItemUom[]>(`/item-uoms/by-items?${qs.toString()}`);
}

// -----------------------------
// 创建
// -----------------------------
export async function createItemUom(payload: ItemUomCreateInput): Promise<ItemUom> {
  return apiPost<ItemUom>("/item-uoms", payload);
}

// -----------------------------
// 更新
// -----------------------------
export async function updateItemUom(id: number, payload: ItemUomUpdateInput): Promise<ItemUom> {
  return apiPatch<ItemUom>(`/item-uoms/${id}`, payload);
}

// -----------------------------
// 删除
// -----------------------------
export async function deleteItemUom(id: number): Promise<{ ok: boolean }> {
  return apiDelete<{ ok: boolean }>(`/item-uoms/${id}`);
}
