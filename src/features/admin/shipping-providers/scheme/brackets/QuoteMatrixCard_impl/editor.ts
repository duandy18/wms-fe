// src/features/admin/shipping-providers/scheme/brackets/QuoteMatrixCard/editor.ts
//
// 编辑器初始化：严格以后端 brackets 为真相
// - 若该格已有 bracket：用 draftFromBracket 初始化
// - 若 bracket 为 manual_quote：返回 defaultDraft（要求用户重新选择可计算模型）
// - 若无 bracket：返回 defaultDraft

import type { PricingSchemeZoneBracket } from "../../../api";
import type { RowDraft } from "../quoteModel";
import { defaultDraft, draftFromBracket, keyFromBracket } from "../quoteModel";
import { bracketModeOf } from "./helpers";

export function initDraftFromBackend(args: {
  zoneId: number;
  key: string;
  bracketsByZoneId: Record<number, PricingSchemeZoneBracket[]>;
}): RowDraft {
  const { zoneId, key, bracketsByZoneId } = args;

  const rowBrackets = bracketsByZoneId[zoneId] ?? [];
  const byKey: Record<string, PricingSchemeZoneBracket> = {};
  for (const b of rowBrackets) byKey[keyFromBracket(b)] = b;

  const b = byKey[key] ?? null;
  if (!b) return defaultDraft();

  const bm = bracketModeOf(b);
  if (bm === "manual_quote") return defaultDraft();

  return draftFromBracket(b);
}
