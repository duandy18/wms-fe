// src/features/system/shop-bundles/ui.ts
import type { Fsku, Platform } from "./types";

export function cls(...arr: Array<string | false | null | undefined>): string {
  return arr.filter(Boolean).join(" ");
}

export const PLATFORM_OPTIONS: Platform[] = ["PDD", "JD", "TMALL", "OTHER"];

export function fmtIso(ts: string): string {
  try {
    const d = new Date(ts);
    return Number.isFinite(d.getTime()) ? d.toLocaleString() : ts;
  } catch {
    return ts;
  }
}

export function statusLabel(s: Fsku["status"]): string {
  if (s === "draft") return "draft";
  if (s === "published") return "published";
  return "retired";
}
