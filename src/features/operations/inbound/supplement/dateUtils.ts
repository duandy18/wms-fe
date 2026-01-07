// src/features/operations/inbound/supplement/dateUtils.ts

export type ShelfLifeUnit = "DAY" | "MONTH";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function isYmd(s: string): boolean {
  const t = (s ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(t);
}

export function addShelfLife(prodYmd: string, value: number, unit: ShelfLifeUnit): string | null {
  const t = (prodYmd ?? "").trim();
  if (!isYmd(t)) return null;
  if (!Number.isFinite(value) || value <= 0) return null;

  const [y, m, d] = t.split("-").map((x) => Number(x));
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;

  // 用本地 Date 做推算（UI 用途足够稳定；后端仍是权威）
  const dt = new Date(y, m - 1, d);
  if (Number.isNaN(dt.getTime())) return null;

  if (unit === "DAY") {
    dt.setDate(dt.getDate() + Math.floor(value));
  } else {
    dt.setMonth(dt.getMonth() + Math.floor(value));
  }

  const yy = dt.getFullYear();
  const mm = dt.getMonth() + 1;
  const dd = dt.getDate();
  return `${yy}-${pad2(mm)}-${pad2(dd)}`;
}
