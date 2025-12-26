// src/features/admin/shipping-providers/scheme/preview/utils.ts
import type { CalcOut, WeightInfo, BreakdownBase } from "./types";

export function safeText(v: unknown): string {
  if (v === null || v === undefined) return "—";
  const s = String(v);
  return s.trim() ? s : "—";
}

export function safeMoney(v: unknown): string {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(2);
}

export function safeNum(v: unknown, digits = 3): string {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(digits);
}

/** 提交给后端时规范化：trim + 去除全部空白 */
export function normalizeAddrPart(v: string): string {
  const t = (v ?? "").trim();
  return t.replace(/\s+/g, "");
}

export function toReasonsList(result: CalcOut | null): string[] {
  if (!result) return [];
  if (Array.isArray(result.reasons) && result.reasons.length) return result.reasons;
  const r = result.reason;
  if (r && String(r).trim()) return [String(r).trim()];
  return [];
}

export function pickBillableWeight(w: WeightInfo | undefined): number | undefined {
  if (!w) return undefined;
  return w.billable_weight_kg ?? w.billable_weight_kg_raw;
}

export function readBaseAmount(base: BreakdownBase | undefined): number | null {
  if (!base || typeof base !== "object") return null;
  const rec = base as Record<string, unknown>;
  const n = Number(rec["amount"]);
  return Number.isFinite(n) ? n : null;
}
