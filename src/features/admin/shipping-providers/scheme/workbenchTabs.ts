// src/features/admin/shipping-providers/scheme/workbenchTabs.ts
//
// Workbench Tabs 的纯逻辑（无 React）
// - tab keys
// - parseTab
// - needsZone + explainNeedZone

import type { SchemeTabKey } from "./types";

export const TAB_KEYS: SchemeTabKey[] = ["zones", "segments", "pricing", "surcharges", "preview", "overview"];

export function parseTab(v: string | null): SchemeTabKey | null {
  if (!v) return null;
  const t = v.trim() as SchemeTabKey;
  return TAB_KEYS.includes(t) ? t : null;
}

export function needsZone(tab: SchemeTabKey): boolean {
  // 只有“价格录入”需要先选择/创建 Zone
  return tab === "pricing";
}

export function explainNeedZone(tab: SchemeTabKey): string {
  if (tab === "pricing") return "请先在【配送区域】里选择/创建一个区域分类，再来进行【价格录入】。";
  return "请先在【配送区域】里选择/创建一个区域分类。";
}
