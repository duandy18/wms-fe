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

function toNumOrNull(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function createItem(input: ItemCreateInput): Promise<Item> {
  const name = String(input.name ?? "").trim();
  if (!name) throw new Error("name 不能为空");

  const body: Record<string, unknown> = {
    name,
    spec: typeof input.spec === "string" ? input.spec.trim() || null : input.spec ?? null,
    brand: typeof input.brand === "string" ? input.brand.trim() || null : input.brand ?? null,
    category: typeof input.category === "string" ? input.category.trim() || null : input.category ?? null,

    enabled: input.enabled ?? true,

    supplier_id: input.supplier_id ?? null,
    weight_kg: input.weight_kg ?? null,

    // ---- terminal policy fields ----
    lot_source_policy: String(input.lot_source_policy ?? "").trim(),
    expiry_policy: String(input.expiry_policy ?? "").trim(),
    derivation_allowed: Boolean(input.derivation_allowed),
    uom_governance_enabled: Boolean(input.uom_governance_enabled),

    shelf_life_value: toNumOrNull(input.shelf_life_value),
    shelf_life_unit: input.shelf_life_unit ?? null,
  };

  if (!String(body.lot_source_policy ?? "").trim()) throw new Error("lot_source_policy 必须填写");
  if (!String(body.expiry_policy ?? "").trim()) throw new Error("expiry_policy 必须填写");

  return apiPost<Item>("/items", body);
}

export async function updateItem(id: number, input: ItemUpdateInput): Promise<Item> {
  const body: Record<string, unknown> = {};

  if (input.name !== undefined) body.name = typeof input.name === "string" ? input.name.trim() : input.name;
  if (input.spec !== undefined) body.spec = typeof input.spec === "string" ? input.spec.trim() || null : input.spec;
  if (input.brand !== undefined) body.brand = typeof input.brand === "string" ? input.brand.trim() || null : input.brand;
  if (input.category !== undefined) body.category = typeof input.category === "string" ? input.category.trim() || null : input.category;

  if (input.enabled !== undefined) body.enabled = Boolean(input.enabled);

  if (input.supplier_id !== undefined) body.supplier_id = input.supplier_id;
  if (input.weight_kg !== undefined) body.weight_kg = input.weight_kg;

  if (input.lot_source_policy !== undefined) {
    const v = String(input.lot_source_policy ?? "").trim();
    if (!v) throw new Error("lot_source_policy 不能为空");
    body.lot_source_policy = v;
  }
  if (input.expiry_policy !== undefined) {
    const v = String(input.expiry_policy ?? "").trim();
    if (!v) throw new Error("expiry_policy 不能为空");
    body.expiry_policy = v;
  }
  if (input.derivation_allowed !== undefined) body.derivation_allowed = Boolean(input.derivation_allowed);
  if (input.uom_governance_enabled !== undefined) body.uom_governance_enabled = Boolean(input.uom_governance_enabled);

  if (input.shelf_life_value !== undefined) body.shelf_life_value = toNumOrNull(input.shelf_life_value);
  if (input.shelf_life_unit !== undefined) body.shelf_life_unit = input.shelf_life_unit ?? null;

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
