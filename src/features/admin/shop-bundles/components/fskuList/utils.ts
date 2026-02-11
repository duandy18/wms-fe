import type { Fsku } from "../../types";

export type Banner = { kind: "success" | "error"; text: string } | null;

export function splitSummary(summary: string): string[] {
  const s = (summary ?? "").trim();
  if (!s) return [];

  const bySemicolonOrNl = s
    .replace(/\r\n/g, "\n")
    .split(/\n|;+/g)
    .map((x) => x.trim())
    .filter(Boolean);
  if (bySemicolonOrNl.length >= 2) return bySemicolonOrNl;

  const byPlus = s
    .split(/\s*\+\s*/g)
    .map((x) => x.trim())
    .filter(Boolean);
  if (byPlus.length >= 2) return byPlus;

  return [s];
}

export function statusPill(status: Fsku["status"]): { label: string; clsName: string; code: string } {
  if (status === "draft") return { label: "草稿", clsName: "border-slate-200 bg-slate-50 text-slate-700", code: "draft" };
  if (status === "published")
    return { label: "可用", clsName: "border-emerald-200 bg-emerald-50 text-emerald-700", code: "published" };
  return { label: "归档", clsName: "border-rose-200 bg-rose-50 text-rose-700", code: "retired" };
}
