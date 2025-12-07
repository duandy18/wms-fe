// src/features/operations/ship/api.ts
import { apiPost } from "../../../lib/api";

export interface ShipQuote {
  carrier: string;
  name: string;
  est_cost: number;
  eta?: string | null;
  formula?: string | null;
}

export interface ShipCalcRequest {
  weight_kg: number;
  province?: string;
  city?: string;
  district?: string;
  debug_ref?: string;
}

export interface ShipCalcResponse {
  ok: boolean;
  weight_kg: number;
  dest?: string | null;
  quotes: ShipQuote[];
  recommended?: string | null;
}

export async function calcShipQuotes(
  payload: ShipCalcRequest,
): Promise<ShipCalcResponse> {
  const res = await apiPost<ShipCalcResponse>("/ship/calc", payload);
  return res;
}

// ---------------- prepare-from-order ----------------

export interface ShipPrepareItem {
  item_id: number;
  qty: number;
}

export interface ShipPrepareRequest {
  platform: string;
  shop_id: string;
  ext_order_no: string;
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

  // 收件人信息（从 order_address 带出）
  receiver_name?: string | null;
  receiver_phone?: string | null;
  address_detail?: string | null;

  items: ShipPrepareItem[];
  total_qty: number;
  weight_kg?: number | null;

  // 订单 trace_id，用来在 /ship/confirm 时挂到生命周期上
  trace_id?: string | null;
}

export async function prepareShipFromOrder(
  payload: ShipPrepareRequest,
): Promise<ShipPrepareResponse> {
  const res = await apiPost<ShipPrepareResponse>(
    "/ship/prepare-from-order",
    payload,
  );
  return res;
}

// ---------------- confirm（旧 API，可能仍用于 DevConsole 等） ----------------

export interface ShipConfirmRequest {
  ref: string;
  platform: string;
  shop_id: string;
  trace_id?: string;

  // 物流公司
  carrier?: string;
  carrier_name?: string;

  // 运单
  tracking_no?: string;

  // 重量
  gross_weight_kg?: number;
  packaging_weight_kg?: number;

  // 费用
  cost_estimated?: number;
  cost_real?: number;

  // 状态 / 时效
  delivery_time?: string; // ISO 字符串
  status?: string;

  // 错误信息
  error_code?: string;
  error_message?: string;

  // 额外元数据
  meta?: Record<string, unknown>;
}

export interface ShipConfirmResponse {
  ok: boolean;
  ref: string;
  trace_id?: string;
}

export async function confirmShip(
  payload: ShipConfirmRequest,
): Promise<ShipConfirmResponse> {
  const res = await apiPost<ShipConfirmResponse>("/ship/confirm", payload);
  return res;
}

// ---------------- ship-with-waybill（模式 2） ----------------

export interface ShipWithWaybillPayload {
  platform: string;
  shop_id: string;
  ext_order_no: string;

  warehouse_id: number;
  carrier_code: string;
  carrier_name?: string;
  weight_kg: number;

  receiver_name?: string;
  receiver_phone?: string;
  province?: string;
  city?: string;
  district?: string;
  address_detail?: string;
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
  const { platform, shop_id, ext_order_no, ...body } = payload;
  const path = `/orders/${encodeURIComponent(
    platform,
  )}/${encodeURIComponent(shop_id)}/${encodeURIComponent(
    ext_order_no,
  )}/ship-with-waybill`;
  return apiPost<ShipWithWaybillResponse>(path, body);
}
