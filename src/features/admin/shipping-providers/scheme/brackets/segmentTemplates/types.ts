// src/features/admin/shipping-providers/scheme/brackets/segmentTemplates/types.ts
//
// Segments / Template Workbench 的局部类型（只服务 brackets/workbench）
// - 不进入 shipping-providers 全局 api.types.ts（避免污染主数据类型层）
// - 字段只保留 UI/工作台实际使用到的最小集合，其余允许透传

export type SchemeWeightSegment = {
  min?: string | number | null;
  max?: string | number | null;
  [k: string]: unknown;
};

export type SegmentTemplateItemOut = {
  id: number;
  ord?: number | null;
  min_kg: string;
  max_kg: string | null;
  active: boolean;
  [k: string]: unknown;
};

export type SegmentTemplateOut = {
  id: number;
  name?: string;
  status?: string; // "draft" | "published" | "archived" 等（后端实际枚举不强绑定）
  is_active?: boolean;

  items: SegmentTemplateItemOut[];

  [k: string]: unknown;
};
