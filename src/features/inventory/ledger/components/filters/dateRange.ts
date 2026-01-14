// src/features/inventory/ledger/components/filters/dateRange.ts
export function isoToDateOnly(iso: string): string {
  const x = (iso ?? "").trim();
  if (!x) return "";
  const m = x.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : "";
}

export function dateOnlyToIsoStartZ(dateOnly: string): string {
  return `${dateOnly}T00:00:00Z`;
}

export function dateOnlyToIsoEndZ(dateOnly: string): string {
  return `${dateOnly}T23:59:59Z`;
}
