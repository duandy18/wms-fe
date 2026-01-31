// src/features/admin/shipping-providers/scheme/surcharges/create/draft/existing.ts

import type { PricingSchemeSurcharge } from "../../../../api";
import { CITY_TO_PROVINCE, asStringArray, isRecord } from "./utils";
import { rowIdCity, rowIdProvince } from "./storage";

function readCond(s: PricingSchemeSurcharge): Record<string, unknown> {
  return isRecord(s.condition_json) ? s.condition_json : {};
}
function readAmt(s: PricingSchemeSurcharge): Record<string, unknown> {
  return isRecord(s.amount_json) ? s.amount_json : {};
}

export function parseExistingSurcharges(existing: PricingSchemeSurcharge[]) {
  const provinceSet = new Set<string>();
  const cityList: string[] = [];
  const amountById: Record<string, string> = {};

  for (const s of existing ?? []) {
    if (!s.active) continue;

    const amt = readAmt(s);
    const kind = String(amt["kind"] ?? "flat").toLowerCase();
    if (kind !== "flat") continue;

    const rawAmount = amt["amount"];
    const amount = typeof rawAmount === "number" ? rawAmount : Number(rawAmount);

    const cond = readCond(s);
    const destRaw = cond["dest"];
    const dest = isRecord(destRaw) ? destRaw : {};

    const provArr = asStringArray(dest["province"]);
    const cityArr = asStringArray(dest["city"]);

    // 省：dest.province 且没有 city
    if (provArr.length === 1 && cityArr.length === 0) {
      const p = provArr[0];
      provinceSet.add(p);
      amountById[rowIdProvince(p)] = Number.isFinite(amount) ? String(amount) : "";
      continue;
    }

    // 城市：dest.city（带不带 province 都算）
    if (cityArr.length === 1) {
      const c = cityArr[0];
      cityList.push(c);
      const prov = provArr[0] ?? CITY_TO_PROVINCE[c] ?? "未知省份";
      amountById[rowIdCity(prov, c)] = Number.isFinite(amount) ? String(amount) : "";
    }
  }

  return {
    provinceSaved: Array.from(provinceSet),
    citySaved: cityList,
    amountById,
  };
}
