// src/domains/pms/export/contracts/itemAggregate.ts

export interface PublicAggregateItem {
  id: number;
  sku: string;
  name: string;
  spec: string | null;
  enabled: boolean;

  supplier_id: number | null;
  brand: string | null;
  category: string | null;

  lot_source_policy: "INTERNAL_ONLY" | "SUPPLIER_ONLY";
  expiry_policy: "NONE" | "REQUIRED";
  derivation_allowed: boolean;
  uom_governance_enabled: boolean;

  shelf_life_value: number | null;
  shelf_life_unit: "DAY" | "WEEK" | "MONTH" | "YEAR" | null;
}

export interface PublicAggregateUom {
  id: number;
  item_id: number;

  uom: string;
  ratio_to_base: number;

  display_name: string | null;
  net_weight_kg: number | null;

  is_base: boolean;
  is_purchase_default: boolean;
  is_inbound_default: boolean;
  is_outbound_default: boolean;
}

export interface PublicAggregateBarcode {
  id: number;
  item_id: number;
  item_uom_id: number;

  barcode: string;
  symbology: string;
  active: boolean;
  is_primary: boolean;
}

export interface PublicItemAggregate {
  item: PublicAggregateItem;
  uoms: PublicAggregateUom[];
  barcodes: PublicAggregateBarcode[];
}
