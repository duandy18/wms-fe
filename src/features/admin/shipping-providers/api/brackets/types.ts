// src/features/admin/shipping-providers/api/brackets/types.ts

export type BracketPricingMode =
  | "flat"
  | "linear_total"
  | "step_over"
  | "manual_quote";

export type CreateZoneBracketPayload = {
  min_kg: number;
  max_kg?: number | null;

  pricing_mode: BracketPricingMode;

  flat_amount?: number;
  base_amount?: number;
  rate_per_kg?: number;
  base_kg?: number;

  active?: boolean;
};

export type PatchZoneBracketPayload = Partial<{
  min_kg: number;
  max_kg: number | null;

  pricing_mode: BracketPricingMode;

  flat_amount: number | null;
  base_amount: number | null;
  rate_per_kg: number | null;
  base_kg: number | null;

  active: boolean;
}>;
