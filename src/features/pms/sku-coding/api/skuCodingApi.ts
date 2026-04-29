// src/features/pms/sku-coding/api/skuCodingApi.ts
import { apiGet, apiPatch, apiPost } from "../../../../lib/api";
import {
  fetchPmsBrands,
  fetchPmsCategories,
  type PmsBrand,
  type PmsCategory,
} from "../../master-data/api/masterDataApi";

export type ProductKind = "FOOD" | "SUPPLY";

export type SkuCodeBrand = PmsBrand;
export type SkuBusinessCategory = PmsCategory;

export interface SkuCodeTermGroup {
  id: number;
  product_kind: ProductKind | "COMMON";
  group_code: string;
  group_name: string;
  is_multi_select: boolean;
  is_required: boolean;
  sort_order: number;
  is_active: boolean;
  remark: string | null;
}

export interface SkuCodeTerm {
  id: number;
  group_id: number;
  name_cn: string;
  code: string;
  sort_order: number;
  is_active: boolean;
  is_locked: boolean;
  remark: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface SkuGenerateInput {
  product_kind: ProductKind;
  brand_id: number;
  category_id: number;
  term_ids: Record<string, number[]>;
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

interface ListEnvelope<T> {
  ok: boolean;
  data: T[];
}

interface GenerateEnvelope {
  ok: boolean;
  data: SkuGenerateData;
}

function unwrapList<T>(resp: ListEnvelope<T>): T[] {
  return Array.isArray(resp.data) ? resp.data : [];
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

export async function fetchSkuCodeTermGroups(
  productKind?: ProductKind,
  activeOnly = false,
): Promise<SkuCodeTermGroup[]> {
  const resp = await apiGet<ListEnvelope<SkuCodeTermGroup>>("/pms/sku-coding/term-groups", {
    product_kind: productKind,
    active_only: activeOnly,
  });
  return unwrapList(resp);
}

export async function fetchSkuCodeTerms(
  groupId?: number,
  activeOnly = false,
): Promise<SkuCodeTerm[]> {
  const resp = await apiGet<ListEnvelope<SkuCodeTerm>>("/pms/sku-coding/terms", {
    group_id: groupId,
    active_only: activeOnly,
  });
  return unwrapList(resp);
}

export async function createSkuCodeTerm(payload: {
  group_id: number;
  name_cn: string;
  code: string;
  sort_order?: number;
  remark?: string | null;
}): Promise<SkuCodeTerm> {
  return apiPost<SkuCodeTerm>("/pms/sku-coding/terms", payload);
}

export async function updateSkuCodeTerm(
  id: number,
  payload: Partial<Pick<SkuCodeTerm, "name_cn" | "code" | "sort_order" | "remark">>,
): Promise<SkuCodeTerm> {
  return apiPatch<SkuCodeTerm>(`/pms/sku-coding/terms/${id}`, payload);
}

export async function enableSkuCodeTerm(id: number): Promise<SkuCodeTerm> {
  return apiPost<SkuCodeTerm>(`/pms/sku-coding/terms/${id}/enable`, {});
}

export async function disableSkuCodeTerm(id: number): Promise<SkuCodeTerm> {
  return apiPost<SkuCodeTerm>(`/pms/sku-coding/terms/${id}/disable`, {});
}

export async function generateSkuCode(payload: SkuGenerateInput): Promise<SkuGenerateData> {
  const resp = await apiPost<GenerateEnvelope>("/pms/sku-coding/generate", payload);
  return resp.data;
}
