// src/features/admin/shipping-providers/scheme/brackets/segmentsCompat.ts
//
// ⚠️ 兼容用：loadSegments（不再 fallback）
//
// - 为了不让旧 import 炸编译
// - 明确返回空数组
// - 真正的 segments 来源：后端 segments_json

import type { WeightSegment } from "./PricingRuleEditor";

export function loadSegments(schemeId: number): WeightSegment[] {
  // 显式消费参数，避免 eslint unused-vars
  void schemeId;
  return [];
}
