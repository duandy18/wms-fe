// src/features/admin/shipping-providers/scheme/brackets/segmentsTemplate.ts
import type { WeightSegment } from "./PricingRuleEditor";

// ===== 模板自动回显（localStorage）=====
// 与 PricingRuleEditor.tsx 里保持一致
function templateStorageKey(schemeId: number): string {
  return `WMS_SCHEME_WEIGHT_TEMPLATE_${schemeId}`;
}

export const DEFAULT_SEGMENTS: WeightSegment[] = [
  { min: "0", max: "1" },
  { min: "1", max: "2" },
  { min: "2", max: "3" },
  { min: "3", max: "" },
];

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function safeParseSegments(text: string): WeightSegment[] | null {
  try {
    const obj: unknown = JSON.parse(text);
    if (!Array.isArray(obj)) return null;
    const rows: WeightSegment[] = obj
      .map((x: unknown) => {
        if (!isRecord(x)) return null;
        return {
          min: String(x["min"] ?? "").trim(),
          max: String(x["max"] ?? "").trim(),
        };
      })
      .filter((r): r is WeightSegment => !!r && Boolean(r.min || r.max));
    return rows.length ? rows : null;
  } catch {
    return null;
  }
}

export function loadSegments(schemeId: number): WeightSegment[] {
  try {
    const raw = localStorage.getItem(templateStorageKey(schemeId)) ?? "";
    const parsed = safeParseSegments(raw);
    return parsed ?? DEFAULT_SEGMENTS;
  } catch {
    return DEFAULT_SEGMENTS;
  }
}
