// src/features/pms/items/contracts/itemList.ts

export type ItemListRow = {
  item_id: number;
  sku: string;
  name: string;
  spec: string | null;
  enabled: boolean;

  brand: string | null;
  category: string | null;
  supplier_name: string | null;

  primary_barcode: string | null;

  base_uom: string | null;
  purchase_uom: string | null;
  purchase_ratio_to_base: number | null;
  base_net_weight_kg: number | null;

  lot_source_policy: string;
  expiry_policy: string;
  shelf_life_value: number | null;
  shelf_life_unit: string | null;

  uom_count: number;
  barcode_count: number;
  sku_code_count: number;
  attribute_count: number;

  updated_at: string | null;
};

export type ItemListUom = {
  id: number;
  item_id: number;
  uom: string;
  display_name: string | null;
  ratio_to_base: number;
  net_weight_kg: number | null;
  is_base: boolean;
  is_purchase_default: boolean;
  is_inbound_default: boolean;
  is_outbound_default: boolean;
  updated_at: string | null;
};

export type ItemListBarcode = {
  id: number;
  item_id: number;
  item_uom_id: number;
  uom: string | null;
  display_name: string | null;
  barcode: string;
  symbology: string;
  active: boolean;
  is_primary: boolean;
  updated_at: string | null;
};

export type ItemListSkuCode = {
  id: number;
  item_id: number;
  code: string;
  code_type: string;
  is_primary: boolean;
  is_active: boolean;
  effective_from: string | null;
  effective_to: string | null;
  remark: string | null;
  updated_at: string | null;
};

export type ItemListAttribute = {
  attribute_def_id: number;
  code: string;
  name_cn: string;
  value_type: string;
  selection_mode: string;
  unit: string | null;
  is_item_required: boolean;
  is_sku_required: boolean;
  is_sku_segment: boolean;
  sort_order: number;

  value_text: string | null;
  value_number: number | null;
  value_bool: boolean | null;
  value_option_ids: number[];
  value_option_code_snapshots: string[];
  value_option_names: string[];
  value_unit_snapshot: string | null;
  updated_at: string | null;
};

export type ItemListDetail = {
  row: ItemListRow;
  uoms: ItemListUom[];
  barcodes: ItemListBarcode[];
  sku_codes: ItemListSkuCode[];
  attributes: ItemListAttribute[];
};
