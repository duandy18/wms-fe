// src/features/admin/items/create/types.ts

export type StatusMode = "enabled" | "disabled";
export type ShelfLifeUnit = "DAY" | "WEEK" | "MONTH" | "YEAR";

export interface UomDraft {
  uom: string; // 单位代码（必填 for base；其它行可选）
  ratio_to_base: string; // 字符串态，便于输入；校验时转 int（>=1）
  display_name: string; // 可选展示名

  // item_uoms flags（终态合同）
  is_base: boolean;
  is_purchase_default: boolean;
  is_inbound_default: boolean;
  is_outbound_default: boolean;
}

export interface BarcodesDraft {
  item_barcode: string; // 产品码（可选但通常应填）
  case_barcode: string; // 箱码/包装码（可选）
}

export interface FormState {
  name: string;
  spec: string;
  brand: string;
  category: string;

  supplier_id: string;
  weight_kg: string;

  lot_source_policy: "SUPPLIER_ONLY" | "INTERNAL_ONLY";
  expiry_policy: "NONE" | "REQUIRED";
  derivation_allowed: boolean;
  uom_governance_enabled: boolean;

  shelf_life_value: string;
  shelf_life_unit: ShelfLifeUnit;

  /**
   * ✅ 终态：单位真相完全表达为 item_uoms 子表结构
   * - 至少包含 1 条 base（is_base=true, ratio_to_base=1）
   * - 可选包含 1 条 purchase_default（is_purchase_default=true, ratio_to_base>=1）
   */
  uoms: UomDraft[];

  // barcodes（两层）
  barcodes: BarcodesDraft;

  status: StatusMode;
}

export const EMPTY_FORM: FormState = {
  name: "",
  spec: "",
  brand: "",
  category: "",

  supplier_id: "",
  weight_kg: "",

  lot_source_policy: "SUPPLIER_ONLY",
  expiry_policy: "NONE",
  derivation_allowed: true,
  uom_governance_enabled: false,

  shelf_life_value: "",
  shelf_life_unit: "MONTH",

  uoms: [],

  barcodes: { item_barcode: "", case_barcode: "" },

  status: "enabled",
};
