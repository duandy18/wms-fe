// src/features/admin/items/components/itemsListTableFormatters.ts

import type { Item } from "../../../../contracts/item/contract";

type UnknownRecord = Record<string, unknown>;

export function asRecord(v: unknown): UnknownRecord {
  return (v ?? {}) as UnknownRecord;
}

export function getString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

export function getBoolean(v: unknown): boolean | null {
  return typeof v === "boolean" ? v : null;
}

export function supplierLabel(it: Item): string {
  const r = asRecord(it);

  const sn = getString(r["supplier_name"]);
  if (sn && sn.trim()) return sn;

  const sp = getString(r["supplier"]);
  if (sp && sp.trim()) return sp;

  const sid = r["supplier_id"];
  if (typeof sid === "number" || typeof sid === "string") return `ID=${String(sid)}`;

  return "—";
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

export function formatShelfValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return String(Math.trunc(n));
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
