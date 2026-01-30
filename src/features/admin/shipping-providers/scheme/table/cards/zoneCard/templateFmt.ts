// src/features/admin/shipping-providers/scheme/table/cards/zoneCard/templateFmt.ts

import type { SegmentTemplateDetailLite, SegmentTemplateItemLite, SegmentTemplateLite } from "../../../zones/segmentTemplatesApi";

export function templateLabel(t: SegmentTemplateLite): string {
  const name = (t.name ?? "").trim() || `模板#${t.id}`;
  const status = (t.status ?? "").trim();
  const bindable = t.is_active ? "可绑定区域" : "不可绑定";
  return status ? `${name}（${bindable}｜${status}｜#${t.id}）` : `${name}（${bindable}｜#${t.id}）`;
}

function fmt2(v: string): string {
  const n = Number(String(v).trim());
  if (!Number.isFinite(n)) return String(v);
  return n.toFixed(2);
}

function fmtRange(min: string, max: string | null): string {
  const mn = fmt2(min);
  const mx = max ? fmt2(max) : "";
  if (!mx) return `≥ ${mn}kg`;
  return `${mn}–${mx}kg`;
}

export function toRanges(detail: SegmentTemplateDetailLite): string[] {
  const items = (detail.items ?? [])
    .slice()
    .sort((a: SegmentTemplateItemLite, b: SegmentTemplateItemLite) => (a.ord ?? 0) - (b.ord ?? 0))
    .filter((x: SegmentTemplateItemLite) => x.active !== false);

  return items.map((it: SegmentTemplateItemLite) => fmtRange(it.min_kg, it.max_kg));
}

export function rangesSummary(ranges: string[]): string {
  if (!ranges || ranges.length === 0) return "（无段结构）";
  const head = ranges.slice(0, 4);
  const rest = ranges.length - head.length;
  return rest > 0 ? `${head.join(" · ")} · +${rest}` : head.join(" · ");
}
