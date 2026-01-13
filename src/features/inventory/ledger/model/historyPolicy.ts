// src/features/inventory/ledger/model/historyPolicy.ts
export const MAX_QUERY_DAYS = 90;
export const MAX_HISTORY_DAYS = 3650;

export function needHistoryByDays(days: number | null): boolean {
  return days != null && days > MAX_QUERY_DAYS;
}

export function buildHistoryModeNote(needHistory: boolean): string | null {
  if (!needHistory) return null;
  return "当前为历史查询，请尽量缩小时间范围，或使用「追溯号 / 关联单据」定位。";
}

export function buildHistoryHint(args: {
  needHistory: boolean;
  days: number | null;
  hasAnchor: boolean;
  timeFrom: string;
}): string | null {
  const { needHistory, days, hasAnchor, timeFrom } = args;
  if (!needHistory) return null;

  if (days != null && days > MAX_HISTORY_DAYS) {
    return `时间范围过大，请缩小到 ${MAX_HISTORY_DAYS} 天以内。`;
  }
  if (!hasAnchor) {
    return "历史查询必须至少指定：trace_id / ref / item_id / reason_canon / sub_reason（任意一项）。";
  }
  if (!timeFrom.trim()) {
    return "历史查询必须指定 time_from。";
  }
  return null;
}
