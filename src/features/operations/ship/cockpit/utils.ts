// src/features/operations/ship/cockpit/utils.ts

import type { ShipQuote } from "../api";

export type ShipApiErrorShape = { message?: string };

export function parseOrderRef(ref: string): { platform: string; shopId: string; extOrderNo: string } {
  const parts = ref.split(":");
  if (parts.length >= 4 && parts[0] === "ORD") {
    return {
      platform: parts[1] || "PDD",
      shopId: parts[2] || "1",
      extOrderNo: parts.slice(3).join(":"),
    };
  }
  return { platform: "PDD", shopId: "1", extOrderNo: ref };
}

export function buildQuoteSnapshot(
  input: {
    dest: { province: string; city: string; district: string };
    real_weight_kg: number;
    packaging_weight_kg: number | null;
    dims_cm: null;
    flags: string[];
  },
  quote: ShipQuote,
) {
  return {
    input,
    selected_quote: {
      provider_id: quote.provider_id,
      scheme_id: quote.scheme_id,
      scheme_name: quote.scheme_name,
      carrier_code: quote.carrier_code,
      carrier_name: quote.carrier_name,
      currency: quote.currency ?? "CNY",
      total_amount: quote.total_amount,
      weight: quote.weight,
      zone: quote.zone ?? null,
      bracket: quote.bracket ?? null,
      breakdown: quote.breakdown,
      reasons: quote.reasons ?? [],
    },
  };
}
