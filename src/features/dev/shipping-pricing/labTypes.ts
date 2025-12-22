// src/features/dev/shipping-pricing/labTypes.ts

export type CalcReq = {
  scheme_id: number;
  dest: {
    province: string | null;
    city: string | null;
    district: string | null;
  };
  real_weight_kg: number;
  length_cm?: number | null;
  width_cm?: number | null;
  height_cm?: number | null;
  flags?: string[];
};

export type CalcOut = Record<string, unknown>;

export type Dims = { length_cm: number; width_cm: number; height_cm: number };

// ======================================================
// Recommend（多 provider 对比）
// ======================================================

export type RecommendReq = {
  provider_ids?: number[];
  dest: {
    province: string | null;
    city: string | null;
    district: string | null;
  };
  real_weight_kg: number;
  length_cm?: number | null;
  width_cm?: number | null;
  height_cm?: number | null;
  flags?: string[];
  max_results?: number;
};

export type RecommendQuote = Record<string, unknown>;

export type RecommendOut = {
  ok: boolean;
  recommended_scheme_id?: number | null;
  quotes: RecommendQuote[];
};
