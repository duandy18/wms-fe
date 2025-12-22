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
