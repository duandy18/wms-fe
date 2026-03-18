// src/features/tms/reconciliation/api.ts

import { apiGet } from "../../../lib/api";
import type {
  ShippingBillReconciliationDetailResponse,
  ShippingBillReconciliationsQuery,
  ShippingBillReconciliationsResponse,
} from "./types";

export async function fetchShippingBillReconciliations(
  query: ShippingBillReconciliationsQuery,
): Promise<ShippingBillReconciliationsResponse> {
  return await apiGet<ShippingBillReconciliationsResponse>(
    "/shipping-bills/reconciliations",
    query,
  );
}

export async function fetchShippingBillReconciliationDetail(
  reconciliationId: number,
): Promise<ShippingBillReconciliationDetailResponse> {
  return await apiGet<ShippingBillReconciliationDetailResponse>(
    `/shipping-bills/reconciliations/${reconciliationId}`,
  );
}
