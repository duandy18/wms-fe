// src/features/admin/shipping-providers/scheme/brackets/segmentTemplates/normalize.ts
//
// 统一后端返回字段差异：is_active / isActive / active 等
// 目标：前端不猜规则，统一在这里做适配。

import type { SegmentTemplateOut, SegmentTemplateItemOut } from "./types";

function coerceBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true" || s === "1" || s === "yes" || s === "y") return true;
    if (s === "false" || s === "0" || s === "no" || s === "n") return false;
  }
  return Boolean(v);
}

export function isTemplateActive(t: SegmentTemplateOut | null | undefined): boolean {
  if (!t) return false;
  const anyT = t as unknown as Record<string, unknown>;
  // 兼容多种字段命名
  return coerceBool(anyT.is_active ?? anyT.isActive ?? anyT.active ?? anyT.isActiveFlag);
}

export function normalizeTemplateOut(raw: SegmentTemplateOut): SegmentTemplateOut {
  const anyT = raw as unknown as Record<string, unknown>;
  const itemsRaw = (anyT.items ?? []) as unknown;

  const items: SegmentTemplateItemOut[] = Array.isArray(itemsRaw)
    ? (itemsRaw as SegmentTemplateItemOut[])
    : [];

  return {
    ...raw,
    // 强制落到 is_active（统一口径）
    is_active: isTemplateActive(raw),
    // 强制 items 至少是数组，避免 UI 空指针/逻辑分叉
    items,
  };
}

export function normalizeTemplateList(list: SegmentTemplateOut[]): SegmentTemplateOut[] {
  return (list ?? []).map(normalizeTemplateOut);
}
