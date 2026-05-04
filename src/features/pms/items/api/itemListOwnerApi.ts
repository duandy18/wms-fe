// src/features/pms/items/api/itemListOwnerApi.ts
import { apiGet } from "../../../../lib/api";
import type {
  ItemCompleteness,
  ItemCompletenessProductKind,
  ItemCompletenessStatus,
  ItemListAttribute,
  ItemListBarcode,
  ItemListDetail,
  ItemListRow,
  ItemListSkuCode,
  ItemListUom,
} from "../contracts/itemList";

export type ItemListRowsParams = {
  enabled?: boolean | null;
  supplierId?: number | null;
  q?: string | null;
  limit?: number | null;
};

type RawItemCompleteness = {
  status?: string | null;
  is_complete?: boolean | null;

  product_kind?: string | null;

  has_brand?: boolean | null;
  has_active_leaf_category?: boolean | null;
  has_base_uom?: boolean | null;
  has_active_primary_barcode?: boolean | null;
  has_active_primary_sku?: boolean | null;

  item_required_attributes_complete?: boolean | null;
  sku_required_attributes_complete?: boolean | null;
  sku_segment_attributes_present?: boolean | null;

  sku_generation_applicable?: boolean | null;
  can_generate_sku?: boolean | null;

  missing_item_required_attribute_codes?: Array<string | null> | null;
  missing_sku_required_attribute_codes?: Array<string | null> | null;
  missing_sku_segment_attribute_codes?: Array<string | null> | null;

  missing_items?: Array<string | null> | null;
  blocking_items?: Array<string | null> | null;
  warnings?: Array<string | null> | null;
};

type RawItemListRow = {
  item_id?: number | null;
  sku?: string | null;
  name?: string | null;
  spec?: string | null;
  enabled?: boolean | null;

  brand?: string | null;
  category?: string | null;
  supplier_name?: string | null;

  primary_barcode?: string | null;

  base_uom?: string | null;
  purchase_uom?: string | null;
  purchase_ratio_to_base?: number | string | null;
  base_net_weight_kg?: number | string | null;

  lot_source_policy?: string | null;
  expiry_policy?: string | null;
  shelf_life_value?: number | string | null;
  shelf_life_unit?: string | null;

  uom_count?: number | string | null;
  barcode_count?: number | string | null;
  sku_code_count?: number | string | null;
  attribute_count?: number | string | null;

  completeness?: RawItemCompleteness | null;

  updated_at?: string | null;
};

type RawItemListUom = {
  id?: number | string | null;
  item_id?: number | string | null;
  uom?: string | null;
  display_name?: string | null;
  ratio_to_base?: number | string | null;
  net_weight_kg?: number | string | null;
  is_base?: boolean | null;
  is_purchase_default?: boolean | null;
  is_inbound_default?: boolean | null;
  is_outbound_default?: boolean | null;
  updated_at?: string | null;
};

type RawItemListBarcode = {
  id?: number | string | null;
  item_id?: number | string | null;
  item_uom_id?: number | string | null;
  uom?: string | null;
  display_name?: string | null;
  barcode?: string | null;
  symbology?: string | null;
  active?: boolean | null;
  is_primary?: boolean | null;
  updated_at?: string | null;
};

type RawItemListSkuCode = {
  id?: number | string | null;
  item_id?: number | string | null;
  code?: string | null;
  code_type?: string | null;
  is_primary?: boolean | null;
  is_active?: boolean | null;
  effective_from?: string | null;
  effective_to?: string | null;
  remark?: string | null;
  updated_at?: string | null;
};

type RawItemListAttribute = {
  attribute_def_id?: number | string | null;
  code?: string | null;
  name_cn?: string | null;
  value_type?: string | null;
  selection_mode?: string | null;
  unit?: string | null;
  is_item_required?: boolean | null;
  is_sku_required?: boolean | null;
  is_sku_segment?: boolean | null;
  sort_order?: number | string | null;

  value_text?: string | null;
  value_number?: number | string | null;
  value_bool?: boolean | null;
  value_option_ids?: Array<number | string | null> | null;
  value_option_code_snapshots?: Array<string | null> | null;
  value_option_names?: Array<string | null> | null;
  value_unit_snapshot?: string | null;
  updated_at?: string | null;
};

type RawItemListDetail = {
  row?: RawItemListRow | null;
  uoms?: RawItemListUom[] | null;
  barcodes?: RawItemListBarcode[] | null;
  sku_codes?: RawItemListSkuCode[] | null;
  attributes?: RawItemListAttribute[] | null;
};

function cleanString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text ? text : null;
}

function stringValue(value: unknown): string {
  return cleanString(value) ?? "";
}

function numberOrNull(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  return null;
}

function intValue(value: unknown): number {
  const n = numberOrNull(value);
  return n == null ? 0 : Math.trunc(n);
}

function numberList(value: unknown): number[] {
  if (!Array.isArray(value)) return [];

  const out: number[] = [];
  const seen = new Set<number>();

  for (const item of value) {
    const n = numberOrNull(item);
    if (n == null || n <= 0) continue;
    const id = Math.trunc(n);
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }

  return out;
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const out: string[] = [];
  const seen = new Set<string>();

  for (const item of value) {
    const text = cleanString(item);
    if (!text || seen.has(text)) continue;
    seen.add(text);
    out.push(text);
  }

  return out;
}

function normalizeCompletenessStatus(value: unknown): ItemCompletenessStatus {
  if (value === "COMPLETE" || value === "WARNING" || value === "BLOCKED") return value;
  return "BLOCKED";
}

function normalizeProductKind(value: unknown): ItemCompletenessProductKind | null {
  if (value === "FOOD" || value === "SUPPLY" || value === "OTHER") return value;
  return null;
}

function normalizeCompleteness(raw: RawItemCompleteness | null | undefined): ItemCompleteness {
  return {
    status: normalizeCompletenessStatus(raw?.status),
    is_complete: raw?.is_complete === true,

    product_kind: normalizeProductKind(raw?.product_kind),

    has_brand: raw?.has_brand === true,
    has_active_leaf_category: raw?.has_active_leaf_category === true,
    has_base_uom: raw?.has_base_uom === true,
    has_active_primary_barcode: raw?.has_active_primary_barcode === true,
    has_active_primary_sku: raw?.has_active_primary_sku === true,

    item_required_attributes_complete: raw?.item_required_attributes_complete === true,
    sku_required_attributes_complete: raw?.sku_required_attributes_complete === true,
    sku_segment_attributes_present: raw?.sku_segment_attributes_present === true,

    sku_generation_applicable: raw?.sku_generation_applicable === true,
    can_generate_sku: raw?.can_generate_sku === true,

    missing_item_required_attribute_codes: stringList(raw?.missing_item_required_attribute_codes),
    missing_sku_required_attribute_codes: stringList(raw?.missing_sku_required_attribute_codes),
    missing_sku_segment_attribute_codes: stringList(raw?.missing_sku_segment_attribute_codes),

    missing_items: stringList(raw?.missing_items),
    blocking_items: stringList(raw?.blocking_items),
    warnings: stringList(raw?.warnings),
  };
}

function normalizeRow(raw: RawItemListRow): ItemListRow {
  return {
    item_id: intValue(raw.item_id),
    sku: stringValue(raw.sku),
    name: stringValue(raw.name),
    spec: cleanString(raw.spec),
    enabled: raw.enabled === true,

    brand: cleanString(raw.brand),
    category: cleanString(raw.category),
    supplier_name: cleanString(raw.supplier_name),

    primary_barcode: cleanString(raw.primary_barcode),

    base_uom: cleanString(raw.base_uom),
    purchase_uom: cleanString(raw.purchase_uom),
    purchase_ratio_to_base: numberOrNull(raw.purchase_ratio_to_base),
    base_net_weight_kg: numberOrNull(raw.base_net_weight_kg),

    lot_source_policy: stringValue(raw.lot_source_policy),
    expiry_policy: stringValue(raw.expiry_policy),
    shelf_life_value: numberOrNull(raw.shelf_life_value),
    shelf_life_unit: cleanString(raw.shelf_life_unit),

    uom_count: intValue(raw.uom_count),
    barcode_count: intValue(raw.barcode_count),
    sku_code_count: intValue(raw.sku_code_count),
    attribute_count: intValue(raw.attribute_count),

    completeness: normalizeCompleteness(raw.completeness),

    updated_at: cleanString(raw.updated_at),
  };
}

function normalizeUom(raw: RawItemListUom): ItemListUom {
  return {
    id: intValue(raw.id),
    item_id: intValue(raw.item_id),
    uom: stringValue(raw.uom),
    display_name: cleanString(raw.display_name),
    ratio_to_base: intValue(raw.ratio_to_base),
    net_weight_kg: numberOrNull(raw.net_weight_kg),
    is_base: raw.is_base === true,
    is_purchase_default: raw.is_purchase_default === true,
    is_inbound_default: raw.is_inbound_default === true,
    is_outbound_default: raw.is_outbound_default === true,
    updated_at: cleanString(raw.updated_at),
  };
}

function normalizeBarcode(raw: RawItemListBarcode): ItemListBarcode {
  return {
    id: intValue(raw.id),
    item_id: intValue(raw.item_id),
    item_uom_id: intValue(raw.item_uom_id),
    uom: cleanString(raw.uom),
    display_name: cleanString(raw.display_name),
    barcode: stringValue(raw.barcode),
    symbology: stringValue(raw.symbology),
    active: raw.active === true,
    is_primary: raw.is_primary === true,
    updated_at: cleanString(raw.updated_at),
  };
}

function normalizeSkuCode(raw: RawItemListSkuCode): ItemListSkuCode {
  return {
    id: intValue(raw.id),
    item_id: intValue(raw.item_id),
    code: stringValue(raw.code),
    code_type: stringValue(raw.code_type),
    is_primary: raw.is_primary === true,
    is_active: raw.is_active === true,
    effective_from: cleanString(raw.effective_from),
    effective_to: cleanString(raw.effective_to),
    remark: cleanString(raw.remark),
    updated_at: cleanString(raw.updated_at),
  };
}

function normalizeAttribute(raw: RawItemListAttribute): ItemListAttribute {
  return {
    attribute_def_id: intValue(raw.attribute_def_id),
    code: stringValue(raw.code),
    name_cn: stringValue(raw.name_cn),
    value_type: stringValue(raw.value_type),
    selection_mode: stringValue(raw.selection_mode),
    unit: cleanString(raw.unit),
    is_item_required: raw.is_item_required === true,
    is_sku_required: raw.is_sku_required === true,
    is_sku_segment: raw.is_sku_segment === true,
    sort_order: intValue(raw.sort_order),

    value_text: cleanString(raw.value_text),
    value_number: numberOrNull(raw.value_number),
    value_bool: typeof raw.value_bool === "boolean" ? raw.value_bool : null,
    value_option_ids: numberList(raw.value_option_ids),
    value_option_code_snapshots: stringList(raw.value_option_code_snapshots),
    value_option_names: stringList(raw.value_option_names),
    value_unit_snapshot: cleanString(raw.value_unit_snapshot),
    updated_at: cleanString(raw.updated_at),
  };
}

function normalizeDetail(raw: RawItemListDetail): ItemListDetail {
  return {
    row: normalizeRow(raw.row ?? {}),
    uoms: Array.isArray(raw.uoms) ? raw.uoms.map(normalizeUom) : [],
    barcodes: Array.isArray(raw.barcodes) ? raw.barcodes.map(normalizeBarcode) : [],
    sku_codes: Array.isArray(raw.sku_codes) ? raw.sku_codes.map(normalizeSkuCode) : [],
    attributes: Array.isArray(raw.attributes) ? raw.attributes.map(normalizeAttribute) : [],
  };
}

export async function fetchItemListRows(
  params: ItemListRowsParams = {},
): Promise<ItemListRow[]> {
  const qs = new URLSearchParams();

  if (params.enabled !== undefined && params.enabled !== null) {
    qs.set("enabled", String(Boolean(params.enabled)));
  }

  if (
    params.supplierId !== undefined &&
    params.supplierId !== null &&
    Number.isFinite(params.supplierId) &&
    params.supplierId > 0
  ) {
    qs.set("supplier_id", String(Math.trunc(params.supplierId)));
  }

  const q = params.q?.trim();
  if (q) {
    qs.set("q", q);
  }

  if (
    params.limit !== undefined &&
    params.limit !== null &&
    Number.isFinite(params.limit) &&
    params.limit > 0
  ) {
    qs.set("limit", String(Math.trunc(params.limit)));
  }

  const path = qs.toString() ? `/items/list-rows?${qs.toString()}` : "/items/list-rows";
  const raw = await apiGet<RawItemListRow[]>(path);
  return Array.isArray(raw) ? raw.map(normalizeRow) : [];
}

export async function fetchItemListDetail(itemId: number): Promise<ItemListDetail> {
  if (!itemId || itemId <= 0) throw new Error("invalid item_id");
  const raw = await apiGet<RawItemListDetail>(`/items/${itemId}/list-detail`);
  return normalizeDetail(raw);
}
