// src/features/admin/shipping-providers/scheme/brackets/zoneEntryUtils.ts
//
// ZoneEntryCard 的纯工具函数（无 UI / 无状态）

import type { SchemeDefaultPricingMode } from "../../api/types";

export function buildZoneEntryHead(schemeMode: SchemeDefaultPricingMode): readonly string[] {
  if (schemeMode === "flat") {
    return ["重量区间", "固定价（元）", "状态"] as const;
  }
  if (schemeMode === "step_over") {
    return ["重量区间", "首重（kg）", "首重价（元）", "续重单价（元/kg）", "状态"] as const;
  }
  return ["重量区间", "票费（元）", "单价（元/kg）", "状态"] as const;
}
