// src/features/admin/shipping-providers/scheme/workbench/state/mappers.ts
//
// 分拆说明：
// - 从 usePricingWorkbench.ts 中拆出。
// - 当前只负责：
//   1) API DTO -> workbench 行状态映射
//   2) workbench 初始化用空状态构造
//   3) surcharge scope key 生成
// - 当前不负责：
//   1) React 状态管理
//   2) 保存动作
//   3) hook 生命周期
// - 协作关系：
//   - 被 ./modules / ./surcharges 等子域动作文件复用
// - 维护约束：
//   - 本文件只放纯函数；不要引入 useState/useEffect 等 React 逻辑。

import type { PricingSchemeSurcharge } from "../../../api/types";
import type { ModuleCode, ModuleGroupApi, ModuleMatrixCellApi, ModuleRangeApi } from "../api/types";
import { buildCellKey, textFromNumber } from "../domain/derived";
import type {
  GroupRow,
  MatrixCellDraft,
  ModuleEditorState,
  RangeRow,
  SurchargeRuleRow,
} from "../domain/types";

export function mapRangeApiToRow(row: ModuleRangeApi): RangeRow {
  return {
    id: row.id,
    clientId: `range:${row.id}`,
    minKg: textFromNumber(row.min_kg),
    maxKg: textFromNumber(row.max_kg),
    sortOrder: row.sort_order,
    isNew: false,
    isDirty: false,
    isDeleted: false,
  };
}

export function mapGroupApiToRow(row: ModuleGroupApi): GroupRow {
  return {
    id: row.id,
    clientId: `group:${row.id}`,
    name: row.name,
    provinces: (row.provinces ?? []).map((p) => ({
      provinceCode: p.province_code ?? "",
      provinceName: p.province_name ?? "",
    })),
    sortOrder: row.sort_order,
    active: row.active,
    isNew: false,
    isDirty: false,
    isDeleted: false,
  };
}

export function mapCellApiToDraft(row: ModuleMatrixCellApi): MatrixCellDraft {
  return {
    id: row.id,
    key: buildCellKey(row.group_id, row.module_range_id),
    groupId: row.group_id,
    moduleRangeId: row.module_range_id,
    pricingMode: row.pricing_mode,
    flatAmount: textFromNumber(row.flat_amount),
    baseAmount: textFromNumber(row.base_amount),
    ratePerKg: textFromNumber(row.rate_per_kg),
    baseKg: textFromNumber(row.base_kg),
    active: row.active,
    isDirty: false,
  };
}

export function emptyModuleState(moduleCode: ModuleCode): ModuleEditorState {
  return {
    moduleCode,
    loading: false,
    savingRanges: false,
    savingGroups: false,
    savingCells: false,
    error: null,
    ranges: [],
    groups: [],
    cells: {},
  };
}

export function surchargeScopeKey(
  scope: "province" | "city",
  provinceName: string,
  cityName: string,
): string {
  return `${scope}:${provinceName.trim()}:${cityName.trim()}`;
}

export function mapSurchargeApiToRow(row: PricingSchemeSurcharge): SurchargeRuleRow {
  const scope = row.scope === "city" ? "city" : "province";
  const provinceName = row.province_name ?? "";
  const cityName = row.city_name ?? "";

  return {
    id: row.id,
    clientId: `surcharge:${row.id}`,
    originalKey: surchargeScopeKey(scope, provinceName, cityName),
    name: row.name ?? "",
    active: row.active ?? true,
    scope,
    provinceCode: row.province_code ?? "",
    provinceName,
    cityName,
    fixedAmount: textFromNumber(row.fixed_amount),
    isNew: false,
    isDirty: false,
    isDeleted: false,
  };
}
