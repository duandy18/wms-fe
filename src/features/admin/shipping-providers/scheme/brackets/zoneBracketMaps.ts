// src/features/admin/shipping-providers/scheme/brackets/zoneBracketMaps.ts
//
// 从 zones 构建 brackets/drafts 映射（纯函数）
// - 用于初始化/刷新本地展示
// - 不做 state，不做请求

import type { PricingSchemeZone, PricingSchemeZoneBracket } from "../../api";
import type { SchemeDefaultPricingMode } from "../../api/types";
import type { RowDraft } from "./quoteModel";
import { draftFromBracket, keyFromBracket } from "./quoteModel";

export function buildBracketsMap(zones: PricingSchemeZone[]): Record<number, PricingSchemeZoneBracket[]> {
  const bMap: Record<number, PricingSchemeZoneBracket[]> = {};
  for (const z of zones) {
    bMap[z.id] = z.brackets ?? [];
  }
  return bMap;
}

export function buildDraftsMap(zones: PricingSchemeZone[], schemeMode: SchemeDefaultPricingMode): Record<number, Record<string, RowDraft>> {
  const dMap: Record<number, Record<string, RowDraft>> = {};
  for (const z of zones) {
    const bs = z.brackets ?? [];
    const ds: Record<string, RowDraft> = {};
    for (const b of bs) ds[keyFromBracket(b)] = draftFromBracket(b, schemeMode);
    dMap[z.id] = ds;
  }
  return dMap;
}
