// src/features/admin/shipping-providers/scheme/brackets/bracketWriteBody.ts
//
// Bracket 写入 body 构建（纯函数）
// - 把 buildPayloadFromDraft 的结果转成后端 create/patch body
// - 不做 UI、不做请求

import type { buildPayloadFromDraft } from "./quoteModel";

export type BracketWriteBody = {
  pricing_mode: "flat" | "linear_total" | "step_over" | "manual_quote";
  flat_amount?: number;
  base_amount?: number;
  rate_per_kg?: number;
  base_kg?: number;
};

export function buildBracketWriteBody(p: ReturnType<typeof buildPayloadFromDraft>): BracketWriteBody {
  if (p.pricing_mode === "flat") {
    return { pricing_mode: "flat", flat_amount: p.flat_amount ?? 0 };
  }
  if (p.pricing_mode === "linear_total") {
    return { pricing_mode: "linear_total", base_amount: p.base_amount ?? 0, rate_per_kg: p.rate_per_kg ?? 0 };
  }
  if (p.pricing_mode === "step_over") {
    return {
      pricing_mode: "step_over",
      base_kg: p.base_kg ?? 0,
      base_amount: p.base_amount ?? 0,
      rate_per_kg: p.rate_per_kg ?? 0,
    };
  }
  return { pricing_mode: "manual_quote" };
}
