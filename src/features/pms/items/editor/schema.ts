// src/features/pms/items/editor/schema.ts

import type { ItemCreateInput, ItemUpdateInput } from "../../../../contracts/item/contract";
import type { FormState } from "../create/types";

export type Flash = { kind: "success" | "error"; text: string } | null;

export type FieldErrors = Partial<Record<keyof FormState, string>>;

function parseSupplierId(v: string): number | null {
  const s = (v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parsePositiveIntStrict(v: string): number | null {
  const s = (v ?? "").trim();
  if (!s) return null;
  if (!/^\d+$/.test(s)) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  const i = Math.trunc(n);
  if (i < 1) return null;
  return i;
}

function normalizeText(v: string): string | null {
  const s = (v ?? "").trim();
  return s ? s : null;
}

function allowShelfLife(expiryPolicy: string): boolean {
  return expiryPolicy.trim() === "REQUIRED";
}

function resolveShelfLifeFields(
  form: FormState,
  errors: FieldErrors,
): {
  shelf_life_value: number | null;
  shelf_life_unit: "DAY" | "WEEK" | "MONTH" | "YEAR" | null;
} {
  const needShelf = allowShelfLife(form.expiry_policy);

  let shelf_life_value: number | null = null;
  let shelf_life_unit: "DAY" | "WEEK" | "MONTH" | "YEAR" | null = null;

  if (needShelf) {
    if (form.shelf_life_value.trim()) {
      const n = parsePositiveIntStrict(form.shelf_life_value);
      if (n === null) {
        errors.shelf_life_value = "默认保质期必须为整数 ≥ 1";
      } else {
        shelf_life_value = n;
        shelf_life_unit = form.shelf_life_unit;
      }
    }
  }

  return { shelf_life_value, shelf_life_unit };
}

export function validateCreate(
  form: FormState,
):
  | { ok: true; body: ItemCreateInput }
  | { ok: false; fieldErrors: FieldErrors } {
  const errors: FieldErrors = {};

  if (!form.sku.trim()) errors.sku = "SKU 不能为空";
  if (!form.name.trim()) errors.name = "商品名称不能为空";

  const supplierId = parseSupplierId(form.supplier_id);
  const shelf = resolveShelfLifeFields(form, errors);

  if (Object.keys(errors).length > 0) return { ok: false, fieldErrors: errors };

  return {
    ok: true,
    body: {
      sku: form.sku.trim().toUpperCase(),
      name: form.name.trim(),
      spec: normalizeText(form.spec),
      brand: normalizeText(form.brand),
      category: normalizeText(form.category),
      supplier_id: supplierId,
      lot_source_policy: form.lot_source_policy,
      expiry_policy: form.expiry_policy,
      derivation_allowed: form.derivation_allowed,
      uom_governance_enabled: form.uom_governance_enabled,
      shelf_life_value: shelf.shelf_life_value,
      shelf_life_unit: shelf.shelf_life_unit,
      enabled: form.status === "enabled",
    },
  };
}

export function validateEdit(
  form: FormState,
):
  | { ok: true; body: ItemUpdateInput }
  | { ok: false; fieldErrors: FieldErrors } {
  const errors: FieldErrors = {};

  if (!form.name.trim()) errors.name = "商品名称不能为空";

  const supplierId = parseSupplierId(form.supplier_id);
  const shelf = resolveShelfLifeFields(form, errors);

  if (Object.keys(errors).length > 0) return { ok: false, fieldErrors: errors };

  return {
    ok: true,
    body: {
      name: form.name.trim(),
      spec: normalizeText(form.spec),
      brand: normalizeText(form.brand),
      category: normalizeText(form.category),
      supplier_id: supplierId,
      lot_source_policy: form.lot_source_policy,
      expiry_policy: form.expiry_policy,
      derivation_allowed: form.derivation_allowed,
      uom_governance_enabled: form.uom_governance_enabled,
      shelf_life_value: shelf.shelf_life_value,
      shelf_life_unit: shelf.shelf_life_unit,
      enabled: form.status === "enabled",
    },
  };
}
