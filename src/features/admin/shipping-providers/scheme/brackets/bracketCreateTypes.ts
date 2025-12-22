// src/features/admin/shipping-providers/scheme/brackets/bracketCreateTypes.ts

export type RoundingMode = "ceil" | "floor" | "round";

// 仅保留：flat / linear_total / manual_quote
export type PricingMode = "flat" | "linear_total" | "manual_quote";

export type CreateBracketPayload = {
  min_kg: number;
  max_kg: number | null;

  // 兼容字段（旧）
  pricing_kind: string;
  price_json: Record<string, unknown>;

  // Phase 4：结构化字段（新）
  pricing_mode?: PricingMode;

  // flat
  flat_amount?: number;

  // linear_total: 票费 + 总重 * 单价
  base_amount?: number;
  rate_per_kg?: number;

  rounding_mode?: RoundingMode;
  rounding_step_kg?: number;
};

export function isFiniteNonNeg(n: number): boolean {
  return Number.isFinite(n) && n >= 0;
}

export function normalizeOptionalNum(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  return n;
}
