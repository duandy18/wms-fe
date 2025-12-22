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

  // ✅ DB 已 NOT NULL：不再允许空
  supplier_id: number;
  supplier_name?: string | null;
  supplier?: string | null;

  created_at?: string | null;
  updated_at?: string | null;

  weight_kg?: number | null;

  has_shelf_life?: boolean | null;

  shelf_life_value?: number | null;
  shelf_life_unit?: "DAY" | "MONTH" | null;

  requires_batch?: boolean;
  requires_dates?: boolean;
  default_batch_code?: string | null;
}

export interface NextSkuOut {
  sku: string;
}

export interface ItemCreateInput {
  // ✅ SKU 统一由后端生成：前端不提供 sku
  name: string;
  spec?: string | null;
  uom: string; // ✅ 新建即完整：必填
  barcode: string; // ✅ 主条码必填
  enabled: boolean;

  // ✅ DB 已 NOT NULL：必填
  supplier_id: number;

  weight_kg: number;

  has_shelf_life: boolean;

  shelf_life_value?: number | null;
  shelf_life_unit?: "DAY" | "MONTH" | null;
}

export interface ItemUpdateInput {
  name?: string | null;
  spec?: string | null;
  uom?: string | null;
  enabled?: boolean;

  // ✅ 允许调整供应商，但不允许置空
  supplier_id?: number;

  weight_kg?: number | null;

  has_shelf_life?: boolean | null;

  shelf_life_value?: number | null;
  shelf_life_unit?: "DAY" | "MONTH" | null;
}

export async function fetchItems(): Promise<Item[]> {
  return apiGet<Item[]>("/items");
}

export async function fetchNextSku(): Promise<string> {
  const res = await apiPost<NextSkuOut>("/items/sku/next", {});
  return res.sku;
}

export async function createItem(input: ItemCreateInput): Promise<Item> {
  const supplierId = Number(input.supplier_id);
  if (!Number.isFinite(supplierId) || supplierId <= 0) {
    throw new Error("supplier_id 必须为有效数字（>0）");
  }

  const body: Record<string, unknown> = {
    name: input.name.trim(),
    spec: input.spec?.trim() || undefined,
    uom: input.uom.trim(),
    barcode: input.barcode.trim(),
    enabled: input.enabled,
    supplier_id: supplierId,
    weight_kg: input.weight_kg,
    has_shelf_life: input.has_shelf_life,
    shelf_life_value: input.shelf_life_value ?? null,
    shelf_life_unit: input.shelf_life_unit ?? null,
  };

  return apiPost<Item>("/items", body);
}

export async function updateItem(id: number, input: ItemUpdateInput): Promise<Item> {
  const body: Record<string, unknown> = {};

  if (input.name !== undefined) body.name = input.name?.trim() || "";
  if (input.spec !== undefined) body.spec = input.spec?.trim() || null;
  if (input.uom !== undefined) body.uom = input.uom?.trim() || null;
  if (input.enabled !== undefined) body.enabled = input.enabled;

  if (input.supplier_id !== undefined) {
    const supplierId = Number(input.supplier_id);
    if (!Number.isFinite(supplierId) || supplierId <= 0) {
      throw new Error("supplier_id 必须为有效数字（>0）");
    }
    body.supplier_id = supplierId;
  }

  if (input.weight_kg !== undefined) body.weight_kg = input.weight_kg;

  if (input.has_shelf_life !== undefined) body.has_shelf_life = input.has_shelf_life;

  if (input.shelf_life_value !== undefined) body.shelf_life_value = input.shelf_life_value;
  if (input.shelf_life_unit !== undefined) body.shelf_life_unit = input.shelf_life_unit;

  return apiPatch<Item>(`/items/${id}`, body);
}
