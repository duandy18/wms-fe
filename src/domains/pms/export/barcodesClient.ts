// src/domains/pms/export/barcodesClient.ts

import { apiGet } from "../../../lib/api";
import type { PmsExportBarcode } from "./contracts/barcode";

export type FetchPmsExportBarcodesParams = {
  itemIds?: number[];
  itemUomIds?: number[];
  barcode?: string | null;
  active?: boolean;
  primaryOnly?: boolean;
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

function buildBarcodesQuery(params?: FetchPmsExportBarcodesParams): string {
  const qs = new URLSearchParams();

  for (const id of cleanPositiveIds(params?.itemIds)) {
    qs.append("item_id", String(id));
  }

  for (const id of cleanPositiveIds(params?.itemUomIds)) {
    qs.append("item_uom_id", String(id));
  }

  const code = String(params?.barcode ?? "").trim();
  if (code) {
    qs.set("barcode", code);
  }

  if (params?.active !== undefined) {
    qs.set("active", String(params.active));
  }

  if (params?.primaryOnly === true) {
    qs.set("primary_only", "true");
  }

  const query = qs.toString();
  return query ? `?${query}` : "";
}

export async function fetchPmsExportBarcodes(
  params?: FetchPmsExportBarcodesParams,
): Promise<PmsExportBarcode[]> {
  return apiGet<PmsExportBarcode[]>(
    `/pms/export/barcodes${buildBarcodesQuery(params)}`,
  );
}

export async function fetchPmsExportBarcode(
  barcodeId: number,
): Promise<PmsExportBarcode> {
  const id = requirePositiveInt(barcodeId, "barcode_id");
  return apiGet<PmsExportBarcode>(`/pms/export/barcodes/${id}`);
}

export async function fetchPmsExportItemBarcodes(
  itemId: number,
  params?: Pick<FetchPmsExportBarcodesParams, "active" | "primaryOnly">,
): Promise<PmsExportBarcode[]> {
  const id = requirePositiveInt(itemId, "item_id");
  const qs = new URLSearchParams();

  if (params?.active !== undefined) {
    qs.set("active", String(params.active));
  }

  if (params?.primaryOnly === true) {
    qs.set("primary_only", "true");
  }

  const query = qs.toString();
  return apiGet<PmsExportBarcode[]>(
    `/pms/export/items/${id}/barcodes${query ? `?${query}` : ""}`,
  );
}

export async function fetchPmsExportBarcodesByItems(
  itemIds: number[],
): Promise<PmsExportBarcode[]> {
  return fetchPmsExportBarcodes({ itemIds });
}

export async function fetchPmsExportPrimaryBarcodesByItems(
  itemIds: number[],
): Promise<PmsExportBarcode[]> {
  return fetchPmsExportBarcodes({
    itemIds,
    active: true,
    primaryOnly: true,
  });
}
