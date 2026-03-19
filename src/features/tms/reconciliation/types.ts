// src/features/tms/reconciliation/types.ts

export type ReconciliationStatus = "diff" | "bill_only";
export type ApprovedReasonCode = "matched" | "approved_bill_only" | "resolved";
export type ReconciliationHistoryResultStatus = "matched" | "approved_bill_only" | "resolved";

export interface ReconciliationCarrierOption {
  code: string;
  name: string;
}

export interface ReconcileCarrierBillIn {
  carrier_code: string;
}

export interface ReconcileCarrierBillResult {
  ok: boolean;
  carrier_code: string;
  bill_item_count: number;
  matched_count: number;
  bill_only_count: number;
  diff_count: number;
  updated_count: number;
  duplicate_bill_tracking_count: number;
}

export interface ShippingBillReconciliationsQuery {
  carrier_code?: string;
  tracking_no?: string;
  status?: ReconciliationStatus | "";
  limit: number;
  offset: number;
}

export interface ShippingBillReconciliationRow {
  reconciliation_id: number;
  status: ReconciliationStatus;
  carrier_code: string;
  tracking_no: string;
  shipping_record_id: number | null;
  carrier_bill_item_id: number;
  weight_diff_kg: number | null;
  cost_diff: number | null;
  adjust_amount: number | null;
  approved_reason_code: ApprovedReasonCode | null;
  approved_reason_text: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface ShippingBillReconciliationsResponse {
  ok: boolean;
  rows: ShippingBillReconciliationRow[];
  total: number;
}

export interface ShippingBillReconciliationHistoriesQuery {
  carrier_code?: string;
  tracking_no?: string;
  result_status?: ReconciliationHistoryResultStatus | "";
  limit: number;
  offset: number;
}

export interface ShippingBillReconciliationHistoryRow {
  id: number;
  carrier_bill_item_id: number;
  shipping_record_id: number | null;
  carrier_code: string;
  tracking_no: string;
  result_status: ReconciliationHistoryResultStatus;
  approved_reason_code: ApprovedReasonCode;
  weight_diff_kg: number | null;
  cost_diff: number | null;
  adjust_amount: number | null;
  approved_reason_text: string | null;
  archived_at: string;
}

export interface ShippingBillReconciliationHistoriesResponse {
  ok: boolean;
  rows: ShippingBillReconciliationHistoryRow[];
  total: number;
}

export interface ApproveShippingBillReconciliationIn {
  approved_reason_code: "approved_bill_only" | "resolved";
  adjust_amount: number | null;
  approved_reason_text: string | null;
}

export interface ApproveShippingBillReconciliationOut {
  ok: boolean;
  reconciliation_id: number;
  history_result_status: ReconciliationHistoryResultStatus;
}
