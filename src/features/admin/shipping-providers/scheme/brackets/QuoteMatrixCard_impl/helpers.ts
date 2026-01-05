// src/features/admin/shipping-providers/scheme/brackets/QuoteMatrixCard/helpers.ts

import type { PricingSchemeZoneBracket } from "../../../api";
import type { RowDraft, CellMode } from "../quoteModel";
import { summarizeBracket } from "../quoteModel";
import type { DisplayText } from "./types";

export function bracketModeOf(b?: PricingSchemeZoneBracket): string {
  if (!b) return "";
  const m = String((b as unknown as Record<string, unknown>)["pricing_mode"] ?? "").toLowerCase();
  return m;
}

export function displayTextFromBackend(b?: PricingSchemeZoneBracket): DisplayText {
  if (!b) return { text: "未设", tone: "empty" };

  const mode = bracketModeOf(b);
  if (mode === "manual_quote") return { text: "需补录", tone: "warn" };

  const t = summarizeBracket(b);
  if (t === "人工/未设") return { text: "需补录", tone: "warn" };
  return { text: t, tone: "ok" };
}

export function resetDraftForMode(prev: RowDraft, nextMode: CellMode): RowDraft {
  if (nextMode === "flat") {
    return { mode: "flat", flatAmount: prev.flatAmount ?? "", baseKg: "1", baseAmount: "", ratePerKg: "" };
  }
  if (nextMode === "linear_total") {
    return {
      mode: "linear_total",
      flatAmount: "",
      baseKg: "1",
      baseAmount: prev.baseAmount ?? "",
      ratePerKg: prev.ratePerKg ?? "",
    };
  }
  if (nextMode === "step_over") {
    return {
      mode: "step_over",
      flatAmount: "",
      baseKg: prev.baseKg?.trim() ? prev.baseKg : "1",
      baseAmount: prev.baseAmount ?? "",
      ratePerKg: prev.ratePerKg ?? "",
    };
  }
  return { mode: "manual", flatAmount: "", baseKg: "1", baseAmount: "", ratePerKg: "" };
}
