// src/features/shipment/api/shipmentWaybillApi.ts
import { apiPost } from "../../../lib/api";

export interface ShipWithWaybillPayload {
  platform: string;
  shop_id: string;
  ext_order_no: string;

  warehouse_id: number;

  carrier_code: string;
  carrier_name?: string;

  weight_kg: number;

  receiver_name: string;
  receiver_phone: string;
  province: string;
  city: string;
  district: string;
  address_detail: string;

  quote_snapshot: Record<string, unknown>;
}

export interface ShipWithWaybillResponse {
  ok: boolean;
  ref: string;
  tracking_no: string;
  carrier_code: string;
  carrier_name?: string;
  status: string;
  label_base64?: string | null;
  label_format?: string | null;
}

export async function shipWithWaybill(
  payload: ShipWithWaybillPayload,
): Promise<ShipWithWaybillResponse> {
  const { platform, shop_id, ext_order_no, quote_snapshot, ...body } = payload;

  const path = `/orders/${encodeURIComponent(platform)}/${encodeURIComponent(
    shop_id,
  )}/${encodeURIComponent(ext_order_no)}/ship-with-waybill`;

  const finalBody: Record<string, unknown> = { ...body };
  finalBody["meta"] = { quote_snapshot };

  return apiPost<ShipWithWaybillResponse>(path, finalBody);
}
