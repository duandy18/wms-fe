// src/features/tms/billing/types.ts

export interface CarrierBillImportRowError {
  row_no: number;
  message: string;
}

export interface CarrierBillImportResult {
  ok: boolean;
  carrier_code: string;
  imported_count: number;
  skipped_count: number;
  error_count: number;
  errors: CarrierBillImportRowError[];
}

export interface CarrierBillItem {
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

export interface CarrierBillItemsResponse {
  ok: boolean;
  rows: CarrierBillItem[];
  total: number;
}

export interface CarrierBillItemsQuery {
  carrier_code?: string;
  tracking_no?: string;
  limit: number;
  offset: number;
}
