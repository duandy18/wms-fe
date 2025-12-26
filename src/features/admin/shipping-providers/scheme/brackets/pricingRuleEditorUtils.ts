// src/features/admin/shipping-providers/scheme/brackets/pricingRuleEditorUtils.ts
//
// PricingRuleEditor 的纯工具：数值解析、口径标签、行计算、∞ 检测

export type WeightSegment = {
  min: string;
  max: string; // 空 = ∞
};

export function toNumOrNull(s: string): number | null {
  const t = (s ?? "").trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  return n;
}

export function formatMinLabel(idx: number, prevMaxText: string | null): string {
  if (idx === 0) return "0";
  return (prevMaxText ?? "").trim();
}

export function labelLeftOpenRightClosed(minText: string, maxText: string): string {
  const min = (minText ?? "").trim();
  const max = (maxText ?? "").trim();
  if (!max) {
    return `w>${min}kg`;
  }
  return `${min}<w≤${max}kg`;
}

export type ComputedRow = {
  idx: number;
  computedMin: string;
  maxText: string;
  maxNum: number | null;
  isLast: boolean;
};

export function computeRows(value: WeightSegment[]): ComputedRow[] {
  const rows = value ?? [];
  return rows.map((row, idx) => {
    let computedMin = "0";
    if (idx > 0) {
      const prevMax = (rows[idx - 1]?.max ?? "").trim();
      computedMin = prevMax;
    }
    const maxText = (row.max ?? "").trim();
    const maxNum = toNumOrNull(maxText);
    return {
      idx,
      computedMin,
      maxText,
      maxNum,
      isLast: idx === rows.length - 1,
    };
  });
}

/**
 * 返回第一个 max 为空的位置（∞段），没有则 -1
 */
export function findInfinityAt(computedRows: ComputedRow[]): number {
  for (let i = 0; i < computedRows.length; i += 1) {
    if (!computedRows[i].maxText.trim()) return i;
  }
  return -1;
}
