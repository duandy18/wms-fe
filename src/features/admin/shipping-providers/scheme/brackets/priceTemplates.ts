// src/features/admin/shipping-providers/scheme/brackets/priceTemplates.ts

/**
 * Bracket 计价模板（前端侧）
 *
 * 设计原则：
 * 1. 与数据库结构保持 1:1 语义对应
 * 2. 模板只解决“默认值 + 可解释性”，不承载业务判断
 * 3. 所有模板都能被 shipping_quote_service 明确识别
 *
 * 说明：
 * - 当前主流程推荐：linear_total（票费 + 元/kg）
 * - 旧 kind 仍保留：用于兼容历史数据/旧方案，但不再作为默认推荐
 */

export type BracketKind =
  | "flat"               // 固定价
  | "linear_total"       // 票费 + 元/kg（推荐）
  | "per_kg"             // legacy：按公斤
  | "per_kg_with_base"   // legacy：带 base 的按公斤
  | "per_kg_over"        // legacy：旧模型（兼容保留）
  | "manual_quote";      // 人工报价

/**
 * 根据 kind 生成 price_json 的默认模板
 *
 * ⚠️ 注意：
 * - price_json 是“镜像字段”，真实计算优先使用结构化列
 * - 这里的值只是初始示例，方便用户理解和编辑
 */
export function defaultPriceJson(
  kind: BracketKind,
  flatAmount: number,
): Record<string, unknown> {
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

  if (kind === "per_kg") {
    return {
      kind: "per_kg",
      rate_per_kg: 1.0,
      rounding: { mode: "ceil", step_kg: 1.0 },
    };
  }

  if (kind === "per_kg_with_base") {
    return {
      kind: "per_kg_with_base",
      base_fee: { label: "base", amount: 5.0 },
      rate_per_kg: 1.5,
      rounding: { mode: "ceil", step_kg: 1.0 },
    };
  }

  if (kind === "per_kg_over") {
    return {
      kind: "per_kg_over",
      start_kg: 3.0,
      base_amount: 4.8,
      rate_per_kg: 1.2,
      rounding: { mode: "ceil", step_kg: 1.0 },
    };
  }

  return {
    kind: "manual_quote",
    message: "需要人工报价",
  };
}

/**
 * 在 UI 中展示给用户的标签
 * - 推荐项：linear_total / flat
 * - legacy 项：仅用于兼容
 */
export function kindLabel(kind: BracketKind): string {
  if (kind === "linear_total") return "票费 + 元/kg（linear_total）";
  if (kind === "flat") return "固定价（flat）";
  if (kind === "per_kg") return "legacy：按公斤（per_kg）";
  if (kind === "per_kg_with_base") return "legacy：base + 按公斤（per_kg_with_base）";
  if (kind === "per_kg_over") return "legacy：per_kg_over";
  return "人工报价（manual_quote）";
}
