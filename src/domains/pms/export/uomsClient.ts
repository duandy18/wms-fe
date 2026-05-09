// src/domains/pms/export/uomsClient.ts

import { apiGet } from "../../../lib/api";
import type { PmsExportUom } from "./contracts/uom";

export type FetchPmsExportUomsParams = {
  itemIds?: number[];
  itemUomIds?: number[];
};

function cleanPositiveIds(values: number[] | undefined): number[] {
  if (!values?.length) return [];

  return Array.from(
    new Set(
      values
        .map((x) => Number(x))
        .filter((x) => Number.isInteger(x) && x > 0),
    ),
  ).sort((a, b) => a - b);
}

function requirePositiveInt(value: number, label: string): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error(`invalid ${label}`);
  }
  return n;
}

function buildUomsQuery(params?: FetchPmsExportUomsParams): string {
  const qs = new URLSearchParams();

  for (const id of cleanPositiveIds(params?.itemIds)) {
    qs.append("item_id", String(id));
  }

  for (const id of cleanPositiveIds(params?.itemUomIds)) {
    qs.append("item_uom_id", String(id));
  }

  const query = qs.toString();
  return query ? `?${query}` : "";
}

export async function fetchPmsExportUoms(
  params?: FetchPmsExportUomsParams,
): Promise<PmsExportUom[]> {
  return apiGet<PmsExportUom[]>(`/pms/export/uoms${buildUomsQuery(params)}`);
}

export async function fetchPmsExportUom(itemUomId: number): Promise<PmsExportUom> {
  const id = requirePositiveInt(itemUomId, "item_uom_id");
  return apiGet<PmsExportUom>(`/pms/export/uoms/${id}`);
}

export async function fetchPmsExportItemUoms(itemId: number): Promise<PmsExportUom[]> {
  const id = requirePositiveInt(itemId, "item_id");
  return apiGet<PmsExportUom[]>(`/pms/export/items/${id}/uoms`);
}

export async function fetchPmsExportUomsByItems(
  itemIds: number[],
): Promise<PmsExportUom[]> {
  return fetchPmsExportUoms({ itemIds });
}

export async function fetchPmsExportUomsByIds(
  itemUomIds: number[],
): Promise<PmsExportUom[]> {
  return fetchPmsExportUoms({ itemUomIds });
}
