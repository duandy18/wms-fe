// src/features/admin/shipping-providers/scheme/workbench-page/types.ts

import type { SchemeTabKey } from "../types";

export type WorkbenchLocationState = {
  from?: string;
};

export function isSchemeTabKey(v: unknown): v is SchemeTabKey {
  const keys: SchemeTabKey[] = ["table", "segments", "zones", "brackets", "dest_adjustments", "surcharges", "preview"];
  return typeof v === "string" && (keys as string[]).includes(v);
}

export function buildZoneNameFromProvinces(provinces: string[]): string {
  const cleaned = (provinces ?? [])
    .map((x) => (x || "").trim())
    .filter(Boolean);
  return cleaned.join("、");
}
