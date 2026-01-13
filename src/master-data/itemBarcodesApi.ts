// src/master-data/itemBarcodesApi.ts
// 公共条码 API（master-data 层，供采购/入库/主数据等共用）
//
// 对应后端 app/api/routers/item_barcodes.py：
//  - POST   /item-barcodes                   创建条码
//  - GET    /item-barcodes/item/{id}         按商品读取条码列表
//  - GET    /item-barcodes/by-items          按 item_ids 批量读取条码（避免 N+1）
//  - POST   /item-barcodes/{id}/set-primary  设为主条码
//  - DELETE /item-barcodes/{id}              删除条码

import { apiDelete, apiGet, apiPost } from "../lib/api";

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
export async function fetchItemBarcodes(itemId: number): Promise<ItemBarcode[]> {
  if (!itemId || itemId <= 0) throw new Error("invalid item_id");
  return apiGet<ItemBarcode[]>(`/item-barcodes/item/${itemId}`);
}

/**
 * 批量读取条码（避免 N+1）
 * - activeOnly 默认 true：与后端默认一致（只返回 active=true）
 * - 返回扁平数组，前端按 item_id 分组即可
 */
export async function fetchBarcodesByItems(
  itemIds: number[],
  activeOnly: boolean = true,
): Promise<ItemBarcode[]> {
  const ids = (itemIds || [])
    .map((x) => Number(x))
    .filter((x) => Number.isFinite(x) && x > 0);

  if (ids.length === 0) return [];

  // 注意：这里保持与你当前 admin/barcodesApi.ts 完全一致的参数形式
  return apiGet<ItemBarcode[]>("/item-barcodes/by-items", {
    item_id: ids, // item_id=1&item_id=2...
    active_only: activeOnly,
  });
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
