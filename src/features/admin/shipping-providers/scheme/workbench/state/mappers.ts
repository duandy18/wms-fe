// src/features/admin/shipping-providers/scheme/workbench/state/mappers.ts
//
// 分拆说明：
// - 从 usePricingWorkbench.ts 中拆出。
// - 当前只负责：
//   1) API DTO -> workbench 行状态映射
//   2) surcharge_config DTO -> surcharge_config card 映射
// - 当前不负责：
//   1) React 状态管理
//   2) 保存动作
//   3) hook 生命周期
// - 协作关系：
//   - 被 ./modules / ./ranges / ./groups / ./matrix / ./surcharges 等子域动作文件复用
// - 维护约束：
//   - 本文件只放纯函数；不要引入 useState/useEffect 等 React 逻辑。

import type { PricingSchemeSurchargeConfig } from "../../../api/types";
import type {
  ModuleGroupApi,
  ModuleMatrixCellApi,
  ModuleRangeApi,
  PricingMode,
} from "../api/types";
import { buildCellKey, newClientId, textFromNumber } from "../domain/derived";
import type {
  GroupRow,
  MatrixCellDraft,
  RangeRow,
  SurchargeConfigCityRow,
  SurchargeRuleRow,
} from "../domain/types";

export function mapRangeApiToRow(row: ModuleRangeApi): RangeRow {
  const mode =
    (row as ModuleRangeApi & { default_pricing_mode?: PricingMode }).default_pricing_mode ?? "flat";

  return {
    id: row.id,
    clientId: `range:${row.id}`,
    minKg: textFromNumber(row.min_kg),
    maxKg: textFromNumber(row.max_kg),
    defaultPricingMode: mode,
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

function sortProvinceLike(a: SurchargeRuleRow, b: SurchargeRuleRow): number {
  const ap = `${a.provinceName}:${a.provinceCode}`;
  const bp = `${b.provinceName}:${b.provinceCode}`;
  return ap.localeCompare(bp, "zh-CN");
}

function sortCityLike(a: SurchargeConfigCityRow, b: SurchargeConfigCityRow): number {
  const ak = `${a.cityName}:${a.cityCode}`;
  const bk = `${b.cityName}:${b.cityCode}`;
  return ak.localeCompare(bk, "zh-CN");
}

export function mapSurchargeConfigApiToRow(row: PricingSchemeSurchargeConfig): SurchargeRuleRow {
  return {
    id: row.id,
    clientId: `surcharge-config:${row.id}`,
    provinceCode: row.province_code ?? "",
    provinceName: row.province_name ?? "",
    provinceMode: row.province_mode,
    fixedAmount: textFromNumber(row.fixed_amount),
    active: row.active ?? true,
    cities: (row.cities ?? [])
      .map((city) => ({
        id: city.id,
        clientId: `surcharge-config-city:${city.id}`,
        cityCode: city.city_code ?? "",
        cityName: city.city_name ?? "",
        fixedAmount: textFromNumber(city.fixed_amount),
        active: city.active ?? true,
        isNew: false,
        isDirty: false,
        isDeleted: false,
      }))
      .sort(sortCityLike),
    isNew: false,
    isDirty: false,
    isDeleted: false,
  };
}

export function mapSurchargeConfigApiListToRows(
  rows: PricingSchemeSurchargeConfig[],
): SurchargeRuleRow[] {
  return [...rows].map(mapSurchargeConfigApiToRow).sort(sortProvinceLike);
}

export function createEmptyProvinceSurchargeRow(): SurchargeRuleRow {
  return {
    id: undefined,
    clientId: newClientId("surcharge-config:province"),
    provinceCode: "",
    provinceName: "",
    provinceMode: "province",
    fixedAmount: "",
    active: true,
    cities: [],
    isNew: true,
    isDirty: true,
    isDeleted: false,
  };
}

export function createEmptyCitiesSurchargeRow(): SurchargeRuleRow {
  return {
    id: undefined,
    clientId: newClientId("surcharge-config:cities"),
    provinceCode: "",
    provinceName: "",
    provinceMode: "cities",
    fixedAmount: "0",
    active: true,
    cities: [],
    isNew: true,
    isDirty: true,
    isDeleted: false,
  };
}

export function createEmptySurchargeCityRow(): SurchargeConfigCityRow {
  return {
    id: undefined,
    clientId: newClientId("surcharge-config-city"),
    cityCode: "",
    cityName: "",
    fixedAmount: "",
    active: true,
    isNew: true,
    isDirty: true,
    isDeleted: false,
  };
}
