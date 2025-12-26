// src/features/admin/shipping-providers/scheme/brackets/segmentsUtils.ts
//
// 纯工具：segments 转换 / 校验 / 规范化 / 预览
// 约定：左开右闭 (min, max]，且 segments_json 必须严格连续

import type { SchemeWeightSegment } from "../../api/types";
import type { WeightSegment } from "./PricingRuleEditor";

export function fromBackendSegments(v?: SchemeWeightSegment[] | null): WeightSegment[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => ({
      min: String(x.min ?? "").trim(),
      max: String(x.max ?? "").trim(),
    }))
    .filter((x) => Boolean(x.min || x.max));
}

function toNumberOrNull(text: string): number | null {
  const t = (text ?? "").trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  return n;
}

function labelLeftOpenRightClosed(minText: string, maxText: string): string {
  const min = (minText ?? "").trim();
  const max = (maxText ?? "").trim();
  if (!min && !max) return "未定义";
  if (!max) return `w>${min}`;
  return `${min}<w≤${max}`;
}

/**
 * ✅ 规范化（保存前）
 * - 第一段：min 强制为 "0"
 * - 后续段：min 强制等于上一段的 max（严格连续）
 * - max 为空仅允许出现在最后一段（由校验保证）
 */
export function normalizeSegmentsForSave(next: WeightSegment[]): SchemeWeightSegment[] {
  if (!Array.isArray(next) || next.length === 0) return [];

  const out: SchemeWeightSegment[] = [];

  const firstMax = String(next[0]?.max ?? "").trim();
  out.push({ min: "0", max: firstMax || "" });

  for (let i = 1; i < next.length; i += 1) {
    const prevMax = String(out[i - 1]?.max ?? "").trim();
    const rawMax = String(next[i]?.max ?? "").trim();

    if (!prevMax) break;

    out.push({
      min: prevMax,
      max: rawMax || "",
    });
  }

  return out.filter((x) => String(x.min ?? "").trim() || String(x.max ?? "").trim());
}

/**
 * ✅ 校验规则（严格连续 + 左开右闭）
 * - 第 1 行：max 可空（表示 w>0），但若填写必须是 >0
 * - 中间段：max 不允许为空
 * - 最后一段：max 允许为空（∞）
 * - 递增：curMax 必须 > prevMax
 */
export function validateSegments(next: WeightSegment[]): string | null {
  if (!Array.isArray(next) || next.length === 0) return "至少填写一条重量分段。";

  const maxTexts = next.map((s) => String(s.max ?? "").trim());
  const firstMaxText = maxTexts[0] ?? "";

  if (firstMaxText) {
    const firstMax = toNumberOrNull(firstMaxText);
    if (firstMax == null || firstMax <= 0) {
      return "第 1 行：截止重量（max）必须是 > 0 的数字（口径：0<w≤max）。";
    }
  }

  for (let i = 0; i < maxTexts.length - 1; i += 1) {
    if (!maxTexts[i]) return `第 ${i + 1} 行：非最后一行的截止重量（max）不允许为空。`;
  }

  let prevMaxN: number | null = null;

  if (firstMaxText) {
    prevMaxN = toNumberOrNull(firstMaxText);
    if (prevMaxN == null) return "第 1 行：截止重量（max）必须是数字。";
  } else {
    if (maxTexts.length > 1) {
      return "第 1 行：已设置为无上限（max 为空），不应再新增后续分段。";
    }
    return null;
  }

  for (let i = 1; i < maxTexts.length; i += 1) {
    const curMaxText = maxTexts[i] ?? "";

    if (!curMaxText) {
      if (i !== maxTexts.length - 1) return `第 ${i + 1} 行：只有最后一行允许 max 为空（表示无上限）。`;
      return null;
    }

    const curMaxN = toNumberOrNull(curMaxText);
    if (curMaxN == null || curMaxN <= 0) return `第 ${i + 1} 行：截止重量（max）必须是 > 0 的数字。`;

    if (prevMaxN == null || curMaxN <= prevMaxN) return `第 ${i + 1} 行：截止重量（max）必须大于上一段的 max。`;

    prevMaxN = curMaxN;
  }

  return null;
}

/**
 * ✅ 只读态展示用：把 draft 规范化后输出标签数组
 * - 若 draft 校验失败/为空，则返回 null
 */
export function labelPreviewFromDraft(draft: WeightSegment[]): string[] | null {
  if (!draft.length) return null;
  if (validateSegments(draft)) return null;

  const payload = normalizeSegmentsForSave(draft);
  if (!payload.length) return null;

  return payload.map((s) => labelLeftOpenRightClosed(String(s.min ?? ""), String(s.max ?? "")));
}
