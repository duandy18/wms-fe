// src/features/admin/shipping-providers/scheme/dest-adjustments/utils/display.ts
import type { PricingSchemeDestAdjustment } from "../../../api/types";

export function displayProvince(x: PricingSchemeDestAdjustment): string {
  const name = (x.province_name ?? x.province ?? "").trim();
  if (name) return name;
  return x.province_code ? String(x.province_code) : "";
}

export function displayCity(x: PricingSchemeDestAdjustment): string {
  const name = (x.city_name ?? x.city ?? "").trim();
  if (name) return name;
  return x.city_code ? String(x.city_code) : "";
}
