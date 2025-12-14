// src/features/admin/shipping-providers/scheme/brackets/priceTemplates.ts

/**
 * Bracket 计价模板（前端侧）
 *
 * 设计原则：
 * 1. 与数据库结构保持 1:1 语义对应
 * 2. 模板只解决“默认值 + 可解释性”，不承载业务判断
 * 3. 所有模板都能被 shipping_quote_service 明确识别
 */

export type BracketKind =
  | "flat"               // 固定价
  | "per_kg"             // 每公斤
  | "per_kg_with_base"   // 首费 + 每公斤（旧模型，保留兼容）
  | "per_kg_over"        // ✅ 首重封顶 + 续重（主推）
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

  if (kind === "per_kg") {
    return {
      kind: "per_kg",
      rate_per_kg: 1.0,
      rounding: { mode: "ceil", step_kg: 1.0 },
    };
  }

  if (kind === "per_kg_with_base") {
    // ⚠️ 旧模型：首费 + 每公斤（不是封顶）
    return {
      kind: "per_kg_with_base",
      base_fee: { label: "首费", amount: 5.0 },
      rate_per_kg: 1.5,
      rounding: { mode: "ceil", step_kg: 1.0 },
    };
  }

  if (kind === "per_kg_over") {
    // ✅ 主推模型：首重封顶 + 续重
    return {
      kind: "per_kg_over",
      start_kg: 3.0,        // ≤ 3kg
      base_amount: 4.8,     // 封顶价
      rate_per_kg: 1.2,     // 超出部分单价
      rounding: { mode: "ceil", step_kg: 1.0 },
    };
  }

  return {
    kind: "manual_quote",
    message: "需要人工报价",
  };
}

/**
 * 在 UI 中展示给用户的“人话标签”
 */
export function kindLabel(kind: BracketKind): string {
  if (kind === "flat") return "固定价（flat）";
  if (kind === "per_kg") return "按公斤（per_kg）";
  if (kind === "per_kg_with_base") return "首费 + 按公斤（per_kg_with_base）";
  if (kind === "per_kg_over") return "首重封顶 + 续重（per_kg_over）";
  return "人工报价（manual_quote）";
}
