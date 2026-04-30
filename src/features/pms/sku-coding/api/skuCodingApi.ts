// src/features/pms/sku-coding/api/skuCodingApi.ts
import { apiPost } from "../../../../lib/api";
import {
  fetchItemAttributeDefs,
  fetchItemAttributeOptions,
  fetchPmsBrands,
  fetchPmsCategories,
  type AttributeProductKind,
  type ItemAttributeDef,
  type ItemAttributeOption,
  type PmsBrand,
  type PmsCategory,
} from "../../master-data/api/masterDataApi";

export type ProductKind = "FOOD" | "SUPPLY";

export type SkuCodeBrand = PmsBrand;
export type SkuBusinessCategory = PmsCategory;
export type SkuAttributeDef = ItemAttributeDef;
export type SkuAttributeOption = ItemAttributeOption;

export interface SkuGenerateInput {
  product_kind: ProductKind;
  brand_id: number;
  category_id: number;
  attribute_option_ids: Record<string, number[]>;
  text_segments?: Record<string, string>;
  spec_text: string;
}

export interface SkuGeneratedSegment {
  segment_key: string;
  name_cn: string;
  code: string;
}

export interface SkuSimilarItem {
  id: number;
  sku: string;
  name: string;
  spec: string | null;
  brand_id?: number | null;
  category_id?: number | null;
  brand: string | null;
  category: string | null;
}

export interface SkuGenerateData {
  sku: string;
  segments: SkuGeneratedSegment[];
  exists: boolean;
  similar_items: SkuSimilarItem[];
}

interface GenerateEnvelope {
  ok: boolean;
  data: SkuGenerateData;
}

export async function fetchSkuCodeBrands(activeOnly = false): Promise<SkuCodeBrand[]> {
  return fetchPmsBrands(activeOnly);
}

export async function fetchSkuBusinessCategories(
  productKind?: ProductKind,
  activeOnly = false,
): Promise<SkuBusinessCategory[]> {
  return fetchPmsCategories(productKind, activeOnly);
}

export async function fetchSkuAttributeDefs(
  productKind?: ProductKind,
  activeOnly = false,
): Promise<SkuAttributeDef[]> {
  const rows = await fetchItemAttributeDefs({
    product_kind: productKind as AttributeProductKind | undefined,
    active_only: activeOnly,
  });

  return rows
    .filter((row) => row.value_type === "OPTION" && row.is_sku_segment)
    .sort((a, b) => a.sort_order - b.sort_order || a.code.localeCompare(b.code));
}

export async function fetchSkuAttributeOptions(
  attributeDefId: number,
  activeOnly = false,
): Promise<SkuAttributeOption[]> {
  return fetchItemAttributeOptions(attributeDefId, activeOnly);
}

export async function generateSkuCode(payload: SkuGenerateInput): Promise<SkuGenerateData> {
  const resp = await apiPost<GenerateEnvelope>("/pms/sku-coding/generate", payload);
  return resp.data;
}
