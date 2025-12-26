// src/features/admin/shipping-providers/scheme/brackets/segmentsDefaults.ts
//
// ✅ 系统默认模板（用于“采用默认模板”）
//
// - 这是一个“安全起步模板”，不是核心真相；真相仍以 segments_json 为准
// - 口径：左开右闭 (min, max]
// - 只需要 max 列即可（SegmentsPanel 会强制连续、min 由系统推导）

import type { WeightSegment } from "./PricingRuleEditor";

export function getDefaultSegmentsTemplate(): WeightSegment[] {
  // 常见的“轻量起步”结构：0-1 / 1-2 / 2-3 / 3-5 / >5
  // 最后一段 max 为空表示 ∞
  return [
    { min: "0", max: "1" },
    { min: "1", max: "2" },
    { min: "2", max: "3" },
    { min: "3", max: "5" },
    { min: "5", max: "" },
  ];
}
