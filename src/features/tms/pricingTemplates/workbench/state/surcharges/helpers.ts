// src/features/tms/pricingTemplates/workbench/state/surcharges/helpers.ts
//
// 分拆说明：
// - 从原 state/surcharges.ts 中拆出。
// - 当前只负责 surcharge 子域纯函数：
//   1) 文本规范化
//   2) 城市子项清洗
//   3) 行排序
//   4) 校验逻辑
// - 当前不负责：
//   1) React 状态
//   2) API 调用
//   3) 保存动作
// - 维护约束：
//   - 本文件只放纯函数；不要引入 useState/useEffect/useCallback 等 React 逻辑。

import { parseRequiredNumber } from "../../domain/derived";
import type {
  SurchargeConfigCityRow,
  SurchargeRuleRow,
} from "../../domain/types";

export type ProvinceBatchDraft = {
  provinceCode: string;
  provinceName: string;
  fixedAmount: string;
  active: boolean;
};

export type ProvinceSelection = {
  provinceCode: string;
  provinceName: string;
};

export function trim(v: string): string {
  return String(v ?? "").trim();
}

export function normalizeCities(
  cities: SurchargeConfigCityRow[],
): SurchargeConfigCityRow[] {
  return cities
    .filter((x) => !x.isDeleted)
    .map((x) => ({
      ...x,
      cityCode: trim(x.cityCode),
      cityName: trim(x.cityName),
    }));
}

export function sortRows(rows: SurchargeRuleRow[]): SurchargeRuleRow[] {
  return [...rows].sort((a, b) => {
    const ap = `${a.provinceName}:${a.provinceCode}`;
    const bp = `${b.provinceName}:${b.provinceCode}`;
    return ap.localeCompare(bp, "zh-CN");
  });
}

export function validateDuplicateProvinceWorkspace(
  rows: Array<{ provinceCode: string; provinceName: string }>,
): string | null {
  const owner = new Set<string>();

  for (const row of rows) {
    const key = trim(row.provinceCode) || trim(row.provinceName);
    if (!key) continue;
    if (owner.has(key)) {
      return `附加费省份重复：${trim(row.provinceName) || trim(row.provinceCode)}`;
    }
    owner.add(key);
  }

  return null;
}

export function validateProvinceDraft(item: ProvinceBatchDraft): string | null {
  if (!trim(item.provinceCode) && !trim(item.provinceName)) {
    return "附加费必须填写省份";
  }

  const amount = parseRequiredNumber(item.fixedAmount);
  if (amount === null || amount < 0) {
    return `省级附加费金额必须为非负数：${trim(item.provinceName) || trim(item.provinceCode)}`;
  }

  return null;
}

export function validateRow(row: SurchargeRuleRow): string | null {
  if (!trim(row.provinceCode) && !trim(row.provinceName)) {
    return "附加费必须填写省份";
  }

  if (row.provinceMode === "province") {
    const amount = parseRequiredNumber(row.fixedAmount);
    if (amount === null || amount < 0) {
      return "全省收费金额必须为非负数";
    }
    return null;
  }

  const cities = normalizeCities(row.cities);

  for (const city of cities) {
    if (!trim(city.cityCode) && !trim(city.cityName)) {
      return "城市收费项必须填写城市";
    }
    const amount = parseRequiredNumber(city.fixedAmount);
    if (amount === null || amount < 0) {
      return "城市收费金额必须为非负数";
    }
  }

  const cfgAmount = parseRequiredNumber(row.fixedAmount);
  if (cfgAmount !== 0) {
    return "指定城市收费模式下，省级固定加价必须为 0";
  }

  return null;
}
