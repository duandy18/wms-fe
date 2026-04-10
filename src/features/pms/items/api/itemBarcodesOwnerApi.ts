// src/features/pms/items/api/itemBarcodesOwnerApi.ts
// PMS Items owner 条码 API（仅 owner/internal consumer 使用）
//
// 对应后端 app/pms/items/routers/item_barcodes.py：
//  - POST   /item-barcodes                    创建条码
//  - PATCH  /item-barcodes/{id}               修改条码绑定
//  - GET    /item-barcodes/item/{id}          按商品读取条码列表（裸行）
//  - GET    /item-barcodes/item/{id}/rows     按商品读取复合条码行（商品+单位+条码）
//  - GET    /item-barcodes/by-items           按 item_ids 批量读取条码（避免 N+1）
//  - POST   /item-barcodes/{id}/set-primary   设为主条码
//  - DELETE /item-barcodes/{id}               删除条码

import { apiDelete, apiGet, apiPatch, apiPost } from "../../../../lib/api";

export interface ItemBarcode {
  id: number;
  item_id: number;
  item_uom_id: number;
  barcode: string;
  symbology: string;
  active: boolean;
  is_primary?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * 商品条码页 / owner 复合读模型行：
 * - 一行 = 一个商品 + 一个包装 + 零/一条码
 * - 页面表格直接消费
 * - 前端统一做一层 normalize，避免后端 null 字段直接打穿 UI
 */
export interface ItemBarcodeCompositeRow {
  barcode_id: number;
  item_id: number;
  item_uom_id: number;

  sku: string;
  item_name: string;

  uom: string;
  display_name: string | null;
  ratio_to_base: number;
  net_weight_kg: number | null;

  is_base: boolean;
  is_purchase_default: boolean;
  is_inbound_default: boolean;
  is_outbound_default: boolean;

  barcode: string;
  symbology: string;
  is_primary: boolean;
  active: boolean;
  updated_at: string;
}

export interface RawItemBarcodeCompositeRow {
  barcode_id?: number | null;
  item_id?: number | null;
  item_uom_id?: number | null;

  sku?: string | null;
  item_name?: string | null;

  uom?: string | null;
  display_name?: string | null;
  ratio_to_base?: number | string | null;
  net_weight_kg?: number | string | null;

  is_base?: boolean | null;
  is_purchase_default?: boolean | null;
  is_inbound_default?: boolean | null;
  is_outbound_default?: boolean | null;

  barcode?: string | null;
  symbology?: string | null;
  is_primary?: boolean | null;
  active?: boolean | null;

  updated_at?: string | null;
  created_at?: string | null;
}

function toNumberOrNull(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function toRequiredNumber(value: unknown): number {
  return toNumberOrNull(value) ?? 0;
}

function toStringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function normalizeItemBarcodeCompositeRow(
  raw: RawItemBarcodeCompositeRow,
): ItemBarcodeCompositeRow {
  const barcodeId = toRequiredNumber(raw.barcode_id);
  const hasBarcode = barcodeId > 0;

  return {
    barcode_id: barcodeId,
    item_id: toRequiredNumber(raw.item_id),
    item_uom_id: toRequiredNumber(raw.item_uom_id),

    sku: toStringValue(raw.sku),
    item_name: toStringValue(raw.item_name),

    uom: toStringValue(raw.uom),
    display_name: typeof raw.display_name === "string" ? raw.display_name : null,
    ratio_to_base: toRequiredNumber(raw.ratio_to_base),
    net_weight_kg: toNumberOrNull(raw.net_weight_kg),

    is_base: Boolean(raw.is_base),
    is_purchase_default: Boolean(raw.is_purchase_default),
    is_inbound_default: Boolean(raw.is_inbound_default),
    is_outbound_default: Boolean(raw.is_outbound_default),

    barcode: toStringValue(raw.barcode),
    symbology: toStringValue(raw.symbology),
    is_primary: Boolean(raw.is_primary),
    active: hasBarcode ? raw.active ?? true : false,
    updated_at:
      typeof raw.updated_at === "string"
        ? raw.updated_at
        : typeof raw.created_at === "string"
          ? raw.created_at
          : "",
  };
}

/** 按 item_id 获取条码列表（裸行） */
export async function fetchItemBarcodes(itemId: number): Promise<ItemBarcode[]> {
  if (!itemId || itemId <= 0) throw new Error("invalid item_id");
  return apiGet<ItemBarcode[]>(`/item-barcodes/item/${itemId}`);
}

/**
 * 按 item_id 获取复合条码行：
 * - 一行 = 商品 + 单位 + 条码
 * - activeOnly 默认 false：与后端默认一致，页面治理默认看全量
 * - 这里统一 normalize，兼容未绑定条码时返回 null 的字段
 */
export async function fetchItemBarcodeRows(
  itemId: number,
  activeOnly: boolean = false,
): Promise<ItemBarcodeCompositeRow[]> {
  if (!itemId || itemId <= 0) throw new Error("invalid item_id");

  const rows = await apiGet<RawItemBarcodeCompositeRow[]>(
    `/item-barcodes/item/${itemId}/rows`,
    {
      active_only: activeOnly,
    },
  );

  return rows.map(normalizeItemBarcodeCompositeRow);
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

  return apiGet<ItemBarcode[]>("/item-barcodes/by-items", {
    item_id: ids,
    active_only: activeOnly,
  });
}

/** 新增条码（终态：绑定到 item_uom） */
export async function createItemBarcode(params: {
  item_uom_id: number;
  barcode: string;
  symbology?: string;
  active?: boolean;
}): Promise<ItemBarcode> {
  const { item_uom_id, barcode, symbology, active } = params;
  if (!item_uom_id) throw new Error("invalid item_uom_id");
  const code = barcode.trim();
  if (!code) throw new Error("barcode required");

  return apiPost<ItemBarcode>("/item-barcodes", {
    item_uom_id,
    barcode: code,
    symbology: symbology || "CUSTOM",
    active: active ?? true,
  });
}

/** 修改条码绑定（包装 / 条码 / 是否主条码） */
export async function updateItemBarcode(
  id: number,
  params: {
    item_uom_id?: number;
    barcode?: string;
    symbology?: string;
    active?: boolean;
    is_primary?: boolean;
  },
): Promise<ItemBarcode> {
  if (!id || id <= 0) throw new Error("invalid id");

  const body: Record<string, unknown> = {};

  if (params.item_uom_id !== undefined) {
    if (!params.item_uom_id || params.item_uom_id <= 0) {
      throw new Error("invalid item_uom_id");
    }
    body.item_uom_id = params.item_uom_id;
  }

  if (params.barcode !== undefined) {
    const code = params.barcode.trim();
    if (!code) throw new Error("barcode required");
    body.barcode = code;
  }

  if (params.symbology !== undefined) {
    body.symbology = params.symbology || "CUSTOM";
  }

  if (params.active !== undefined) {
    body.active = params.active;
  }

  if (params.is_primary !== undefined) {
    body.is_primary = params.is_primary;
  }

  return apiPatch<ItemBarcode>(`/item-barcodes/${id}`, body);
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
