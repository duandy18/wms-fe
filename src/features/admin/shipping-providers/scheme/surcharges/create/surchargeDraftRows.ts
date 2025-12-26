// src/features/admin/shipping-providers/scheme/surcharges/create/surchargeDraftRows.ts
//
// scopeRows 生成（纯函数）
// - 第三表只看 saved
// - 城市 label 默认只显示城市名（保持原行为）

import type { ScopeRow } from "./useSurchargeDraft";
import { rowIdProvince, rowIdCity } from "./surchargeDraftPersist";

export function buildScopeRows(
  provinceSaved: string[],
  citySaved: string[],
  cityToProvince: Record<string, string>,
): ScopeRow[] {
  const rows: ScopeRow[] = [];

  for (const p of provinceSaved) {
    rows.push({ id: rowIdProvince(p), scope: "province", province: p, label: p });
  }

  for (const c of citySaved) {
    const prov = cityToProvince[c] ?? "未知省份";
    rows.push({ id: rowIdCity(prov, c), scope: "city", province: prov, city: c, label: c });
  }

  return rows;
}
