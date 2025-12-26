// src/features/admin/shipping-providers/scheme/surcharges/create/cityProvinceMap.ts
//
// City -> Province 映射（按本期白名单 PROVINCE_CITIES）
// - 纯数据构建，无 React

import { PROVINCE_CITIES } from "../data/provinceCities";

export const CITY_TO_PROVINCE: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const [prov, cities] of Object.entries(PROVINCE_CITIES)) {
    for (const c of cities) {
      if (!m[c]) m[c] = prov;
    }
  }
  return m;
})();
