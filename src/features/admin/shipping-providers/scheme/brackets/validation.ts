// src/features/admin/shipping-providers/scheme/brackets/validation.ts

import type { BracketKind } from "./priceTemplates";

export function parseNum(s: string): number | null {
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return n;
}

export function validateRange(minKg: number, maxKg: number | null): string | null {
  if (minKg < 0) return "起始重量必须是 ≥ 0";
  if (maxKg != null && maxKg < 0) return "结束重量必须是 ≥ 0 或留空";
  if (maxKg != null && maxKg < minKg) return "结束重量必须 ≥ 起始重量";
  return null;
}

export function validateKind(kind: string): string | null {
  const k = String(kind || "").trim();
  if (!k) return "计价方式必填";
  return null;
}

/**
 * 固定价校验
 */
export function validateFlatAmount(kind: BracketKind, flatAmount: number): string | null {
  if (kind !== "flat") return null;
  if (!Number.isFinite(flatAmount) || flatAmount < 0) return "固定价金额必须是 ≥ 0 的数字";
  return null;
}

/**
 * 票费 + 元/kg（linear_total）校验
 */
export function validateLinearTotal(kind: BracketKind, baseAmount: number, ratePerKg: number): string | null {
  if (kind !== "linear_total") return null;

  if (!Number.isFinite(baseAmount) || baseAmount < 0) {
    return "票费金额必须是 ≥ 0 的数字";
  }
  if (!Number.isFinite(ratePerKg) || ratePerKg < 0) {
    return "每公斤价格必须是 ≥ 0 的数字";
  }

  return null;
}

/**
 * 首重 + 续重（step_over）校验
 * - base_kg > 0
 * - base_amount >= 0
 * - rate_per_kg >= 0
 */
export function validateStepOver(baseKg: number, baseAmount: number, ratePerKg: number): string | null {
  if (!Number.isFinite(baseKg) || baseKg <= 0) return "首重（kg）必须是 > 0 的数字";
  if (!Number.isFinite(baseAmount) || baseAmount < 0) return "首重价必须是 ≥ 0 的数字";
  if (!Number.isFinite(ratePerKg) || ratePerKg < 0) return "续重单价必须是 ≥ 0 的数字";
  return null;
}

/**
 * rounding 校验：step_kg 必须 > 0
 *（后端可能兜底，但前端必须阻止非法输入）
 */
export function validateRoundingStep(stepKg: number): string | null {
  if (!Number.isFinite(stepKg) || stepKg <= 0) return "计费步长必须是 > 0 的数字";
  return null;
}
