// src/features/admin/shipping-providers/scheme/brackets/ZoneEntryCard_impl/draft.ts

import type { RowDraft, CellMode } from "../quoteModel";

export function normalizeInput(raw: string): string {
  return raw;
}

export function resetDraftForMode(prev: RowDraft, nextMode: CellMode): RowDraft {
  if (nextMode === "flat") {
    return { mode: "flat", flatAmount: prev.flatAmount ?? "", baseKg: "1", baseAmount: "", ratePerKg: "" };
  }
  if (nextMode === "linear_total") {
    return { mode: "linear_total", flatAmount: "", baseKg: "1", baseAmount: prev.baseAmount ?? "", ratePerKg: prev.ratePerKg ?? "" };
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
