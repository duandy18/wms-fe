// src/features/dev/shipping-pricing/labUtils.ts

import type { CalcOut, Dims } from "./labTypes";

export function toNum(v: string): number | null {
  const t = (v ?? "").trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function safeJson(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return "[unserializable]";
  }
}

export function normalizeAddr(v: string): string | null {
  const t = (v ?? "").trim();
  return t ? t : null;
}

export function normalizeFlags(v: string): string[] {
  return (v ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export function readString(obj: unknown, key: string): string {
  if (!obj || typeof obj !== "object") return "";
  const rec = obj as Record<string, unknown>;
  const v = rec[key];
  return typeof v === "string" ? v : "";
}

export function readNum(obj: unknown, key: string): number | null {
  if (!obj || typeof obj !== "object") return null;
  const rec = obj as Record<string, unknown>;
  const v = rec[key];
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

export function readObj(obj: unknown, key: string): Record<string, unknown> | null {
  if (!obj || typeof obj !== "object") return null;
  const rec = obj as Record<string, unknown>;
  const v = rec[key];
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

export function readArr(obj: unknown, key: string): unknown[] {
  if (!obj || typeof obj !== "object") return [];
  const rec = obj as Record<string, unknown>;
  const v = rec[key];
  return Array.isArray(v) ? v : [];
}

export function computeDims(lengthCm: string, widthCm: string, heightCm: string): Dims | null {
  const l = toNum(lengthCm);
  const w = toNum(widthCm);
  const h = toNum(heightCm);
  if (l == null && w == null && h == null) return null;
  if (l == null || w == null || h == null) return null;
  if (l < 0 || w < 0 || h < 0) return null;
  return { length_cm: l, width_cm: w, height_cm: h };
}

export function dimsWarning(lengthCm: string, widthCm: string, heightCm: string, dims: Dims | null): boolean {
  const any = Boolean(lengthCm.trim() || widthCm.trim() || heightCm.trim());
  return any && dims == null;
}

export type ExplainSummary = {
  quoteStatus: string;
  totalAmount: number | null;
  currency: string;
  hitZone: Record<string, unknown> | null;
  hitBracket: Record<string, unknown> | null;
  bracketMode: string;
  reasons: string[];
  breakdown: Record<string, unknown> | null;
  weight: Record<string, unknown> | null;
};

export function buildExplainSummary(out: CalcOut | null): ExplainSummary {
  const quoteStatus = readString(out, "quote_status") || readString(out, "status");
  const totalAmount = readNum(out, "total_amount");
  const currency = readString(out, "currency") || "CNY";

  const hitZone = readObj(out, "zone");
  const hitBracket = readObj(out, "bracket");

  const bracketMode =
    readString(hitBracket, "pricing_mode") ||
    readString(hitBracket, "pricing_kind") ||
    readString(hitBracket, "mode");

  const reasons = readArr(out, "reasons").map((x) => String(x));
  const breakdown = readObj(out, "breakdown");
  const weight = readObj(out, "weight");

  return { quoteStatus, totalAmount, currency, hitZone, hitBracket, bracketMode, reasons, breakdown, weight };
}
