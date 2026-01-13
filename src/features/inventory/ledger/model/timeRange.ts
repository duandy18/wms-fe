// src/features/inventory/ledger/model/timeRange.ts
export function isoDaysAgo(days: number): string {
  const ms = days * 24 * 60 * 60 * 1000;
  return new Date(Date.now() - ms).toISOString();
}

export function parseIsoOrNull(s: string): Date | null {
  const x = (s ?? "").trim();
  if (!x) return null;
  const d = new Date(x);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * 返回：
 * - null：未设置 time_from（走后端默认“最近7天”）
 * - number：time_from ~ time_to（time_to 为空则视为现在）
 */
export function rangeDays(timeFrom: string, timeTo: string): number | null {
  const a = parseIsoOrNull(timeFrom);
  if (!a) return null;
  const b = parseIsoOrNull(timeTo) ?? new Date();
  const diffMs = b.getTime() - a.getTime();
  if (diffMs < 0) return 0;
  return diffMs / (24 * 60 * 60 * 1000);
}
