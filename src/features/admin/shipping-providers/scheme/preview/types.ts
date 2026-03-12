// src/features/admin/shipping-providers/scheme/preview/types.ts

export type QuoteStatus = "OK" | "MANUAL_REQUIRED" | string;

export type WeightInfo = {
  real_weight_kg?: number;
  vol_weight_kg?: number;
  billable_weight_kg_raw?: number;
  billable_weight_kg?: number;
  rounding?: {
    mode?: string;
    step_kg?: number;
  } | null;
  rounding_source?: string;
};

export type DestinationGroupHitMember = {
  id: number;
  level: string;
  value: string;
  province_code?: string | null;
  province_name?: string | null;
};

export type DestinationGroupHit = {
  id: number;
  name: string;
  hit_member?: DestinationGroupHitMember | null;
  source?: string;
};

export type PricingMatrixHit = {
  id: number;
  module_range_id: number;
  min_kg: number;
  max_kg: number | null;
  pricing_mode: "flat" | "linear_total" | "step_over" | "manual_quote" | string;
  flat_amount?: number | null;
  base_amount?: number | null;
  rate_per_kg?: number | null;
  base_kg?: number | null;
  source?: string;
};

export type QuoteSurchargeOut = {
  id: number;
  name: string;
  scope?: "province" | "city" | string;
  province_code?: string | null;
  city_code?: string | null;
  province_name?: string | null;
  city_name?: string | null;
  amount: number;
  detail?: Record<string, unknown>;
};

export type BreakdownBase =
  | {
      amount: number;
      kind: "flat" | "linear_total" | "step_over" | "manual_quote" | string;
      billable_weight_kg?: number;
      source?: string;
      base_amount?: number;
      rate_per_kg?: number;
      base_kg?: number;
      message?: string;
    }
  | Record<string, unknown>;

export type BreakdownSummary = {
  base_amount?: number;
  surcharge_amount?: number;
  extra_amount?: number;
  total_amount?: number | null;
};

export type CalcOut = {
  ok: boolean;
  quote_status: QuoteStatus;
  currency?: string | null;
  total_amount?: number | null;

  weight: WeightInfo;

  destination_group?: DestinationGroupHit | null;
  pricing_matrix?: PricingMatrixHit | null;

  breakdown: {
    base?: BreakdownBase;
    surcharges?: QuoteSurchargeOut[];
    summary?: BreakdownSummary;
  };

  reasons?: string[];
  reason?: string | null;
};

export type Dims = { length_cm: number; width_cm: number; height_cm: number };
