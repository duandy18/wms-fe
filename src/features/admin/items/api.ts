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

  const body: Record<string, unknown> = {
    name: input.name.trim(),
    spec: input.spec?.trim() || undefined,
    uom: input.uom.trim(),
    barcode: input.barcode.trim(),

    // ✅ brand/category：可选，空串视为 null
    brand: input.brand?.trim() ? input.brand.trim() : null,
    category: input.category?.trim() ? input.category.trim() : null,

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

  // ✅ brand/category：可更新；空串 => null（清空）
  if (input.brand !== undefined) body.brand = input.brand?.trim() ? input.brand.trim() : null;
  if (input.category !== undefined) body.category = input.category?.trim() ? input.category.trim() : null;

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
