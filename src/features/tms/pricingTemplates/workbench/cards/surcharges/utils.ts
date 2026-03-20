// src/features/tms/pricingTemplates/workbench/cards/surcharges/utils.ts
//
// 分拆说明：
// - 从 surcharge 卡 UI 中抽出纯函数。
// - 当前只负责：
//   1) 文本 trim
//   2) 候选省份搜索过滤
//   3) 已存在省份编码集合派生
// - 维护约束：
//   - 仅放纯函数，不引入 React 状态。

import type { GeoItem } from "../../../../providers/api/geo";
import type { SurchargeRuleRow } from "../../domain/types";

export function trim(v: string): string {
  return String(v ?? "").trim();
}

export function filterOptions(options: GeoItem[], keyword: string): GeoItem[] {
  const q = trim(keyword).toLowerCase();
  if (!q) return options;
  return options.filter((opt) => {
    const code = String(opt.code ?? "").toLowerCase();
    const name = String(opt.name ?? "").toLowerCase();
    return code.includes(q) || name.includes(q);
  });
}

export function collectExistingProvinceCodes(rows: SurchargeRuleRow[]): Set<string> {
  const out = new Set<string>();
  rows.forEach((row) => {
    const code = trim(row.provinceCode);
    if (code) out.add(code);
  });
  return out;
}
