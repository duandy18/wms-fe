// src/features/pms/items/components/itemsListTableFormatters.ts

export function textOrDash(v: string | null | undefined): string {
  const s = String(v ?? "").trim();
  return s || "—";
}

export function numberOrDash(v: number | null | undefined): string {
  if (typeof v !== "number" || !Number.isFinite(v)) return "—";
  return String(v);
}

export function weightOrDash(v: number | null | undefined): string {
  if (typeof v !== "number" || !Number.isFinite(v)) return "—";
  return v.toFixed(3).replace(/\.?0+$/, "");
}

export function formatShelfUnitCn(u: unknown): string {
  if (!u) return "—";
  const s = String(u).toUpperCase();
  if (s === "MONTH") return "月";
  if (s === "DAY") return "天";
  if (s === "WEEK") return "周";
  if (s === "YEAR") return "年";
  return "—";
}

export function policyCnLotSource(v: unknown): string {
  const s = String(v ?? "").trim().toUpperCase();
  if (s === "SUPPLIER_ONLY") return "仅供应商批次";
  if (s === "INTERNAL_ONLY") return "仅内部批次";
  return s ? s : "—";
}

export function policyCnExpiry(v: unknown): string {
  const s = String(v ?? "").trim().toUpperCase();
  if (s === "REQUIRED") return "需要有效期";
  if (s === "NONE") return "不需要有效期";
  return s ? s : "—";
}
