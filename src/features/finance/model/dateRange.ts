export type DateRange = {
  from_date: string;
  to_date: string;
};

const formatDate = (value: Date): string => {
  const pad2 = (n: number) => String(n).padStart(2, "0");
  return `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(
    value.getDate(),
  )}`;
};

export function getDefaultDateRange(days = 30): DateRange {
  const today = new Date();
  const from = new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
  return {
    from_date: formatDate(from),
    to_date: formatDate(today),
  };
}

export function getQuickDateRange(days: 30 | 90): DateRange {
  return getDefaultDateRange(days);
}
