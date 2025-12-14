// src/features/admin/shipping-providers/scheme/brackets/validation.ts

import type { BracketKind } from "./priceTemplates";

export function parseNum(s: string): number | null {
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return n;
}

export function validateRange(minKg: number, maxKg: number | null): string | null {
  if (minKg < 0) return "min_kg 必须是 >=0";
  if (maxKg != null && maxKg < 0) return "max_kg 必须是 >=0 或留空";
  if (maxKg != null && maxKg < minKg) return "max_kg 必须 >= min_kg";
  return null;
}

export function validateKind(kind: string): string | null {
  const k = String(kind || "").trim();
  if (!k) return "pricing_kind 必填";
  return null;
}

export function validateFlatAmount(kind: BracketKind, flatAmount: number): string | null {
  if (kind !== "flat") return null;
  if (!Number.isFinite(flatAmount) || flatAmount < 0) return "固定价金额必须是 >=0 数字";
  return null;
}

/**
 * per_kg / per_kg_with_base / per_kg_over 的基础校验
 * 注意：这里校验的是“数值合法性”，不做业务逻辑推断。
 */
export function validatePerKgRate(kind: BracketKind, ratePerKg: number): string | null {
  if (kind !== "per_kg" && kind !== "per_kg_with_base" && kind !== "per_kg_over") return null;
  if (!Number.isFinite(ratePerKg) || ratePerKg < 0) return "rate_per_kg 必须是 >=0 数字";
  return null;
}

/**
 * per_kg_over（首重封顶+续重）校验：
 * - start_kg >= 0
 * - base_amount >= 0
 * - rate_per_kg >= 0
 */
export function validatePerKgOver(
  kind: BracketKind,
  startKg: number,
  baseAmount: number,
  ratePerKg: number,
): string | null {
  if (kind !== "per_kg_over") return null;

  if (!Number.isFinite(startKg) || startKg < 0) return "start_kg 必须是 >=0 数字";
  if (!Number.isFinite(baseAmount) || baseAmount < 0) return "base_amount 必须是 >=0 数字";
  if (!Number.isFinite(ratePerKg) || ratePerKg < 0) return "rate_per_kg 必须是 >=0 数字";

  return null;
}

/**
 * rounding 校验：step_kg 必须 > 0
 *（按你们当前服务实现，<=0 会被兜底成 1.0，但前端还是应提示）
 */
export function validateRoundingStep(stepKg: number): string | null {
  if (!Number.isFinite(stepKg) || stepKg <= 0) return "rounding.step_kg 必须是 >0 数字";
  return null;
}
