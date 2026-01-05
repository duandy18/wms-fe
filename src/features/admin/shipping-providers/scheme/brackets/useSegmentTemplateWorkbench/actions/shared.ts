// src/features/admin/shipping-providers/scheme/brackets/useSegmentTemplateWorkbench/actions/shared.ts

import type { SegmentTemplateItemOut } from "../../segmentTemplates";

export function datePrefix(): string {
  const d = new Date();
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function safeName(v: unknown): string {
  return String(v ?? "").replace(/\s+/g, " ").trim();
}

export function sortItems(items: SegmentTemplateItemOut[]): SegmentTemplateItemOut[] {
  const arr = (items ?? []).slice();
  arr.sort((a, b) => (a.ord ?? 0) - (b.ord ?? 0));
  return arr;
}
