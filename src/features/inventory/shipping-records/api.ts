// src/features/inventory/shipping-records/api.ts
import { apiGet } from "../../../lib/api";

export interface ShippingRecord {
  id: number;
  order_ref: string;
  platform: string;
  shop_id: string;
  warehouse_id?: number | null;

  carrier_code?: string | null;
  carrier_name?: string | null;
  tracking_no?: string | null;

  trace_id?: string | null;

  weight_kg?: number | null;
  gross_weight_kg?: number | null;
  packaging_weight_kg?: number | null;

  cost_estimated?: number | null;
  cost_real?: number | null;

  delivery_time?: string | null;
  status?: string | null;

  error_code?: string | null;
  error_message?: string | null;

  meta?: Record<string, unknown> | null;
  created_at: string;
}

export async function fetchShippingRecordsByRef(
  orderRef: string,
): Promise<ShippingRecord[]> {
  const path = `/shipping-records/by-ref/${encodeURIComponent(orderRef)}`;
  return apiGet<ShippingRecord[]>(path);
}

export async function fetchShippingRecordById(
  id: number,
): Promise<ShippingRecord> {
  const path = `/shipping-records/${id}`;
  return apiGet<ShippingRecord>(path);
}
