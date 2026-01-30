// src/features/admin/shipping-providers/scheme/types.ts

// ✅ Phase 4 裁决：
// - 命中条件（Members）维护从 Admin 删除
// - 健康度诊断（Health）从 Admin 删除
// - 解释/实验/调试统一迁入 DevConsole → Shipping Pricing Lab
//
// ✅ Workbench Tabs（Admin 可用）：
// - table：二维价格表工作台（Zone × 重量段模板行 × 单元格价格）
// - zones：区域分类
// - segments：重量段方案（保存/启用）
// - brackets：价格录入（旧入口，后续可降级/删除）
// - surcharges：附加费
// - preview：算价预览
export type SchemeTabKey = "table" | "zones" | "segments" | "brackets" | "surcharges" | "preview";

export type MutateFn = () => Promise<void>;

export function toErrorMessage(e: unknown, fallback: string): string {
  const anyErr = e as { message?: string; detail?: string } | undefined;
  return anyErr?.message ?? anyErr?.detail ?? fallback;
}
