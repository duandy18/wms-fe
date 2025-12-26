// src/features/admin/shipping-providers/scheme/brackets/priceTemplates.ts

/**
 * Bracket 计价模板（前端侧）
 *
 * 面向对象：系统管理（业务用户）
 *
 * 裁决（Phase 4 收敛）：
 * - pricing_mode = 第一性原理
 * - Admin/Workbench 不暴露 legacy 计价模型（仅兼容历史数据）
 * - 用户只需要三种口径：
 *   1) 固定价（flat）
 *   2) 票费 + 元/kg（linear_total）
 *   3) 人工报价（manual_quote）
 *
 * 说明：
 * - price_json 是“镜像字段”（用于回显/审计/解释），真实计算以结构化列为准
 * - 这里给的是“默认示例值”，方便理解与编辑
 */

export type BracketKind =
  | "flat" // 固定价
  | "linear_total" // 票费 + 元/kg
  | "manual_quote"; // 人工报价

/**
 * 根据 kind 生成 price_json 的默认模板
 *
 * ⚠️ 注意：
 * - price_json 是镜像字段；真实计算优先使用结构化列
 * - 这里的值只是初始示例，方便用户理解和编辑
 */
export function defaultPriceJson(kind: BracketKind, flatAmount: number): Record<string, unknown> {
  if (kind === "flat") {
    return {
      kind: "flat",
      amount: flatAmount,
    };
  }

  if (kind === "linear_total") {
    return {
      kind: "linear_total",
      base_amount: 0,
      rate_per_kg: 1.0,
      rounding: { mode: "ceil", step_kg: 1.0 },
    };
  }

  return {
    kind: "manual_quote",
    message: "需要人工报价",
  };
}

/**
 * 在 UI 中展示给用户的标签（全中文）
 */
export function kindLabel(kind: BracketKind): string {
  if (kind === "linear_total") return "票费 + 元/kg";
  if (kind === "flat") return "固定价";
  return "人工报价";
}
