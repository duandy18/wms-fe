// src/features/admin/shipping-providers/scheme/preview/types.ts

export type QuoteStatus = "OK" | "MANUAL_REQUIRED" | string;

export type WeightInfo = {
  real_weight_kg?: number;
  vol_weight_kg?: number;
  billable_weight_kg_raw?: number;
  billable_weight_kg?: number;
};

export type ZoneHitMember = {
  id: number;
  level: string;
  value: string;
};

export type ZoneHit = {
  id: number;
  name: string;
  priority?: number;
  hit_member?: ZoneHitMember | null;
};

export type BracketHit = {
  id: number;
  min_kg: number;
  max_kg: number | null;
  pricing_mode: "flat" | "linear_total" | "manual_quote" | string;
  flat_amount?: number | null;
  base_amount?: number | null;
  rate_per_kg?: number | null;
};

export type QuoteSurchargeOut = {
  id: number;
  name: string;
  amount: number;
  detail?: Record<string, unknown>;
  condition?: Record<string, unknown>;
};

export type BreakdownBase =
  | {
      amount: number;
      kind: "flat" | "linear_total" | "manual_quote" | string;
      billable_weight_kg?: number;
      source?: string;
      base_amount?: number;
      rate_per_kg?: number;
      message?: string;
    }
  | Record<string, unknown>;

export type BreakdownSummary = {
  base_amount?: number;
  surcharge_amount?: number;
  total_amount?: number | null;
};

export type CalcOut = {
  ok: boolean;
  quote_status: QuoteStatus;
  currency?: string | null;
  total_amount?: number | null;

  weight: WeightInfo;

  zone?: ZoneHit | null;
  bracket?: BracketHit | null;

  breakdown: {
    base?: BreakdownBase;
    surcharges?: QuoteSurchargeOut[];
    summary?: BreakdownSummary;
  };

  reasons?: string[];
  reason?: string | null;
};

export type Dims = { length_cm: number; width_cm: number; height_cm: number };
