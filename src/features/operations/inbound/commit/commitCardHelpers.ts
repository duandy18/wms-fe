// src/features/operations/inbound/commit/commitCardHelpers.ts

export function safeLineName(l: { item_name?: string | null; item_sku?: string | null }) {
  const n = (l.item_name ?? "").trim();
  if (n) return n;
  const sku = (l.item_sku ?? "").trim();
  if (sku) return sku;
  return "未命名商品";
}

function safeBoolField(v: unknown): boolean {
  return v === true;
}

export function requiresBatch(l: unknown): boolean {
  return safeBoolField((l as { requires_batch?: unknown }).requires_batch);
}

export function requiresDates(l: unknown): boolean {
  return safeBoolField((l as { requires_dates?: unknown }).requires_dates);
}

export function hasAnyDate(line: { production_date?: string | null; expiry_date?: string | null }): boolean {
  return !!((line.production_date ?? "").trim() || (line.expiry_date ?? "").trim());
}

export function formatMissingFields(fields: string[]): string {
  const map: Record<string, string> = {
    batch_code: "批次",
    production_date: "生产日期",
    expiry_date: "到期日期",
  };
  return (fields || []).map((f) => map[f] ?? f).join(" / ");
}
