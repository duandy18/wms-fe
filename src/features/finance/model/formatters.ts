import { formatDateTimeMinute } from "../../../lib/dateTime";
export const formatCurrency = (value: number | null | undefined): string => {
  const n = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return `￥${n.toFixed(2)}`;
};

export const formatPercent = (value: number | null | undefined): string => {
  if (value == null || !Number.isFinite(value)) return "-";
  return `${(value * 100).toFixed(2)}%`;
};

export const formatNumber = (value: number | null | undefined): string => {
  const n = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return String(n);
};

export const formatDateTime = (value: string | null | undefined): string => {
  return formatDateTimeMinute(value);
};
