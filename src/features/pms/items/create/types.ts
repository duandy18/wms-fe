// src/features/pms/items/create/types.ts

export type StatusMode = "enabled" | "disabled";
export type ShelfLifeUnit = "DAY" | "WEEK" | "MONTH" | "YEAR";

/**
 * 这些类型仍保留，供其它包装/条码治理代码复用；
 * 但商品管理页表单 FormState 不再承载这些字段。
 */
export interface UomDraft {
  uom: string;
  ratio_to_base: string;
  display_name: string;
  net_weight_kg: string;

  is_base: boolean;
  is_purchase_default: boolean;
  is_inbound_default: boolean;
  is_outbound_default: boolean;
}

export interface BarcodesDraft {
  item_barcode: string;
  case_barcode: string;
}

export interface FormState {
  name: string;
  spec: string;
  brand: string;
  category: string;

  supplier_id: string;

  lot_source_policy: "SUPPLIER_ONLY" | "INTERNAL_ONLY";
  expiry_policy: "NONE" | "REQUIRED";
  derivation_allowed: boolean;
  uom_governance_enabled: boolean;

  shelf_life_value: string;
  shelf_life_unit: ShelfLifeUnit;

  status: StatusMode;
}

export const EMPTY_FORM: FormState = {
  name: "",
  spec: "",
  brand: "",
  category: "",

  supplier_id: "",

  lot_source_policy: "SUPPLIER_ONLY",
  expiry_policy: "NONE",
  derivation_allowed: true,
  uom_governance_enabled: false,

  shelf_life_value: "",
  shelf_life_unit: "MONTH",

  status: "enabled",
};
