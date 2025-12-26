// src/features/admin/shipping-providers/scheme/workbenchTabs.ts
//
// 工作台 Tabs 辅助逻辑（供 SchemeWorkbenchPage 使用）
//
// 设计目标：
// - 与 SchemeTabKey 严格对齐
// - 保留历史导出，避免调用方报错
// - 彻底移除“强制流程红字”
// - eslint / tsc clean（不留 unused vars）

import type { SchemeTabKey } from "./types";

// Tabs 固定顺序（供 UI 使用）
// ⚠️ 必须与 SchemeTabKey 对齐
export const TAB_KEYS: SchemeTabKey[] = ["zones", "segments", "brackets", "surcharges", "preview"];

// 解析 URL / query 中的 tab 参数
export function parseTab(v: unknown, fallback: SchemeTabKey = "zones"): SchemeTabKey {
  const s = String(v ?? "").trim();
  if (s === "zones") return "zones";
  if (s === "segments") return "segments";
  if (s === "brackets") return "brackets";
  if (s === "surcharges") return "surcharges";
  if (s === "preview") return "preview";
  return fallback;
}

// 是否“逻辑上”依赖 zone（由上层决定如何使用这个布尔值）
// 当前阶段：不做阻断提示，不做强制流程。
export function needsZone(tab: SchemeTabKey): boolean {
  void tab; // 显式消费参数，满足 eslint
  return false;
}

// ❌ 已废弃：不再返回任何提示文案（避免红字误导）
export function explainNeedZone(tab: SchemeTabKey): string | null {
  void tab; // 显式消费参数，满足 eslint
  return null;
}

// ❌ 已废弃：tab 级提示同样移除
export function getWorkbenchTabHint(tab: SchemeTabKey): string | null {
  void tab; // 显式消费参数，满足 eslint
  return null;
}
