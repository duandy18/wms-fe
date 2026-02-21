// src/features/admin/items/create/types.ts

export type ShelfMode = "yes" | "no";
export type StatusMode = "enabled" | "disabled";

export interface FormState {
  name: string;

  // ✅ 规格（items.spec，展示文本）
  spec: string;

  // ✅ 主数据补齐：品牌 / 品类
  brand: string;
  category: string;

  supplier_id: string;

  uom_mode: "preset" | "custom";
  uom_preset: string;
  uom_custom: string;

  // ✅ Phase 1：结构化包装（仅一层箱装）
  // - case_ratio：整数（字符串态），允许空
  // - case_uom：箱装单位名（字符串态），允许空（展示默认“箱”）
  case_ratio: string;
  case_uom: string;

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

  // ✅ 规格默认空
  spec: "",

  // ✅ 主数据默认空
  brand: "",
  category: "",

  supplier_id: "",

  uom_mode: "preset",
  uom_preset: "",
  uom_custom: "",

  // ✅ Phase 1：默认未配置
  case_ratio: "",
  case_uom: "",

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
