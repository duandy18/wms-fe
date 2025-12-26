// src/features/admin/shipping-providers/scheme/surcharges/create/surchargeCreateUtils.ts
//
// SurchargeCreateCard 拆分出来的纯工具函数（无 UI / 无状态）

import type { PricingSchemeSurcharge } from "../../../api";

export function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

export function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x)).map((x) => x.trim()).filter(Boolean);
}

export function toNum(v: string): number | null {
  const t = (v ?? "").trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function readCond(s: PricingSchemeSurcharge): Record<string, unknown> {
  return isRecord(s.condition_json) ? s.condition_json : {};
}

export function readAmt(s: PricingSchemeSurcharge): Record<string, unknown> {
  return isRecord(s.amount_json) ? s.amount_json : {};
}

export function getDestKeyFromSurcharge(s: PricingSchemeSurcharge): string | null {
  const cond = readCond(s);
  const destRaw = cond["dest"];
  const dest = isRecord(destRaw) ? destRaw : {};

  const provArr = asStringArray(dest["province"]);
  const cityArr = asStringArray(dest["city"]);

  if (cityArr.length === 1) return `city:${cityArr[0]}`;
  if (provArr.length === 1 && cityArr.length === 0) return `province:${provArr[0]}`;
  return null;
}

export function findBulkySurcharge(existing: PricingSchemeSurcharge[]): PricingSchemeSurcharge | null {
  for (const s of existing) {
    const cond = readCond(s);
    const flags = asStringArray(cond["flag_any"]);
    if (flags.includes("bulky") || flags.includes("irregular")) return s;
  }
  return null;
}
