// src/features/admin/shipping-providers/scheme/brackets/buildMirrorPriceJson.ts

import type { PricingMode, RoundingMode } from "./bracketCreateTypes";

export function buildMirrorPriceJson(
  mode: PricingMode,
  v: {
    flat_amount?: number;
    base_amount?: number;
    rate_per_kg?: number;
    rounding_mode?: RoundingMode;
    rounding_step_kg?: number;
  },
): Record<string, unknown> {
  if (mode === "flat") {
    return { kind: "flat", amount: v.flat_amount ?? 0 };
  }

  if (mode === "linear_total") {
    const pj: Record<string, unknown> = {
      kind: "linear_total",
      base_amount: v.base_amount ?? 0,
      rate_per_kg: v.rate_per_kg ?? 0,
    };
    if (v.rounding_mode && v.rounding_step_kg != null) {
      pj["rounding"] = { mode: v.rounding_mode, step_kg: v.rounding_step_kg };
    }
    return pj;
  }

  return { kind: "manual_quote", message: "manual quote required" };
}
