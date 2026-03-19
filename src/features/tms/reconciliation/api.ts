// src/features/tms/reconciliation/api.ts

import { apiGet, apiPost } from "../../../lib/api";
import type {
  ApproveShippingBillReconciliationIn,
  ApproveShippingBillReconciliationOut,
  ReconcileCarrierBillIn,
  ReconcileCarrierBillResult,
  ShippingBillReconciliationHistoriesQuery,
  ShippingBillReconciliationHistoriesResponse,
  ShippingBillReconciliationsQuery,
  ShippingBillReconciliationsResponse,
} from "./types";

export async function fetchShippingBillReconciliations(
  query: ShippingBillReconciliationsQuery,
): Promise<ShippingBillReconciliationsResponse> {
  return await apiGet<ShippingBillReconciliationsResponse>(
    "/tms/billing/reconciliations",
    query,
  );
}

export async function fetchShippingBillReconciliationHistories(
  query: ShippingBillReconciliationHistoriesQuery,
): Promise<ShippingBillReconciliationHistoriesResponse> {
  return await apiGet<ShippingBillReconciliationHistoriesResponse>(
    "/tms/billing/reconciliation-histories",
    query,
  );
}

export async function reconcileShippingBill(
  payload: ReconcileCarrierBillIn,
): Promise<ReconcileCarrierBillResult> {
  return await apiPost<ReconcileCarrierBillResult>(
    "/tms/billing/reconcile",
    payload,
  );
}

export async function approveShippingBillReconciliation(
  reconciliationId: number,
  payload: ApproveShippingBillReconciliationIn,
): Promise<ApproveShippingBillReconciliationOut> {
  return await apiPost<ApproveShippingBillReconciliationOut>(
    `/tms/billing/reconciliations/${reconciliationId}/approve`,
    payload,
  );
}
