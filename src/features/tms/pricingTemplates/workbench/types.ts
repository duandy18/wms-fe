// src/features/tms/pricingTemplates/workbench/types.ts

// ✅ Pricing Workbench 裁决：
// - 命中条件（Members）维护从独立配置页删除
// - 健康度诊断（Health）从独立配置页删除
// - 解释与试算能力统一收口到当前运价工作台内
//
// ✅ Workbench Tabs（当前保留历史 key 名称）：
// - table：二维价格表工作台（当前承载新四卡工作台）
// - zones：区域分类
// - preview：算价预览
export type SchemeTabKey = "table" | "zones" | "preview";

export type MutateFn = () => Promise<void>;

export function toErrorMessage(e: unknown, fallback: string): string {
  const anyErr = e as { message?: string; detail?: string } | undefined;
  return anyErr?.message ?? anyErr?.detail ?? fallback;
}
