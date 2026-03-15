// src/features/tms/providers/scheme/workbench/api/types.ts
//
// 运价工作台（单 scheme 主线）API 类型：
// - 严格对应后端终态合同：ranges / groups / matrix-cells
// - 不再暴露 standard / other / moduleCode
// - 命名历史上保留 Module* 前缀以减少本轮连带改动，但语义已是单 scheme 资源

export type PricingMode = "flat" | "linear_total" | "step_over" | "manual_quote";

export interface ModuleRangeApi {
  id: number;
  min_kg: number;
  max_kg: number | null;
  sort_order: number;
  label?: string;
  default_pricing_mode?: PricingMode;
}

export interface ModuleRangesResponse {
  ok: boolean;
  ranges: ModuleRangeApi[];
}

export interface ModuleRangePutItem {
  min_kg: number;
  max_kg: number | null;
  default_pricing_mode: PricingMode;
  sort_order?: number | null;
}

export interface ModuleRangesPutPayload {
  ranges: ModuleRangePutItem[];
}

export interface ModuleGroupProvinceApi {
  id: number;
  group_id: number;
  province_code: string | null;
  province_name: string | null;
}

export interface ModuleGroupApi {
  id: number;
  scheme_id: number;
  name: string;
  sort_order: number;
  active: boolean;
  provinces: ModuleGroupProvinceApi[];
}

export interface ModuleGroupsResponse {
  ok: boolean;
  groups: ModuleGroupApi[];
}

export interface ModuleGroupProvincePutItem {
  province_code?: string | null;
  province_name?: string | null;
}

export interface ModuleMatrixCellApi {
  id: number;
  group_id: number;
  module_range_id: number;
  pricing_mode: PricingMode;
  flat_amount: number | null;
  base_amount: number | null;
  rate_per_kg: number | null;
  base_kg: number | null;
  active: boolean;
}

export interface ModuleMatrixCellsResponse {
  ok: boolean;
  cells: ModuleMatrixCellApi[];
}

export interface ModuleMatrixCellPutItem {
  group_id: number;
  module_range_id: number;
  pricing_mode: PricingMode;
  flat_amount?: number | null;
  base_amount?: number | null;
  rate_per_kg?: number | null;
  base_kg?: number | null;
  active?: boolean;
}

export interface ModuleMatrixCellsPutPayload {
  cells: ModuleMatrixCellPutItem[];
}
