// src/features/shipment/api/shipmentPrepareApi.ts
import { apiPost } from "../../../lib/api";

export interface ShipPrepareItem {
  item_id: number;
  qty: number;
  sku?: string | null;
  title?: string | null;
  unit_weight_kg?: number | null;
  line_weight_kg?: number | null;
}

export interface ShipPrepareRequest {
  platform: string;
  shop_id: string;
  ext_order_no: string;
}

/**
 * ✅ 新合同：候选仓来自省级路由命中集合（不兜底、不预设）
 */
export interface CandidateWarehouse {
  warehouse_id: number;
  warehouse_name?: string | null;
  warehouse_code?: string | null;
  warehouse_active: boolean;
  priority: number;
}

export interface FulfillmentMissingLine {
  item_id: number;
  need: number;
  available: number;
}

export type FulfillmentScanStatus = "OK" | "INSUFFICIENT" | string;

export interface FulfillmentScanWarehouse {
  warehouse_id: number;
  status: FulfillmentScanStatus;
  missing: FulfillmentMissingLine[];
}

export interface ShipPrepareResponse {
  ok: boolean;
  order_id: number;
  platform: string;
  shop_id: string;
  ext_order_no: string;
  ref: string;

  province?: string | null;
  city?: string | null;
  district?: string | null;

  receiver_name?: string | null;
  receiver_phone?: string | null;
  address_detail?: string | null;

  items: ShipPrepareItem[];
  total_qty: number;
  weight_kg?: number | null;

  trace_id?: string | null;
  execution_stage?: string | null;
  ship_committed_at?: string | null;
  shipped_at?: string | null;

  /**
   * ✅ 不预设：warehouse_id 通常为 null，让操作员选择
   * warehouse_reason 用于提示 “为什么需要人工/为什么 blocked”
   */
  warehouse_id?: number | null;
  warehouse_reason?: string | null;

  candidate_warehouses?: CandidateWarehouse[];
  fulfillment_scan?: FulfillmentScanWarehouse[];

  fulfillment_status?: "OK" | "FULFILLMENT_BLOCKED" | string;
  blocked_reasons?: string[];
  blocked_detail?: Record<string, unknown> | null;
}

export async function prepareShipFromOrder(
  payload: ShipPrepareRequest,
): Promise<ShipPrepareResponse> {
  return apiPost<ShipPrepareResponse>("/ship/prepare-from-order", payload);
}
