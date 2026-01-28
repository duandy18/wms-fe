// src/features/admin/shipping-providers/scheme/brackets/contracts/bracketsDiagnostics.ts
//
// ✅ 诊断/映射：
// - 行 key 集合
// - 后端 brackets 的 key 统计（invalid / extra）
// - currentBracketByKey（跳过无效 key）

import type { PricingSchemeZoneBracket } from "../../../api";
import { keyFromBracket } from "../quoteModel";

function isInvalidBracketKey(k: string): boolean {
  return k.startsWith("__INVALID__");
}

export function buildRowKeySet(tableRows: { key: string | null }[]): Set<string> {
  const s = new Set<string>();
  for (const r of tableRows) {
    if (r.key) s.add(r.key);
  }
  return s;
}

export function computeBackendKeyStats(args: {
  currentBrackets: PricingSchemeZoneBracket[];
  rowKeySet: Set<string>;
}): { invalidKeyCount: number; extraKeyCount: number } {
  const { currentBrackets, rowKeySet } = args;

  let invalidKeyCount = 0;
  let extraKeyCount = 0;

  for (const b of currentBrackets) {
    const k = keyFromBracket(b);
    if (isInvalidBracketKey(k)) {
      invalidKeyCount += 1;
      continue;
    }
    if (!rowKeySet.has(k)) extraKeyCount += 1;
  }

  return { invalidKeyCount, extraKeyCount };
}

export function buildBracketByKey(currentBrackets: PricingSchemeZoneBracket[]): Record<string, PricingSchemeZoneBracket> {
  const m: Record<string, PricingSchemeZoneBracket> = {};
  for (const b of currentBrackets) {
    const k = keyFromBracket(b);
    if (isInvalidBracketKey(k)) continue;
    m[k] = b;
  }
  return m;
}
