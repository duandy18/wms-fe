// src/features/tms/providers/scheme/types.ts

// ✅ Phase 4 裁决：
// - 命中条件（Members）维护从 Admin 删除
// - 健康度诊断（Health）从 Admin 删除
// - 解释/实验/调试统一迁入 DevConsole → Shipping Pricing Lab
//
// ✅ Workbench Tabs（Admin 可用）：
// - table：二维价格表工作台（当前保留为历史 tab key 名称，承载新四卡工作台）
// - zones：区域分类
// - preview：算价预览
export type SchemeTabKey = "table" | "zones" | "preview";


export type MutateFn = () => Promise<void>;

export function toErrorMessage(e: unknown, fallback: string): string {
  const anyErr = e as { message?: string; detail?: string } | undefined;
  return anyErr?.message ?? anyErr?.detail ?? fallback;
}
