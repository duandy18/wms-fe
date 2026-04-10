// src/features/pms/items/components/edit/itemUomsGovernanceUtils.ts
//
// 拆分说明：
// - 本文件只放纯函数与草稿类型
// - 不放 React 状态，不放接口调用，不放副作用
// - 目标是让 ItemUomsGovernanceSection.tsx 只关心渲染，hook 只关心状态和动作

import type { ItemUom } from "../../api/itemUomsOwnerApi";

export type ExtraPackageDraft = {
  key: string;
  id: number | null;
  name: string;
  ratio: string;
};

export function trim(v: string): string {
  return (v ?? "").trim();
}

export function makeDraftKey(): string {
  return `draft_${Math.random().toString(36).slice(2, 10)}`;
}

export function tagLabel(u: ItemUom): string {
  const tags: string[] = [];
  if (u.is_base) tags.push("基础包装");
  if (u.is_purchase_default) tags.push("采购默认");
  if (u.is_inbound_default) tags.push("入库默认");
  if (u.is_outbound_default) tags.push("出库默认");
  return tags.join(" / ") || "普通包装";
}

export function sortUoms(list: ItemUom[]): ItemUom[] {
  const score = (u: ItemUom): number => {
    if (u.is_base) return 0;
    if (u.is_purchase_default) return 1;
    return 10;
  };
  return [...list].sort((a, b) => score(a) - score(b) || a.id - b.id);
}

export function buildExtraDrafts(list: ItemUom[]): ExtraPackageDraft[] {
  return sortUoms(list)
    .filter((u) => !u.is_base)
    .map((u) => ({
      key: `uom_${u.id}`,
      id: u.id,
      name: u.uom ?? "",
      ratio: String(u.ratio_to_base ?? ""),
    }));
}
