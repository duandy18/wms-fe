// src/features/admin/shipping-providers/scheme/surcharges/data/provinceCities.ts
//
// 省 -> 城市白名单（本期：各省首府城市 + 深圳）
//
// 裁决：
// - 城市必须从系统白名单勾选，不允许用户自由输入
// - 本期只提供“首府/省会/直辖市”作为每省默认城市
// - 额外加入深圳（特区），挂在广东省下
//
// 后续扩展（例如：苏州/宁波/东莞/佛山等）只需在这里补充即可。

import { PROVINCE_CAPITAL_CITY } from "./keyCities";

export type ProvinceCityMap = Record<string, string[]>;

export const PROVINCE_CITIES: ProvinceCityMap = (() => {
  const m: ProvinceCityMap = {};

  for (const [prov, capitalCity] of Object.entries(PROVINCE_CAPITAL_CITY)) {
    m[prov] = [capitalCity];
  }

  // 特区：深圳（挂广东省）
  if (!m["广东省"]) m["广东省"] = ["广州市"];
  if (!m["广东省"].includes("深圳市")) m["广东省"].push("深圳市");

  return m;
})();

export function allCities(): string[] {
  const set = new Set<string>();
  Object.values(PROVINCE_CITIES).forEach((arr) => arr.forEach((c) => set.add(c)));
  return Array.from(set);
}
