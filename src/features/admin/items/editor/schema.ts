// src/features/admin/items/editor/schema.ts

import { z } from "zod";
import type { ItemCreateInput, ItemUpdateInput } from "../../../../contracts/item/contract";
import type { FormState } from "../create/types";

export type Flash = { kind: "success" | "error"; text: string } | null;
export type FieldErrors = Partial<Record<keyof FormState, string>>;

export const itemFormSchema = z.object({
  name: z.string().trim().min(1, "商品名称不能为空"),
  spec: z.string(),
  brand: z.string(),
  category: z.string(),

  supplier_id: z.string().trim().min(1, "必须选择供货商"),

  uom_mode: z.enum(["preset", "custom"]),
  uom_preset: z.string(),
  uom_custom: z.string(),

  // ✅ Phase 1：结构化包装字段（字符串态，校验在 validate 内做）
  case_ratio: z.string(),
  case_uom: z.string(),

  weight_kg: z.string(),

  shelf_mode: z.enum(["yes", "no"]),
  shelf_life_value: z.string(),
  shelf_life_unit: z.enum(["MONTH", "DAY"]),

  status: z.enum(["enabled", "disabled"]),
  barcode: z.string(),
});

export type ItemFormValues = z.infer<typeof itemFormSchema>;

function effectiveUom(f: ItemFormValues): string {
  return f.uom_mode === "preset" ? f.uom_preset.trim() : f.uom_custom.trim();
}

function parseSupplierId(v: string): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseNonNegativeNumber(v: string): number | null {
  const s = v.trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function parseCaseRatio(v: string): number | null {
  const s = v.trim();
  if (!s) return null;
  if (!/^\d+$/.test(s)) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  const i = Math.trunc(n);
  if (i < 1) return null;
  return i;
}

export function validateCreate(
  form: ItemFormValues
):
  | { ok: true; body: ItemCreateInput }
  | { ok: false; fieldErrors: FieldErrors } {
  const base = itemFormSchema.safeParse(form);
  if (!base.success) {
    const out: FieldErrors = {};
    base.error.issues.forEach((i) => {
      const k = i.path[0];
      if (typeof k === "string") {
        out[k as keyof FormState] = i.message;
      }
    });
    return { ok: false, fieldErrors: out };
  }

  const supplierId = parseSupplierId(base.data.supplier_id);
  if (!supplierId) {
    return { ok: false, fieldErrors: { supplier_id: "必须选择供货商" } };
  }

  const uom = effectiveUom(base.data);
  if (!uom) {
    return { ok: false, fieldErrors: { uom_preset: "最小单位不能为空" } };
  }

  const weight = parseNonNegativeNumber(base.data.weight_kg);
  if (weight === null) {
    return { ok: false, fieldErrors: { weight_kg: "单位净重必须是 >= 0 的数字" } };
  }

  const barcode = base.data.barcode.trim();
  if (!barcode) {
    return { ok: false, fieldErrors: { barcode: "主条码必须填写" } };
  }

  // ✅ Phase 1：case_ratio 允许空；非空必须是 >=1 的整数
  const ratioText = base.data.case_ratio.trim();
  const ratio = parseCaseRatio(ratioText);
  if (ratioText && ratio === null) {
    return { ok: false, fieldErrors: { case_ratio: "箱装倍率必须为 ≥ 1 的整数" } };
  }

  const case_uom = base.data.case_uom.trim() || null;
  const case_ratio = ratio; // number | null

  const hasShelf = base.data.shelf_mode === "yes";

  let shelf_life_value: number | null = null;
  let shelf_life_unit: "MONTH" | "DAY" | null = null;

  if (hasShelf) {
    const sv = parseNonNegativeNumber(base.data.shelf_life_value);
    if (sv === null) {
      return {
        ok: false,
        fieldErrors: { shelf_life_value: "默认有效期必须是 >= 0 的数字" },
      };
    }
    shelf_life_value = sv;
    shelf_life_unit = base.data.shelf_life_unit;
  }

  return {
    ok: true,
    body: {
      name: base.data.name.trim(),
      spec: base.data.spec.trim() || undefined,
      brand: base.data.brand.trim() || undefined,
      category: base.data.category.trim() || undefined,

      supplier_id: supplierId,
      uom,
      case_ratio,
      case_uom,
      weight_kg: weight,

      has_shelf_life: hasShelf,
      shelf_life_value,
      shelf_life_unit,

      enabled: base.data.status === "enabled",
      barcode,
    },
  };
}

export function validateEdit(
  form: ItemFormValues
):
  | { ok: true; body: ItemUpdateInput }
  | { ok: false; fieldErrors: FieldErrors } {
  const base = itemFormSchema.safeParse(form);
  if (!base.success) {
    const out: FieldErrors = {};
    base.error.issues.forEach((i) => {
      const k = i.path[0];
      if (typeof k === "string") {
        out[k as keyof FormState] = i.message;
      }
    });
    return { ok: false, fieldErrors: out };
  }

  const supplierId = parseSupplierId(base.data.supplier_id);
  if (!supplierId) {
    return { ok: false, fieldErrors: { supplier_id: "必须选择供货商" } };
  }

  const uom = effectiveUom(base.data);
  if (!uom) {
    return { ok: false, fieldErrors: { uom_preset: "最小单位不能为空" } };
  }

  const weight = parseNonNegativeNumber(base.data.weight_kg);
  if (weight === null) {
    return { ok: false, fieldErrors: { weight_kg: "单位净重必须是 >= 0 的数字" } };
  }

  // ✅ 编辑也允许改主条码：不允许为空
  const barcode = base.data.barcode.trim();
  if (!barcode) {
    return { ok: false, fieldErrors: { barcode: "主条码必须填写" } };
  }

  const hasShelf = base.data.shelf_mode === "yes";

  // ✅ Phase 1：case_ratio 允许空；非空必须是 >=1 的整数
  const ratioText = base.data.case_ratio.trim();
  const ratio = parseCaseRatio(ratioText);
  if (ratioText && ratio === null) {
    return { ok: false, fieldErrors: { case_ratio: "箱装倍率必须为 ≥ 1 的整数" } };
  }

  const case_uom = base.data.case_uom.trim() || null;
  const case_ratio = ratio; // number | null

  return {
    ok: true,
    body: {
      name: base.data.name.trim(),
      spec: base.data.spec.trim() || undefined,
      brand: base.data.brand.trim() || undefined,
      category: base.data.category.trim() || undefined,

      supplier_id: supplierId,
      uom,
      case_ratio,
      case_uom,
      weight_kg: weight,

      enabled: base.data.status === "enabled",
      has_shelf_life: hasShelf,

      // ✅ 关键：把 barcode 带进更新体
      barcode,
    },
  };
}
