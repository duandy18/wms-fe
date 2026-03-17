// src/features/tms/records/types.ts

export interface ShippingLedgerRow {
  id: number;
  order_ref: string;
  warehouse_id: number | null;
  shipping_provider_id: number | null;
  carrier_code: string | null;
  carrier_name: string | null;
  tracking_no: string | null;
  gross_weight_kg: number | null;
  cost_estimated: number | null;
  dest_province: string | null;
  dest_city: string | null;
  created_at: string;
}

export interface ShippingLedgerListResponse {
  ok: boolean;
  rows: ShippingLedgerRow[];
  total: number;
}

export interface ShippingLedgerQuery {
  from_date?: string;
  to_date?: string;
  order_ref?: string;
  tracking_no?: string;
  carrier_code?: string;
  province?: string;
  city?: string;
  warehouse_id?: number;
  limit: number;
  offset: number;
}
