// src/features/admin/items/editor/schema.ts

import type { ItemCreateInput, ItemUpdateInput } from "../../../../contracts/item/contract";
import type { FormState, UomDraft } from "../create/types";

export type Flash = { kind: "success" | "error"; text: string } | null;

export type FieldErrors =
  Partial<Record<keyof FormState, string>> & {
    base_uom_uom?: string;
    purchase_default_uom?: string;
    barcodes?: string;
  };

function parseSupplierId(v: string): number | null {
  const s = (v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseNonNegativeNumber(v: string): number | null {
  const s = (v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : null;
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

function normalizeUomText(v: string): string {
  return (v ?? "").trim();
}

function normalizeBarcode(v: string): string | null {
  const s = (v ?? "").trim();
  return s ? s : null;
}

function allowShelfLife(expiryPolicy: string): boolean {
  return expiryPolicy.trim() === "REQUIRED";
}

function pickBase(uoms: UomDraft[]): UomDraft | null {
  return uoms.find((x) => x.is_base) ?? null;
}

function pickPurchaseDefault(uoms: UomDraft[]): UomDraft | null {
  return uoms.find((x) => x.is_purchase_default && !x.is_base) ?? null;
}

export function validateCreate(
  form: FormState,
):
  | {
      ok: true;
      body: ItemCreateInput;
      post: {
        uomsToCreate: Array<{
          uom: string;
          ratio_to_base: number;
          display_name: string | null;
          is_base: boolean;
          is_purchase_default: boolean;
          is_inbound_default: boolean;
          is_outbound_default: boolean;
        }>;
        barcodesToCreate: Array<{ barcode: string; kind: "EAN13" | "UPC" | "INNER" | "CUSTOM"; set_primary: boolean }>;
      };
    }
  | { ok: false; fieldErrors: FieldErrors } {
  const errors: FieldErrors = {};

  if (!form.name.trim()) errors.name = "商品名称不能为空";

  const supplierId = parseSupplierId(form.supplier_id);

  const weight = parseNonNegativeNumber(form.weight_kg);
  if (form.weight_kg.trim() && weight === null) errors.weight_kg = "单件净重必须是 >= 0 的数字";

  // ---- uoms（终态：item_uoms 结构）----
  const baseDraft = pickBase(form.uoms);
  const baseUom = normalizeUomText(baseDraft?.uom ?? "");
  if (!baseUom) errors.base_uom_uom = "基准单位必须填写";

  const purchaseDraft = pickPurchaseDefault(form.uoms);
  const purchaseUom = normalizeUomText(purchaseDraft?.uom ?? "");
  const purchaseRatio = purchaseDraft ? parsePositiveIntStrict(purchaseDraft.ratio_to_base) : null;

  const hasPurchaseAny =
    !!purchaseUom ||
    !!(purchaseDraft?.ratio_to_base ?? "").trim() ||
    !!normalizeUomText(purchaseDraft?.display_name ?? "");

  if (hasPurchaseAny) {
    if (!purchaseUom) errors.purchase_default_uom = "采购默认单位：单位名称不能为空";
    else if (purchaseUom && baseUom && purchaseUom.toLowerCase() === baseUom.toLowerCase()) {
      errors.purchase_default_uom = "采购默认单位不能与基准单位相同";
    }
    if (purchaseRatio === null) {
      errors.purchase_default_uom =
        (errors.purchase_default_uom ? `${errors.purchase_default_uom}；` : "") + "倍率必须为整数 ≥ 1";
    }
  }

  // barcodes
  const itemBarcode = normalizeBarcode(form.barcodes.item_barcode);
  const caseBarcode = normalizeBarcode(form.barcodes.case_barcode);
  if (itemBarcode && caseBarcode && itemBarcode === caseBarcode) {
    errors.barcodes = "产品码与箱码不能相同";
  }

  // shelf life（仅 REQUIRED 允许）
  const expiryPolicy = form.expiry_policy;
  const needShelf = allowShelfLife(expiryPolicy);

  let shelf_life_value: number | null = null;
  let shelf_life_unit: "DAY" | "WEEK" | "MONTH" | "YEAR" | null = null;

  if (needShelf) {
    if (form.shelf_life_value.trim()) {
      const n = parsePositiveIntStrict(form.shelf_life_value);
      if (n === null) errors.shelf_life_value = "默认保质期必须为整数 ≥ 1";
      else {
        shelf_life_value = n;
        shelf_life_unit = form.shelf_life_unit;
      }
    }
  } else {
    shelf_life_value = null;
    shelf_life_unit = null;
  }

  if (Object.keys(errors).length > 0) return { ok: false, fieldErrors: errors };

  // ---- uoms to create ----
  const hasPurchase = !!purchaseUom && purchaseRatio != null;

  const uomsToCreate: Array<{
    uom: string;
    ratio_to_base: number;
    display_name: string | null;
    is_base: boolean;
    is_purchase_default: boolean;
    is_inbound_default: boolean;
    is_outbound_default: boolean;
  }> = [
    {
      uom: baseUom,
      ratio_to_base: 1,
      display_name: normalizeText(baseDraft?.display_name ?? ""),
      is_base: true,
      is_purchase_default: hasPurchase ? false : true,
      is_inbound_default: true,
      is_outbound_default: true,
    },
  ];

  if (hasPurchase) {
    uomsToCreate.push({
      uom: purchaseUom,
      ratio_to_base: purchaseRatio as number,
      display_name: normalizeText(purchaseDraft?.display_name ?? ""),
      is_base: false,
      is_purchase_default: true,
      is_inbound_default: false,
      is_outbound_default: false,
    });
  }

  // barcodes to create
  const barcodesToCreate: Array<{ barcode: string; kind: "EAN13" | "UPC" | "INNER" | "CUSTOM"; set_primary: boolean }> =
    [];
  if (itemBarcode) barcodesToCreate.push({ barcode: itemBarcode, kind: "EAN13", set_primary: true });
  if (caseBarcode) barcodesToCreate.push({ barcode: caseBarcode, kind: "INNER", set_primary: false });

  return {
    ok: true,
    body: {
      name: form.name.trim(),
      spec: normalizeText(form.spec),
      brand: normalizeText(form.brand),
      category: normalizeText(form.category),

      supplier_id: supplierId,
      weight_kg: weight,

      lot_source_policy: form.lot_source_policy,
      expiry_policy: form.expiry_policy,
      derivation_allowed: form.derivation_allowed,
      uom_governance_enabled: form.uom_governance_enabled,

      shelf_life_value,
      shelf_life_unit,

      enabled: form.status === "enabled",
    },
    post: { uomsToCreate, barcodesToCreate },
  };
}

export function validateEdit(
  form: FormState,
):
  | { ok: true; body: ItemUpdateInput }
  | { ok: false; fieldErrors: FieldErrors } {
  const r = validateCreate(form);
  if (!r.ok) return r;
  return { ok: true, body: r.body };
}
