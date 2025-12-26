// src/features/admin/shipping-providers/scheme/brackets/SegmentPricingForm/utils.ts
//
// SegmentPricingForm 纯逻辑：类型/文案/选项构建（无 UI 状态）
// - 便于测试与复用
// - 主文件只做流程编排

import type { SchemeDefaultPricingMode } from "../../../api/types";
import type { WeightSegment } from "../PricingRuleEditor";
import type { RowDraft } from "../quoteModel";
import { parseNum, segLabel } from "../quoteModel";

export type CellMode = SchemeDefaultPricingMode | "manual_quote";

export function modeLabel(m: CellMode): string {
  if (m === "manual_quote") return "人工/未设";
  if (m === "flat") return "固定价";
  if (m === "step_over") return "首重 + 续重";
  return "票费 + 元/kg";
}

export function makeDraft(mode: CellMode): RowDraft {
  if (mode === "manual_quote") {
    return { mode: "manual_quote", flatAmount: "", baseAmount: "", ratePerKg: "", baseKg: "" };
  }
  return { mode, flatAmount: "", baseAmount: "", ratePerKg: "", baseKg: "" };
}

export type SegmentOption = {
  key: string;
  seg: WeightSegment;
  min: number;
  max: number | null;
};

export function buildSegmentOptions(segments: WeightSegment[]): SegmentOption[] {
  return (segments ?? [])
    .map((s) => {
      const min = parseNum(s.min.trim());
      if (min == null) return null;
      const max = s.max.trim() ? parseNum(s.max.trim()) : null;
      if (max != null && max <= min) return null;
      const key = `${min}__${max == null ? "INF" : String(max)}`;
      return { key, seg: s, min, max };
    })
    .filter((x): x is SegmentOption => !!x);
}

export function needsBeforeWriteTips(args: {
  hasSegments: boolean;
  selectedZoneId: number | null;
  selectedSeg: SegmentOption | null;
}): string[] {
  const tips: string[] = [];
  if (!args.hasSegments) tips.push("你还没有配置重量分段：请先到【重量区间】里维护并保存表头，再回来录价。");
  if (!args.selectedZoneId) tips.push("你还没有选择区域分类：请先到【配送区域】创建/选择一个区域分类，再回来录价。");
  if (!args.selectedSeg) tips.push("你还没有选择重量段：请在① 里选择一个重量段。");
  return tips;
}

export function buildConfirmText(args: {
  zoneName: string;
  seg: WeightSegment;
  mode: CellMode;
  draft: RowDraft;
}): string {
  const { zoneName, seg, mode, draft } = args;

  const segText = segLabel(seg);

  const lines: string[] = [];
  lines.push("确认保存该重量段报价？");
  lines.push("");
  lines.push(`区域：${zoneName}`);
  lines.push(`重量段：${segText}`);
  lines.push(`计价模型：${modeLabel(mode)}`);

  if (mode === "manual_quote") {
    lines.push("录入值：人工/未设（manual_quote）");
    lines.push("");
    lines.push("（提示：该格将作为兜底，不参与结构化算价）");
    return lines.join("\n");
  }

  if (mode === "flat") {
    lines.push(`录入值：固定价 ￥${(draft.flatAmount ?? "").trim() || "0"}`);
    return lines.join("\n");
  }

  if (mode === "step_over") {
    lines.push(`录入值：首重 ${((draft.baseKg ?? "").trim() || "—")} kg`);
    lines.push(`      首重价 ￥${((draft.baseAmount ?? "").trim() || "0")}`);
    lines.push(`      续重 ￥${((draft.ratePerKg ?? "").trim() || "0")}/kg`);
    return lines.join("\n");
  }

  // linear_total
  lines.push(`录入值：票费 ￥${((draft.baseAmount ?? "").trim() || "0")}`);
  lines.push(`      单价 ￥${((draft.ratePerKg ?? "").trim() || "0")}/kg`);
  return lines.join("\n");
}
