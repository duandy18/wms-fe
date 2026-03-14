// src/features/shipment/api/shipmentQuoteApi.ts
import { apiPost } from "../../../lib/api";

export type QuoteStatus =
  | "OK"
  | "MANUAL_REQUIRED"
  | "NO_ZONE"
  | "NO_BRACKET"
  | "SCHEME_NOT_EFFECTIVE";

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
  warehouse_id: number;

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

export async function calcShipQuotes(
  payload: ShipCalcRequest,
): Promise<ShipCalcResponse> {
  const res = await apiPost<ShipCalcResponse>("/shipping-quote/recommend", {
    warehouse_id: payload.warehouse_id,
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
