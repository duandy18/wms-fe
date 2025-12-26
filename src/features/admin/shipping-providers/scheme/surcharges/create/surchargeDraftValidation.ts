// src/features/admin/shipping-providers/scheme/surcharges/create/surchargeDraftValidation.ts
//
// 第三表金额校验（纯函数）

import type { ScopeRow } from "./useSurchargeDraft";

function safeNum(v: string, fallback: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return n;
}

export function computeRowAmountErrors(scopeRows: ScopeRow[], amountById: Record<string, string>) {
  const errs: Record<string, string> = {};
  for (const r of scopeRows) {
    const t = (amountById[r.id] ?? "").trim();
    if (!t) {
      errs[r.id] = "必填";
      continue;
    }
    const n = safeNum(t, Number.NaN);
    if (!Number.isFinite(n)) errs[r.id] = "必须是数字";
    else if (n < 0) errs[r.id] = "必须 >= 0";
  }
  return errs;
}
