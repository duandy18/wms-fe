// src/features/admin/shipping-providers/scheme/types.ts

// ================================
// Tabs（运输价格设置平台）
// ================================
export type SchemeTabKey = "zones" | "segments" | "pricing" | "surcharges" | "preview" | "overview";

// ================================
// 通用 mutate 函数类型
// ================================
export type MutateFn = () => Promise<void>;

// ================================
// pricing mode 显示文案（被多个组件使用）
// ================================
export function pricingModeLabel(mode?: string | null): string {
  const m = (mode ?? "").toLowerCase();
  if (m === "flat") return "固定价";
  if (m === "step_over") return "首重 + 续重";
  if (m === "linear_total") return "票费 + 元/kg";
  if (m === "manual_quote") return "人工报价";
  return "—";
}

// ================================
// 错误兜底
// ================================
export function toErrorMessage(e: unknown, fallback: string): string {
  const anyErr = e as { message?: string; detail?: string } | undefined;
  return anyErr?.message ?? anyErr?.detail ?? fallback;
}
