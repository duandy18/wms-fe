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
  if (s === "draft") return "草稿";
  if (s === "published") return "已发布";
  return "已归档";
}

export function statusCode(s: Fsku["status"]): string {
  return s;
}

export function shapeLabel(shape: Fsku["shape"]): string {
  return shape === "single" ? "单品" : "组合";
}
