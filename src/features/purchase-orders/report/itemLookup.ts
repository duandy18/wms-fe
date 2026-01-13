// src/features/purchase-orders/report/itemLookup.ts

import type { ItemBasic } from "../../../master-data/itemsApi";

export type ItemLookup = {
  name: string;
  brand: string;
  category: string;
  barcode: string;
};

export function buildItemMap(items: ItemBasic[]): Map<number, ItemBasic> {
  const m = new Map<number, ItemBasic>();
  for (const it of items) m.set(it.id, it);
  return m;
}

function clean(v: string | null | undefined): string {
  const s = (v ?? "").trim();
  return s ? s : "—";
}

export function lookupItem(map: Map<number, ItemBasic>, itemId: number): ItemLookup {
  const it = map.get(itemId);
  if (!it) {
    return {
      name: `（未知商品：${itemId}）`,
      brand: "—",
      category: "—",
      barcode: "—",
    };
  }
  return {
    name: clean(it.name),
    brand: clean(it.brand_name),
    category: clean(it.category_name),
    barcode: clean(it.barcode),
  };
}
