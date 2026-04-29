// src/features/pms/master-data/api/masterDataApi.ts
import { apiGet, apiPatch, apiPost } from "../../../../lib/api";

export type ProductKind = "FOOD" | "SUPPLY" | "OTHER";
export type AttributeProductKind = ProductKind | "COMMON";
export type AttributeValueType = "TEXT" | "NUMBER" | "OPTION" | "BOOL";

type ListEnvelope<T> = {
  ok: boolean;
  data: T[];
};

function unwrapList<T>(resp: ListEnvelope<T>): T[] {
  return Array.isArray(resp.data) ? resp.data : [];
}

export type PmsBrand = {
  id: number;
  name_cn: string;
  code: string;
  is_active: boolean;
  is_locked: boolean;
  sort_order: number;
  remark?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type PmsCategory = {
  id: number;
  parent_id: number | null;
  level: number;
  product_kind: ProductKind;
  category_name: string;
  category_code: string;
  path_code: string;
  is_leaf: boolean;
  is_active: boolean;
  is_locked: boolean;
  sort_order: number;
  remark?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ItemAttributeDef = {
  id: number;
  code: string;
  name_cn: string;
  name_en?: string | null;
  product_kind: AttributeProductKind;
  category_id?: number | null;
  value_type: AttributeValueType;
  unit?: string | null;
  is_required: boolean;
  is_searchable: boolean;
  is_filterable: boolean;
  is_sku_segment: boolean;
  is_active: boolean;
  sort_order: number;
  remark?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ItemAttributeOption = {
  id: number;
  attribute_def_id: number;
  option_code: string;
  option_name: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string | null;
  updated_at?: string | null;
};

export async function fetchPmsBrands(activeOnly = false): Promise<PmsBrand[]> {
  const resp = await apiGet<ListEnvelope<PmsBrand>>("/pms/brands", {
    active_only: activeOnly,
  });
  return unwrapList(resp);
}

export async function createPmsBrand(payload: {
  name_cn: string;
  code: string;
  sort_order?: number;
  remark?: string | null;
}): Promise<PmsBrand> {
  return apiPost<PmsBrand>("/pms/brands", payload);
}

export async function updatePmsBrand(
  id: number,
  payload: Partial<Pick<PmsBrand, "name_cn" | "code" | "sort_order" | "remark">>,
): Promise<PmsBrand> {
  return apiPatch<PmsBrand>(`/pms/brands/${id}`, payload);
}

export async function enablePmsBrand(id: number): Promise<PmsBrand> {
  return apiPost<PmsBrand>(`/pms/brands/${id}/enable`, {});
}

export async function disablePmsBrand(id: number): Promise<PmsBrand> {
  return apiPost<PmsBrand>(`/pms/brands/${id}/disable`, {});
}

export async function lockPmsBrand(id: number): Promise<PmsBrand> {
  return apiPost<PmsBrand>(`/pms/brands/${id}/lock`, {});
}

export async function unlockPmsBrand(id: number): Promise<PmsBrand> {
  return apiPost<PmsBrand>(`/pms/brands/${id}/unlock`, {});
}

export async function fetchPmsCategories(
  productKind?: ProductKind,
  activeOnly = false,
): Promise<PmsCategory[]> {
  const resp = await apiGet<ListEnvelope<PmsCategory>>("/pms/categories", {
    product_kind: productKind,
    active_only: activeOnly,
  });
  return unwrapList(resp);
}

export async function createPmsCategory(payload: {
  parent_id: number | null;
  level: number;
  product_kind: ProductKind;
  category_name: string;
  category_code: string;
  is_leaf: boolean;
  sort_order?: number;
  remark?: string | null;
}): Promise<PmsCategory> {
  return apiPost<PmsCategory>("/pms/categories", payload);
}

export async function updatePmsCategory(
  id: number,
  payload: Partial<Pick<PmsCategory, "category_name" | "category_code" | "is_leaf" | "sort_order" | "remark">>,
): Promise<PmsCategory> {
  return apiPatch<PmsCategory>(`/pms/categories/${id}`, payload);
}

export async function enablePmsCategory(id: number): Promise<PmsCategory> {
  return apiPost<PmsCategory>(`/pms/categories/${id}/enable`, {});
}

export async function disablePmsCategory(id: number): Promise<PmsCategory> {
  return apiPost<PmsCategory>(`/pms/categories/${id}/disable`, {});
}

export async function lockPmsCategory(id: number): Promise<PmsCategory> {
  return apiPost<PmsCategory>(`/pms/categories/${id}/lock`, {});
}

export async function unlockPmsCategory(id: number): Promise<PmsCategory> {
  return apiPost<PmsCategory>(`/pms/categories/${id}/unlock`, {});
}

export async function fetchItemAttributeDefs(params?: {
  product_kind?: AttributeProductKind;
  category_id?: number | null;
  active_only?: boolean;
}): Promise<ItemAttributeDef[]> {
  const resp = await apiGet<ListEnvelope<ItemAttributeDef>>("/pms/item-attribute-defs", {
    product_kind: params?.product_kind,
    category_id: params?.category_id ?? undefined,
    active_only: params?.active_only ?? false,
  });
  return unwrapList(resp);
}

export async function createItemAttributeDef(payload: {
  code: string;
  name_cn: string;
  name_en?: string | null;
  product_kind: AttributeProductKind;
  category_id?: number | null;
  value_type: AttributeValueType;
  unit?: string | null;
  is_required?: boolean;
  is_searchable?: boolean;
  is_filterable?: boolean;
  is_sku_segment?: boolean;
  sort_order?: number;
  remark?: string | null;
}): Promise<ItemAttributeDef> {
  return apiPost<ItemAttributeDef>("/pms/item-attribute-defs", payload);
}

export async function updateItemAttributeDef(
  id: number,
  payload: Partial<
    Pick<
      ItemAttributeDef,
      | "name_cn"
      | "name_en"
      | "unit"
      | "is_required"
      | "is_searchable"
      | "is_filterable"
      | "is_sku_segment"
      | "sort_order"
      | "remark"
    >
  >,
): Promise<ItemAttributeDef> {
  return apiPatch<ItemAttributeDef>(`/pms/item-attribute-defs/${id}`, payload);
}

export async function enableItemAttributeDef(id: number): Promise<ItemAttributeDef> {
  return apiPost<ItemAttributeDef>(`/pms/item-attribute-defs/${id}/enable`, {});
}

export async function disableItemAttributeDef(id: number): Promise<ItemAttributeDef> {
  return apiPost<ItemAttributeDef>(`/pms/item-attribute-defs/${id}/disable`, {});
}

export async function fetchItemAttributeOptions(
  attributeDefId: number,
  activeOnly = false,
): Promise<ItemAttributeOption[]> {
  const resp = await apiGet<ListEnvelope<ItemAttributeOption>>(
    `/pms/item-attribute-defs/${attributeDefId}/options`,
    { active_only: activeOnly },
  );
  return unwrapList(resp);
}

export async function createItemAttributeOption(
  attributeDefId: number,
  payload: {
    option_code: string;
    option_name: string;
    sort_order?: number;
  },
): Promise<ItemAttributeOption> {
  return apiPost<ItemAttributeOption>(`/pms/item-attribute-defs/${attributeDefId}/options`, payload);
}

export async function updateItemAttributeOption(
  id: number,
  payload: Partial<Pick<ItemAttributeOption, "option_name" | "sort_order">>,
): Promise<ItemAttributeOption> {
  return apiPatch<ItemAttributeOption>(`/pms/item-attribute-options/${id}`, payload);
}

export async function enableItemAttributeOption(id: number): Promise<ItemAttributeOption> {
  return apiPost<ItemAttributeOption>(`/pms/item-attribute-options/${id}/enable`, {});
}

export async function disableItemAttributeOption(id: number): Promise<ItemAttributeOption> {
  return apiPost<ItemAttributeOption>(`/pms/item-attribute-options/${id}/disable`, {});
}
