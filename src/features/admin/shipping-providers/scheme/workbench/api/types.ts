// src/features/admin/shipping-providers/scheme/workbench/api/types.ts
//
// 运价工作台（新主线）API 类型：严格对应后端 modules 三阶段合同。
// 不复用旧 matrix-view / matrix 整表合同，避免双轨。

export type ModuleCode = "standard" | "other";
export type PricingMode = "flat" | "linear_total" | "step_over" | "manual_quote";

export interface ModuleRangeApi {
  id: number;
  module_id: number;
  module_code: string;
  min_kg: number;
  max_kg: number | null;
  sort_order: number;
  label: string;
}

export interface ModuleRangesResponse {
  ok: boolean;
  module_code: string;
  ranges: ModuleRangeApi[];
}

export interface ModuleRangePutItem {
  min_kg: number;
  max_kg: number | null;
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
  module_id: number;
  module_code: string;
  name: string;
  sort_order: number;
  active: boolean;
  provinces: ModuleGroupProvinceApi[];
}

export interface ModuleGroupsResponse {
  ok: boolean;
  module_code: string;
  groups: ModuleGroupApi[];
}

export interface ModuleGroupProvincePutItem {
  province_code?: string | null;
  province_name?: string | null;
}

export interface ModuleGroupPutItem {
  name: string;
  sort_order?: number | null;
  active?: boolean;
  provinces: ModuleGroupProvincePutItem[];
}

export interface ModuleGroupsPutPayload {
  groups: ModuleGroupPutItem[];
}

export interface ModuleMatrixCellApi {
  id: number;
  group_id: number;
  module_range_id: number;
  range_module_id: number;
  pricing_mode: PricingMode;
  flat_amount: number | null;
  base_amount: number | null;
  rate_per_kg: number | null;
  base_kg: number | null;
  active: boolean;
}

export interface ModuleMatrixCellsResponse {
  ok: boolean;
  module_code: string;
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
