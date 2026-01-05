// src/features/admin/shipping-providers/scheme/brackets/useBracketsPanelModel_internal/payload.ts
//
// Brackets 写入 payload（严格以 pricing_mode 为真相）
//
// 目标：
// - payload 字段集合由 pricing_mode 唯一决定
// - 不传多余字段，避免“前端猜规则、后端兜底”
// - 与 buildPayloadFromDraft 保持一致

import type { buildPayloadFromDraft } from "../quoteModel";

export type BracketWriteBody = {
  pricing_mode: "flat" | "linear_total" | "step_over" | "manual_quote";
  flat_amount?: number;
  base_amount?: number;
  rate_per_kg?: number;
  base_kg?: number;
};

export function buildBracketWriteBody(p: ReturnType<typeof buildPayloadFromDraft>): BracketWriteBody {
  // ✅ payload 字段集合由 pricing_mode 唯一决定（不传多余字段）
  if (p.pricing_mode === "flat") {
    return { pricing_mode: "flat", flat_amount: p.flat_amount ?? 0 };
  }

  if (p.pricing_mode === "linear_total") {
    return { pricing_mode: "linear_total", base_amount: p.base_amount ?? 0, rate_per_kg: p.rate_per_kg ?? 0 };
  }

  if (p.pricing_mode === "step_over") {
    // 后端契约：step_over requires base_kg + base_amount + rate_per_kg
    return {
      pricing_mode: "step_over",
      base_kg: p.base_kg ?? 0,
      base_amount: p.base_amount ?? 0,
      rate_per_kg: p.rate_per_kg ?? 0,
    };
  }

  return { pricing_mode: "manual_quote" };
}
