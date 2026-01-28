// src/features/admin/shipping-providers/scheme/brackets/contracts/bracketsCache.ts
//
// ✅ 缓存合并合同：
// - zones -> bracketsByZoneId / draftsByZoneId
// - 关键：只有当后端 zone 显式携带了 brackets 字段时，才允许用它刷新本地缓存
//   否则会把“字段缺失”误当成“空数组”，造成保存后看起来丢数据

import type { PricingSchemeZone, PricingSchemeZoneBracket } from "../../../api";
import type { RowDraft } from "../quoteModel";
import { draftFromBracket, keyFromBracket } from "../quoteModel";

function hasOwnField(obj: unknown, key: string): boolean {
  if (!obj || typeof obj !== "object") return false;
  return Object.prototype.hasOwnProperty.call(obj as Record<string, unknown>, key);
}

function isInvalidBracketKey(k: string): boolean {
  return k.startsWith("__INVALID__");
}

export function mergeCachesFromZones(args: {
  zones: PricingSchemeZone[];
  prevBracketsByZoneId: Record<number, PricingSchemeZoneBracket[]>;
  prevDraftsByZoneId: Record<number, Record<string, RowDraft>>;
}): {
  nextBracketsByZoneId: Record<number, PricingSchemeZoneBracket[]>;
  nextDraftsByZoneId: Record<number, Record<string, RowDraft>>;
} {
  const { zones, prevBracketsByZoneId, prevDraftsByZoneId } = args;

  const nextBracketsByZoneId: Record<number, PricingSchemeZoneBracket[]> = { ...prevBracketsByZoneId };
  const nextDraftsByZoneId: Record<number, Record<string, RowDraft>> = { ...prevDraftsByZoneId };

  for (const z of zones) {
    // ✅ 仅当后端明确返回 brackets 字段才刷新
    if (!hasOwnField(z, "brackets")) continue;

    const bs = (z.brackets ?? []) as PricingSchemeZoneBracket[];
    nextBracketsByZoneId[z.id] = bs;

    // 派生 drafts（但保留用户未保存草稿：existing 优先）
    const derived: Record<string, RowDraft> = {};
    for (const b of bs) {
      const k = keyFromBracket(b);
      if (isInvalidBracketKey(k)) continue;
      derived[k] = draftFromBracket(b);
    }

    const existing = prevDraftsByZoneId[z.id] ?? {};
    nextDraftsByZoneId[z.id] = { ...derived, ...existing };
  }

  return { nextBracketsByZoneId, nextDraftsByZoneId };
}
