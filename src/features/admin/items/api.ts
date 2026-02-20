// src/features/admin/items/api.ts
import { apiGet, apiPost, apiPatch } from "../../../lib/api";
import type { Item, ItemCreateInput, ItemUpdateInput } from "../../../contracts/item/contract";

export interface NextSkuOut {
  sku: string;
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

  const name = String(input.name ?? "").trim();
  if (!name) throw new Error("name 不能为空");

  const uom = String(input.uom ?? "").trim();
  if (!uom) throw new Error("uom 必须填写");

  const barcode = String(input.barcode ?? "").trim();
  if (!barcode) throw new Error("barcode 必须填写");

  const body: Record<string, unknown> = {
    name,
    spec: typeof input.spec === "string" ? input.spec.trim() || undefined : undefined,

    uom,
    barcode,

    // ✅ brand/category：可选，空串视为 null
    brand: typeof input.brand === "string" && input.brand.trim() ? input.brand.trim() : null,
    category: typeof input.category === "string" && input.category.trim() ? input.category.trim() : null,

    enabled: Boolean(input.enabled),
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

  if (input.name !== undefined) body.name = typeof input.name === "string" ? input.name.trim() : input.name ?? "";
  if (input.spec !== undefined) body.spec = typeof input.spec === "string" ? input.spec.trim() || null : input.spec ?? null;
  if (input.uom !== undefined) body.uom = typeof input.uom === "string" ? input.uom.trim() || null : input.uom ?? null;

  // ✅ brand/category：可更新；空串 => null（清空）
  if (input.brand !== undefined) body.brand = typeof input.brand === "string" && input.brand.trim() ? input.brand.trim() : null;
  if (input.category !== undefined) body.category = typeof input.category === "string" && input.category.trim() ? input.category.trim() : null;

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

// ===========================
// Test Set toggle (DEFAULT)
// ===========================
export async function enableItemTest(id: number): Promise<Item> {
  return apiPost<Item>(`/items/${id}/test:enable`, {});
}

export async function disableItemTest(id: number): Promise<Item> {
  return apiPost<Item>(`/items/${id}/test:disable`, {});
}
