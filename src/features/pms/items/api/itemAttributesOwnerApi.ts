// src/features/pms/items/api/itemAttributesOwnerApi.ts
import { apiGet, apiPut } from "../../../../lib/api";

export type ItemAttributeValue = {
  id: number;
  item_id: number;
  attribute_def_id: number;
  value_text?: string | null;
  value_number?: number | null;
  value_bool?: boolean | null;
  value_option_id?: number | null;
  value_option_code_snapshot?: string | null;
  value_unit_snapshot?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ItemAttributeValueInput = {
  attribute_def_id: number;
  value_text?: string | null;
  value_number?: number | null;
  value_bool?: boolean | null;
  value_option_id?: number | null;
};

type ListEnvelope<T> = {
  ok: boolean;
  data: T[];
};

function unwrapList<T>(resp: ListEnvelope<T>): T[] {
  return Array.isArray(resp.data) ? resp.data : [];
}

export async function fetchItemAttributeValues(itemId: number): Promise<ItemAttributeValue[]> {
  const resp = await apiGet<ListEnvelope<ItemAttributeValue>>(`/items/${itemId}/attributes`);
  return unwrapList(resp);
}

export async function replaceItemAttributeValues(
  itemId: number,
  values: ItemAttributeValueInput[],
): Promise<ItemAttributeValue[]> {
  const resp = await apiPut<ListEnvelope<ItemAttributeValue>>(`/items/${itemId}/attributes`, {
    values,
  });
  return unwrapList(resp);
}
