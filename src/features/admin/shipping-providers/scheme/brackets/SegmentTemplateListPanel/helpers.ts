// src/features/admin/shipping-providers/scheme/brackets/SegmentTemplateListPanel/helpers.ts

import type { SegmentTemplateOut } from "../segmentTemplates";
import { isTemplateActive } from "../segmentTemplates";

export type TemplateStatusTone = "ok" | "draft" | "saved" | "archived";

export function displayName(name: string): string {
  return String(name ?? "")
    .replace(/表头模板/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function yyyyMmDd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function rawStatusOf(t: SegmentTemplateOut): string {
  return String(t.status ?? "");
}

export function statusLabel(t: SegmentTemplateOut): { text: string; tone: TemplateStatusTone } {
  const st = rawStatusOf(t);
  if (st === "draft") return { text: "草稿", tone: "draft" };
  if (st === "published") return { text: "已保存", tone: "saved" };
  if (st === "archived") return { text: "已归档", tone: "archived" };
  return { text: st ? st : "未知", tone: "saved" };
}

export function badgeCls(tone: TemplateStatusTone): string {
  if (tone === "ok") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (tone === "draft") return "border-amber-200 bg-amber-50 text-amber-700";
  if (tone === "archived") return "border-slate-200 bg-slate-50 text-slate-500";
  return "border-slate-200 bg-white text-slate-600";
}

export function bindableBadge(isBindable: boolean): { text: string; cls: string } {
  if (isBindable) {
    return { text: "可绑定区域", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" };
  }
  return { text: "不可绑定", cls: "border-slate-200 bg-white text-slate-600" };
}

export function countArchived(templates: SegmentTemplateOut[]): number {
  return templates.filter((t) => rawStatusOf(t) === "archived").length;
}

export function countBindable(templates: SegmentTemplateOut[]): number {
  return templates.filter((t) => isTemplateActive(t)).length;
}

export function buildVisibleTemplates(args: {
  templates: SegmentTemplateOut[];
  showArchived: boolean;
  showBindableOnly: boolean;
}): SegmentTemplateOut[] {
  const { templates, showArchived, showBindableOnly } = args;

  let list = templates;

  if (!showArchived) list = list.filter((t) => rawStatusOf(t) !== "archived");
  if (showBindableOnly) list = list.filter((t) => isTemplateActive(t));

  return list;
}
