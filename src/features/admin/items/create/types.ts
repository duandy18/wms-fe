// src/features/admin/items/create/types.ts

export type ShelfMode = "yes" | "no";
export type StatusMode = "enabled" | "disabled";

export interface FormState {
  name: string;

  // ✅ 新增：规格（items.spec，展示文本）
  spec: string;

  supplier_id: string;

  uom_mode: "preset" | "custom";
  uom_preset: string;
  uom_custom: string;

  weight_kg: string;

  shelf_mode: ShelfMode;
  shelf_life_value: string;
  shelf_life_unit: "MONTH" | "DAY";

  status: StatusMode;

  barcode: string;
}

export const COMMON_UOMS = ["PCS", "袋", "个", "罐", "箱", "瓶"];

export const EMPTY_FORM: FormState = {
  name: "",

  // ✅ 新增：规格默认空
  spec: "",

  supplier_id: "",

  uom_mode: "preset",
  uom_preset: "",
  uom_custom: "",

  weight_kg: "",

  shelf_mode: "no",
  shelf_life_value: "",
  shelf_life_unit: "MONTH",

  status: "enabled",

  barcode: "",
};

export function effectiveUom(f: FormState): string {
  return f.uom_mode === "preset" ? f.uom_preset.trim() : f.uom_custom.trim();
}
