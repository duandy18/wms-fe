// src/features/admin/shipping-providers/scheme/surcharges/create/draft/utils.ts

import { PROVINCE_CITIES } from "../../data/provinceCities";

export function safeNum(v: string, fallback: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return n;
}

export function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

export function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => String(x))
    .map((x) => x.trim())
    .filter(Boolean);
}

// city -> province（按本期白名单）
export const CITY_TO_PROVINCE: Record<string, string> = (() => {
  const m: Record<string, string> = {};

  // ✅ 显式断言，避免 Object.entries 推断为 unknown
  const src = PROVINCE_CITIES as unknown as Record<string, string[]>;

  for (const [prov, cities] of Object.entries(src)) {
    for (const c of cities) {
      if (!m[c]) m[c] = prov;
    }
  }
  return m;
})();
