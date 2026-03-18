// src/features/tms/billing/api.ts

import { apiGet, apiRequest } from "../../../lib/api";
import type {
  CarrierBillImportResult,
  CarrierBillItemsQuery,
  CarrierBillItemsResponse,
} from "./types";

export async function importCarrierBill(
  formData: FormData,
): Promise<CarrierBillImportResult> {
  return await apiRequest<CarrierBillImportResult>("/tms/billing/import", {
    method: "POST",
    body: formData,
  });
}

export async function fetchCarrierBillItems(
  query: CarrierBillItemsQuery,
): Promise<CarrierBillItemsResponse> {
  return await apiGet<CarrierBillItemsResponse>("/tms/billing/items", query);
}
