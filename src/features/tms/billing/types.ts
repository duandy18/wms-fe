// src/features/tms/billing/types.ts

export interface CarrierBillImportRowError {
  row_no: number;
  message: string;
}

export interface CarrierBillImportResult {
  ok: boolean;
  carrier_code: string;
  import_batch_no: string;
  imported_count: number;
  skipped_count: number;
  error_count: number;
  errors: CarrierBillImportRowError[];
}

export interface CarrierBillItem {
  id: number;
  import_batch_no: string;
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

export interface CarrierBillItemsResponse {
  ok: boolean;
  rows: CarrierBillItem[];
  total: number;
}

export interface CarrierBillItemsQuery {
  import_batch_no?: string;
  carrier_code?: string;
  tracking_no?: string;
  limit: number;
  offset: number;
}

export interface ReconcileCarrierBillIn {
  carrier_code: string;
  import_batch_no: string;
}

export interface ReconcileCarrierBillResult {
  ok: boolean;
  carrier_code: string;
  import_batch_no: string;
  bill_item_count: number;
  matched_count: number;
  diff_count: number;
  unmatched_count: number;
  updated_count: number;
  duplicate_bill_tracking_count: number;
}
