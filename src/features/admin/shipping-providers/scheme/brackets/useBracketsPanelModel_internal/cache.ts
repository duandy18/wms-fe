// src/features/admin/shipping-providers/scheme/brackets/useBracketsPanelModel/cache.ts
//
// zones -> bracketsByZoneId / draftsByZoneId 初始化
//
// 目标：
// - 统一灌满缓存，便于回显/编辑
// - drafts 由 brackets 派生（draftFromBracket）
// - 由 hook 调用方决定是否“保留用户未保存草稿优先”

import type { PricingSchemeZone, PricingSchemeZoneBracket } from "../../../api";
import type { RowDraft } from "../quoteModel";
import { draftFromBracket, keyFromBracket } from "../quoteModel";

export function buildInitialCaches(zones: PricingSchemeZone[]): {
  bMap: Record<number, PricingSchemeZoneBracket[]>;
  dMap: Record<number, Record<string, RowDraft>>;
} {
  const bMap: Record<number, PricingSchemeZoneBracket[]> = {};
  const dMap: Record<number, Record<string, RowDraft>> = {};

  for (const z of zones) {
    const bs = z.brackets ?? [];
    bMap[z.id] = bs;

    const ds: Record<string, RowDraft> = {};
    for (const b of bs) ds[keyFromBracket(b)] = draftFromBracket(b);
    dMap[z.id] = ds;
  }

  return { bMap, dMap };
}
