// src/features/tms/reconciliation/types.ts

export type ReconciliationStatus = "diff" | "bill_only" | "record_only";

export interface ReconcileCarrierBillIn {
  carrier_code: string;
}

export interface ReconcileCarrierBillResult {
  ok: boolean;
  carrier_code: string;
  bill_item_count: number;
  diff_count: number;
  bill_only_count: number;
  record_only_count: number;
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
  carrier_bill_item_id: number | null;
  business_time: string | null;
  destination_province: string | null;
  destination_city: string | null;
  billing_weight_kg: number | null;
  gross_weight_kg: number | null;
  weight_diff_kg: number | null;
  freight_amount: number | null;
  surcharge_amount: number | null;
  bill_cost_real: number | null;
  total_amount: number | null;
  cost_estimated: number | null;
  cost_diff: number | null;
  adjust_amount: number | null;
  created_at: string;
}

export interface ShippingBillReconciliationsResponse {
  ok: boolean;
  rows: ShippingBillReconciliationRow[];
  total: number;
}

export interface ReconciliationBillItemDetail {
  id: number;
  carrier_code: string;
  bill_month: string | null;
  tracking_no: string;
  business_time: string | null;
  destination_province: string | null;
  destination_city: string | null;
  billing_weight_kg: number | null;
  freight_amount: number | null;
  surcharge_amount: number | null;
  total_amount: number | null;
  settlement_object: string | null;
  order_customer: string | null;
  sender_name: string | null;
  network_name: string | null;
  size_text: string | null;
  parent_customer: string | null;
  raw_payload: Record<string, unknown>;
  created_at: string;
}

export interface ReconciliationShippingRecordDetail {
  id: number;
  order_ref: string;
  platform: string;
  shop_id: string;
  carrier_code: string | null;
  carrier_name: string | null;
  tracking_no: string | null;
  gross_weight_kg: number | null;
  cost_estimated: number | null;
  warehouse_id: number;
  shipping_provider_id: number;
  dest_province: string | null;
  dest_city: string | null;
  created_at: string;
}

export interface ShippingBillReconciliationDetail {
  id: number;
  status: ReconciliationStatus;
  carrier_code: string;
  tracking_no: string;
  shipping_record_id: number | null;
  carrier_bill_item_id: number | null;
  weight_diff_kg: number | null;
  cost_diff: number | null;
  adjust_amount: number | null;
  created_at: string;
}

export interface ShippingBillReconciliationDetailResponse {
  ok: boolean;
  reconciliation: ShippingBillReconciliationDetail;
  bill_item: ReconciliationBillItemDetail | null;
  shipping_record: ReconciliationShippingRecordDetail | null;
}
