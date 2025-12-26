// src/features/admin/shipping-providers/scheme/brackets/segmentsLocalTemplate.ts
//
// ✅ 仅用于「导入本地模板」按钮（一次性迁移工具）
// - 读取旧 localStorage 的模板，供用户手动导入到 segments_json
// - 不再作为任何核心逻辑的数据来源

import type { WeightSegment } from "./PricingRuleEditor";

/* =========================
 * 本地模板 key（仅迁移用）
 * ========================= */
function templateStorageKey(schemeId: number): string {
  return `WMS_SCHEME_WEIGHT_TEMPLATE_${schemeId}`;
}

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

/* ======================================================
 * ✅ 仅用于「导入本地模板」按钮（一次性迁移）
 * ====================================================== */
export function readLocalSegmentsForImport(schemeId: number): WeightSegment[] | null {
  try {
    const raw = localStorage.getItem(templateStorageKey(schemeId)) ?? "";
    return safeParseSegments(raw);
  } catch {
    return null;
  }
}

export function clearLocalSegments(schemeId: number): void {
  try {
    localStorage.removeItem(templateStorageKey(schemeId));
  } catch {
    // ignore
  }
}
