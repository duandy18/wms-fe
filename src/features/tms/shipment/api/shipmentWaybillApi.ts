// src/features/tms/shipment/api/shipmentWaybillApi.ts
import { apiPost } from "../../../../lib/api";

export interface ShipWithWaybillPayload {
  platform: string;
  shop_id: string;
  ext_order_no: string;

  package_no: number;

  receiver_name?: string;
  receiver_phone?: string;
  province?: string;
  city?: string;
  district?: string;
  address_detail?: string;

  meta?: Record<string, unknown>;
}

export interface ShipWithWaybillResponse {
  ok: boolean;
  ref: string;
  package_no: number;
  tracking_no: string;
  shipping_provider_id: number;
  carrier_code?: string | null;
  carrier_name?: string | null;
  status: string;
  print_data?: Record<string, unknown> | null;
  template_url?: string | null;
}

export async function shipWithWaybill(
  payload: ShipWithWaybillPayload,
): Promise<ShipWithWaybillResponse> {
  const { platform, shop_id, ext_order_no, meta, ...body } = payload;

  const path = `/orders/${encodeURIComponent(platform)}/${encodeURIComponent(
    shop_id,
  )}/${encodeURIComponent(ext_order_no)}/ship-with-waybill`;

  const finalBody: Record<string, unknown> = { ...body };

  if (meta && Object.keys(meta).length > 0) {
    finalBody["meta"] = { extra: meta };
  }

  return apiPost<ShipWithWaybillResponse>(path, finalBody);
}
