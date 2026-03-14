// src/features/shipment/api/shipmentStatusApi.ts
import { apiPost } from "../../../lib/api";
import type { ShipmentStatus } from "../domain/shipmentStatus";
import type { ShippingRecord } from "./shippingRecordsApi";

export interface UpdateShipmentStatusPayload {
  status: ShipmentStatus;
  delivery_time?: string | null;
  error_code?: string | null;
  error_message?: string | null;
  meta?: Record<string, unknown> | null;
}

export async function updateShipmentStatus(
  recordId: number,
  payload: UpdateShipmentStatusPayload,
): Promise<ShippingRecord> {
  return apiPost<ShippingRecord>(
    `/shipping-records/${recordId}/status`,
    payload,
  );
}
