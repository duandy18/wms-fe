// src/features/admin/shipping-providers/scheme/brackets/draftValidation.ts
//
// RowDraft 保存前校验（纯函数）
// - 只返回错误文案（人话），不做 alert，不做请求

import type { SchemeDefaultPricingMode } from "../../api/types";
import type { RowDraft } from "./quoteModel";
import { parseNum } from "./quoteModel";

function isBlank(v: string | null | undefined): boolean {
  return !(v ?? "").trim();
}

// ✅ 真正的校验：按 d.mode（段级/格级口径）校验，而不是按 schemeMode
export function validateDraftForSave(d: RowDraft, schemeMode: SchemeDefaultPricingMode): string | null {
  // mode 为空时兜底为方案默认口径（避免历史数据/异常状态）
  const mode = (d.mode ?? schemeMode) as RowDraft["mode"];

  if (mode === "manual_quote") return null;

  if (mode === "flat") {
    if (isBlank(d.flatAmount)) return "固定价金额不能为空";
    const amt = parseNum(d.flatAmount);
    if (amt == null || amt < 0) return "固定价金额必须是 ≥ 0 的数字";
    return null;
  }

  if (mode === "linear_total") {
    if (isBlank(d.baseAmount)) return "票费不能为空";
    if (isBlank(d.ratePerKg)) return "单价不能为空";
    const base = parseNum(d.baseAmount);
    if (base == null || base < 0) return "票费必须是 ≥ 0 的数字";
    const rate = parseNum(d.ratePerKg);
    if (rate == null || rate < 0) return "单价必须是 ≥ 0 的数字";
    return null;
  }

  // step_over
  if (isBlank(d.baseKg)) return "首重(kg)不能为空";
  if (isBlank(d.baseAmount)) return "首重价不能为空";
  if (isBlank(d.ratePerKg)) return "续重单价不能为空";

  const bk = parseNum(d.baseKg);
  if (bk == null || bk <= 0) return "首重(kg)必须是 > 0 的数字";

  const base = parseNum(d.baseAmount);
  if (base == null || base < 0) return "首重价必须是 ≥ 0 的数字";

  const rate = parseNum(d.ratePerKg);
  if (rate == null || rate < 0) return "续重单价必须是 ≥ 0 的数字";

  return null;
}
