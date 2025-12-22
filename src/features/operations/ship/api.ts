// src/features/operations/ship/api.ts
import { apiPost, apiGet, apiPatch } from "../../../lib/api";

export type QuoteStatus = "OK" | "MANUAL_REQUIRED" | "NO_ZONE" | "NO_BRACKET" | "SCHEME_NOT_EFFECTIVE";

export interface QuoteWeightInfo {
  real_weight_kg: number;
  vol_weight_kg: number;
  billable_weight_kg_raw: number;
  billable_weight_kg: number;
}

export interface QuoteBreakdown {
  base: Record<string, unknown>;
  surcharges: Array<{
    id: number;
    name: string;
    amount: number;
    detail?: Record<string, unknown>;
    condition?: Record<string, unknown>;
  }>;
}

export interface ShipQuote {
  provider_id: number;
  carrier_code: string | null;
  carrier_name: string;

  scheme_id: number;
  scheme_name: string;

  total_amount: number;
  currency?: string | null;
  quote_status: QuoteStatus;

  reasons: string[];

  weight: QuoteWeightInfo;
  zone?: Record<string, unknown> | null;
  bracket?: Record<string, unknown> | null;
  breakdown: QuoteBreakdown;
}

export interface ShipCalcRequest {
  real_weight_kg: number;
  province?: string;
  city?: string;
  district?: string;

  length_cm?: number;
  width_cm?: number;
  height_cm?: number;

  flags?: string[];
  provider_ids?: number[];
  max_results?: number;
}

export interface ShipCalcResponse {
  ok: boolean;
  recommended_scheme_id?: number | null;
  quotes: ShipQuote[];
}

function normalizeReasons(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x)).filter(Boolean);
}

export async function calcShipQuotes(payload: ShipCalcRequest): Promise<ShipCalcResponse> {
  const res = await apiPost<ShipCalcResponse>("/shipping-quote/recommend", {
    provider_ids: payload.provider_ids ?? [],
    dest: {
      province: payload.province ?? null,
      city: payload.city ?? null,
      district: payload.district ?? null,
    },
    real_weight_kg: payload.real_weight_kg,
    length_cm: payload.length_cm ?? null,
    width_cm: payload.width_cm ?? null,
    height_cm: payload.height_cm ?? null,
    flags: payload.flags ?? [],
    max_results: payload.max_results ?? 10,
  });

  const quotes = (res.quotes ?? []).map((q) => {
    const reasonsRaw = (q as unknown as { reasons?: unknown }).reasons;
    return { ...q, reasons: normalizeReasons(reasonsRaw) };
  });

  return { ...res, quotes };
}

// ======================================================
// prepare-from-order
// ======================================================

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

  receiver_name?: string | null;
  receiver_phone?: string | null;
  address_detail?: string | null;

  items: ShipPrepareItem[];
  total_qty: number;
  weight_kg?: number | null;

  trace_id?: string | null;
}

export async function prepareShipFromOrder(payload: ShipPrepareRequest): Promise<ShipPrepareResponse> {
  return apiPost<ShipPrepareResponse>("/ship/prepare-from-order", payload);
}

// ======================================================
// ship-with-waybill
// ======================================================

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

export async function shipWithWaybill(payload: ShipWithWaybillPayload): Promise<ShipWithWaybillResponse> {
  const { platform, shop_id, ext_order_no, quote_snapshot, ...body } = payload;

  const path = `/orders/${encodeURIComponent(platform)}/${encodeURIComponent(shop_id)}/${encodeURIComponent(ext_order_no)}/ship-with-waybill`;

  const finalBody: Record<string, unknown> = { ...body };
  finalBody["meta"] = { quote_snapshot };

  return apiPost<ShipWithWaybillResponse>(path, finalBody);
}

export type ShippingRecordView = Record<string, unknown>;

export async function fetchShippingRecordsByRef(orderRef: string): Promise<ShippingRecordView[]> {
  return apiGet<ShippingRecordView[]>(`/shipping-records/by-ref/${encodeURIComponent(orderRef)}`);
}

export async function patchShippingRecord(id: number, payload: Record<string, unknown>): Promise<ShippingRecordView> {
  return apiPatch<ShippingRecordView>(`/shipping-records/${id}`, payload);
}
