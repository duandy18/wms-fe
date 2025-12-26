// src/features/admin/shipping-providers/scheme/brackets/SegmentsPanel/utils.ts
//
// SegmentsPanel 纯工具：转换（避免主文件膨胀）

import type { SchemeWeightSegment } from "../segmentTemplates";
import type { WeightSegment } from "../PricingRuleEditor";

// ---- conversions ----
export function segmentsJsonToWeightSegments(v?: SchemeWeightSegment[] | null): WeightSegment[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => ({ min: String(x.min ?? "").trim(), max: String(x.max ?? "").trim() }))
    .filter((x) => Boolean(x.min || x.max));
}

export function templateItemsToWeightSegments(
  items: Array<{ ord?: number | null; min_kg: string; max_kg: string | null }>,
): WeightSegment[] {
  const rows = (items ?? []).slice().sort((a, b) => (a.ord ?? 0) - (b.ord ?? 0));
  return rows.map((it) => ({
    min: String(it.min_kg ?? "").trim(),
    max: it.max_kg == null ? "" : String(it.max_kg ?? "").trim(),
  }));
}

/**
 * ✅ 草稿保存：提交“连续可用段”
 *
 * 目标：
 * - 支持“未完成草稿”：用户还没填完，先保存已完成的前缀段（避免后端强校验 422）
 * - 支持“闭环草稿”：最后一行 max 为空表示 ∞，这不是未完成，应当提交为 max_kg=null
 *
 * 规则（严格、可预期）：
 * - min_kg 自动按上一段 max 接续（严格连续）
 * - 当遇到 max 为空：
 *   - 如果它是“最后一行” => 视为 ∞ 段，提交该行（max_kg=null）并结束
 *   - 如果它后面还有行 => 视为未完成，停止（该行及后续不提交）
 * - 至少提交 1 段：
 *   - 若第 0 行 max 为空且它也是最后一行：允许提交一个 ∞ 段（0 → ∞）
 *   - 若第 0 行 max 为空但后面还有行：返回空数组，让上层提示先填写第 1 行 max
 */
export function weightSegmentsToPutItemsDraftPrefix(
  seg: WeightSegment[],
): Array<{ ord: number; min_kg: string; max_kg: string | null; active: boolean }> {
  const rows: Array<{ ord: number; min_kg: string; max_kg: string | null; active: boolean }> = [];

  const safe = (seg ?? []).map((s) => ({
    max: String(s?.max ?? "").trim(),
  }));

  let prevMax = "0";

  for (let i = 0; i < safe.length; i += 1) {
    const maxText = safe[i].max;
    const isLastRow = i === safe.length - 1;

    // max 为空：两种语义
    if (!maxText) {
      if (isLastRow) {
        // ✅ 闭环：最后一行 max 为空 = ∞ 段，提交这一行并结束
        const minKg = i === 0 ? "0" : prevMax;
        rows.push({
          ord: i,
          min_kg: minKg,
          max_kg: null, // NULL = ∞（后端硬契约）
          active: true,
        });
      }
      // 无论是否 last：到这里都结束（last 已提交；非 last 视为未完成则不提交）
      break;
    }

    const minKg = i === 0 ? "0" : prevMax;

    rows.push({
      ord: i,
      min_kg: minKg,
      max_kg: maxText,
      active: true,
    });

    prevMax = maxText;
  }

  // 第 0 行 max 为空但不是最后一行（safe.length>1）时会返回 []，由上层提示用户先填第 1 行 max
  return rows;
}
