// src/features/admin/shipping-providers/scheme/zones/zonesHelpers.ts
import type { PricingSchemeZone } from "../../api";

export function buildNameFromProvinces(list: string[]): string {
  const cleaned = (list ?? []).map((x) => (x || "").trim()).filter(Boolean);
  if (cleaned.length === 0) return "";
  return cleaned.join("、");
}

export function getErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return fallback;
}

export function extractProvinceMembers(z: PricingSchemeZone | null | undefined): string[] {
  if (!z) return [];
  const ms = z.members ?? [];
  return ms
    .filter((m) => (m.level || "").toLowerCase() === "province")
    .map((m) => (m.value || "").trim())
    .filter(Boolean);
}
