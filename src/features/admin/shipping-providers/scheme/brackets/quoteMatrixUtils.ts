// src/features/admin/shipping-providers/scheme/brackets/quoteMatrixUtils.ts
//
// QuoteMatrix 工具函数：纯函数，不依赖 React
// - 解析 segments → columns
// - brackets/drafts 组装成 row 映射
// - 单元格状态机：未设置 / 人工兜底 / 已设置（不再用文案字符串判断）

import type { PricingSchemeZoneBracket } from "../../api";
import type { SchemeDefaultPricingMode } from "../../api/types";
import type { WeightSegment } from "./PricingRuleEditor";
import type { RowDraft } from "./quoteModel";
import { keyFromSegment, keyFromBracket, segLabel, summarizeDraft, summarizeBracket, parseNum } from "./quoteModel";

export type QuoteColumn = {
  seg: WeightSegment;
  key: string | null;
  min: number;
  max: number | null;
  valid: boolean;
};

export type RowBracketByKey = Record<string, PricingSchemeZoneBracket>;

export type QuoteCellState = "unset" | "manual" | "set";

export function buildColumns(segments: WeightSegment[]): QuoteColumn[] {
  const safe = Array.isArray(segments) ? segments : [];
  return safe.map((s) => {
    const key = keyFromSegment(s);
    const min = parseNum(s.min.trim());
    const max = s.max.trim() ? parseNum(s.max.trim()) : null;
    const valid = !!key && min != null && (max == null || max > min);
    return { seg: s, key, min: min ?? 0, max: max ?? null, valid };
  });
}

export function buildRowBracketByKey(rowBrackets: PricingSchemeZoneBracket[]): RowBracketByKey {
  const m: RowBracketByKey = {};
  for (const b of rowBrackets ?? []) {
    m[keyFromBracket(b)] = b;
  }
  return m;
}

export function columnLabel(c: QuoteColumn): string {
  return segLabel(c.seg);
}

function getLowerStringField(obj: unknown, key: string): string {
  if (!obj || typeof obj !== "object") return "";
  const rec = obj as Record<string, unknown>;
  const v = rec[key];
  if (typeof v !== "string") return "";
  return v.toLowerCase();
}

export function detectCellState(args: { draft?: RowDraft; bracket?: PricingSchemeZoneBracket }): QuoteCellState {
  const { draft, bracket } = args;

  // draft 优先：用户编辑过/有草稿
  if (draft) {
    if (draft.mode === "manual_quote") return "manual";
    return "set";
  }

  // bracket 存在：后端已有记录
  if (bracket) {
    const m = getLowerStringField(bracket, "pricing_mode");
    if (m === "manual_quote") return "manual";
    return "set";
  }

  // 都没有：未设置
  return "unset";
}

export function cellText(args: {
  draft?: RowDraft;
  bracket?: PricingSchemeZoneBracket;
  schemeMode: SchemeDefaultPricingMode;
}): string {
  const { draft, bracket, schemeMode } = args;
  if (draft) return summarizeDraft(draft, schemeMode);
  if (bracket) return summarizeBracket(bracket);
  return "未设";
}

export function cellHintByState(state: QuoteCellState): string {
  if (state === "unset") return "点击录价";
  if (state === "manual") return "人工/未设";
  return "已录价";
}
