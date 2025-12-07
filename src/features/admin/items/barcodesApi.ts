// src/features/admin/items/barcodesApi.ts
// 条码管理相关 API 封装
// 对应后端 app/api/routers/item_barcodes.py：
//  - POST   /item-barcodes              创建条码
//  - GET    /item-barcodes/item/{id}    按商品读取条码列表
//  - POST   /item-barcodes/{id}/set-primary  设为主条码
//  - PATCH  /item-barcodes/{id}         更新条码（暂未在前端使用）
//  - DELETE /item-barcodes/{id}         删除条码

import { apiGet, apiPost, apiDelete } from "../../../lib/api";

export interface ItemBarcode {
  id: number;
  item_id: number;
  barcode: string;
  kind: string;
  active: boolean;
  is_primary?: boolean;
  created_at?: string;
  updated_at?: string;
}

/** 按 item_id 获取条码列表 */
export async function fetchItemBarcodes(
  itemId: number,
): Promise<ItemBarcode[]> {
  if (!itemId || itemId <= 0) throw new Error("invalid item_id");
  return apiGet<ItemBarcode[]>(`/item-barcodes/item/${itemId}`);
}

/** 新增条码 */
export async function createItemBarcode(params: {
  item_id: number;
  barcode: string;
  kind?: string;
  active?: boolean;
}): Promise<ItemBarcode> {
  const { item_id, barcode, kind, active } = params;
  if (!item_id) throw new Error("invalid item_id");
  const code = barcode.trim();
  if (!code) throw new Error("barcode required");

  return apiPost<ItemBarcode>("/item-barcodes", {
    item_id,
    barcode: code,
    kind: kind || "CUSTOM",
    active: active ?? true,
  });
}

/** 删除条码 */
export async function deleteItemBarcode(id: number): Promise<void> {
  if (!id || id <= 0) throw new Error("invalid id");
  await apiDelete(`/item-barcodes/${id}`);
}

/** 设置主条码（对应后端 /{id}/set-primary） */
export async function setPrimaryBarcode(id: number): Promise<void> {
  if (!id || id <= 0) throw new Error("invalid id");
  await apiPost(`/item-barcodes/${id}/set-primary`, {});
}
