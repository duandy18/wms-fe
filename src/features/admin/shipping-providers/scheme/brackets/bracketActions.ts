// src/features/admin/shipping-providers/scheme/brackets/bracketActions.ts

/**
 * Bracket（重量区间）相关的「用户交互文案 + 错误解释」
 *
 * 设计目标：
 * 1. 所有 destructive 操作（删除）都必须给用户明确上下文
 * 2. 数据库 / 后端错误不能原样暴露，必须翻译成“业务可理解语言”
 * 3. 命名统一，避免 explain / parse / format 混用
 */

export type ConfirmDeleteBracketParams = {
  id: number;
  minKg: number;
  maxKg: number | null;
  pricingKind: string;
};

/**
 * 删除 Bracket 前的确认文案
 */
export function confirmDeleteBracketText(params: ConfirmDeleteBracketParams): string {
  const { id, minKg, maxKg, pricingKind } = params;
  const rangeText = `${minKg} ~ ${maxKg == null ? "∞" : maxKg}`;

  return [
    "你正在删除一个重量区间（Bracket）：",
    "",
    `ID：#${id}`,
    `区间：${rangeText} kg`,
    `计费方式：${pricingKind}`,
    "",
    "⚠️ 注意：",
    "· 删除后，该区间将不再参与任何运费计算",
    "· 若这是当前 Zone 中唯一命中的区间，可能导致算价失败",
    "",
    "建议做法：",
    "· 业务上暂时不用 → 优先选择【停用】",
    "· 明确废弃 → 再执行删除",
    "",
    "是否确认删除？",
  ].join("\n");
}

/**
 * 将后端 / 数据库错误翻译为「可读的业务说明」
 *
 * 只做解释，不吞异常 —— 上层仍然 throw Error
 */
export function explainDeleteBracketError(rawMessage: string): string {
  const msg = rawMessage || "";

  // PostgreSQL / SQLAlchemy 常见 RESTRICT / FK 场景
  if (
    msg.includes("restrict") ||
    msg.includes("RESTRICT") ||
    msg.includes("foreign key") ||
    msg.includes("FOREIGN KEY")
  ) {
    return [
      "无法删除该重量区间（Bracket）。",
      "",
      "原因分析：",
      "· 该 Bracket 可能仍被当前 Zone 或算价规则引用",
      "· 数据库出于一致性保护，拒绝了删除操作（RESTRICT）",
      "",
      "处理建议：",
      "· 先将该 Bracket 设为【停用】",
      "· 确认不再参与任何算价后，再尝试删除",
    ].join("\n");
  }

  // 通用兜底
  return [
    "删除重量区间（Bracket）失败。",
    "",
    "系统返回信息：",
    msg,
    "",
    "建议：",
    "· 检查该区间是否仍在使用",
    "· 或联系系统管理员查看后台日志",
  ].join("\n");
}
