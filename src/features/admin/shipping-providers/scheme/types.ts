// src/features/admin/shipping-providers/scheme/types.ts

// ✅ Phase 4 裁决：
// - 命中条件（Members）维护从 Admin 删除
// - 健康度诊断（Health）从 Admin 删除
// - 解释/实验/调试统一迁入 DevConsole → Shipping Pricing Lab
export type SchemeTabKey = "zones" | "brackets" | "surcharges" | "preview";

export type MutateFn = () => Promise<void>;

export function toErrorMessage(e: unknown, fallback: string): string {
  const anyErr = e as { message?: string; detail?: string } | undefined;
  return anyErr?.message ?? anyErr?.detail ?? fallback;
}
