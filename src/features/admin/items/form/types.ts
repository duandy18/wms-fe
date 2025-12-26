// src/features/admin/items/form/types.ts
//
// ItemsFormSection 拆分：类型与常量（无 React）

export interface SkuParts {
  category: string;
  target: string;
  brand: string;
  specCode: string;
  serial: string;
}

export interface FormState {
  sku: string;
  name: string;
  spec: string;
  uom: string;
  barcode: string;
  enabled: boolean;
  weight_kg: string; // 单件重量输入（字符串），提交时解析为 number
}

export const CATEGORY_OPTIONS: { code: string; label: string }[] = [
  { code: "KF", label: "KF · 干粮" },
  { code: "GT", label: "GT · 罐头" },
  { code: "LX", label: "LX · 零食" },
  { code: "BJ", label: "BJ · 保健品" },
];

export const TARGET_OPTIONS: { code: string; label: string }[] = [
  { code: "C", label: "C · 猫" },
  { code: "G", label: "G · 狗" },
  { code: "T", label: "T · 通用" },
];

export const BRAND_OPTIONS: { code: string; label: string }[] = [
  { code: "NZ", label: "NZ · 皇家" },
  { code: "GS", label: "GS · 冠能" },
  { code: "WP", label: "WP · 自有品牌" },
];

export const EMPTY_SKU_PARTS: SkuParts = {
  category: "KF",
  target: "C",
  brand: "",
  specCode: "",
  serial: "001",
};

export const EMPTY_FORM: FormState = {
  sku: "",
  name: "",
  spec: "",
  uom: "PCS",
  barcode: "",
  enabled: true,
  weight_kg: "",
};

export const SKU_PARTS_LS_KEY = "wmsdu_items_sku_parts_v1";
