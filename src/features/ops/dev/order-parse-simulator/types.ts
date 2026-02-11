// src/features/ops/dev/order-parse-simulator/types.ts

export type JsonObject = Record<string, unknown>;

export type VariantRow = {
  variant_name: string;
  filled_code: string;
};

export type GenerateParams = {
  count: number;
  lines_min: number;
  lines_max: number;
  qty_min: number;
  qty_max: number;
  rng_seed: number;
};

export type RunPayload = {
  seed: JsonObject;
  generate: GenerateParams;
  watch_filled_codes: string[];
  with_replay: boolean;
};

export type RunResult = {
  report?: JsonObject;
  gen_stats?: JsonObject;
} & JsonObject;
