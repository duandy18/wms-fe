// src/features/purchase-orders/createV2/lineDraft.ts

import type { PurchaseOrderLineCreatePayload } from "../api";
import type { ItemBasic } from "../../../master-data/itemsApi";

export type LineDraft = {
  id: number;

  item_id: string;
  item_name: string;
  spec_text: string;

  base_uom: string; // 最小单位
  purchase_uom: string; // 采购单位
  units_per_case: string;

  qty_ordered: string;
  supply_price: string;
};

export const makeEmptyLine = (id: number): LineDraft => ({
  id,
  item_id: "",
  item_name: "",
  spec_text: "",
  base_uom: "",
  purchase_uom: "",
  units_per_case: "",
  qty_ordered: "",
  supply_price: "",
});

export function applySelectedItemToLine(
  line: LineDraft,
  itemOptions: ItemBasic[],
  itemId: number | null,
): LineDraft {
  if (!itemId) {
    return {
      ...line,
      item_id: "",
      item_name: "",
      spec_text: "",
      base_uom: "",
      purchase_uom: "",
    };
  }

  const found = itemOptions.find((it) => it.id === itemId);
  if (!found) {
    return {
      ...line,
      item_id: String(itemId),
    };
  }

  return {
    ...line,
    item_id: String(found.id),
    item_name: found.name,
    spec_text: found.spec ?? "",
    base_uom: found.uom ?? line.base_uom,
    purchase_uom: line.purchase_uom || "",
  };
}

function numOrNull(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function buildPayloadLines(lines: LineDraft[]): PurchaseOrderLineCreatePayload[] {
  const normalized: PurchaseOrderLineCreatePayload[] = [];

  for (const [idx, l] of lines.entries()) {
    const empty =
      !l.item_id.trim() && !l.qty_ordered.trim() && !l.item_name.trim();
    if (empty) continue;

    const itemId = Number(l.item_id.trim());
    const qty = Number(l.qty_ordered.trim());

    const supplyPrice = numOrNull(l.supply_price);
    const unitsPerCase = numOrNull(l.units_per_case);

    if (Number.isNaN(itemId) || itemId <= 0) {
      throw new Error(`第 ${idx + 1} 行：请选择商品`);
    }
    if (Number.isNaN(qty) || qty <= 0) {
      throw new Error(`第 ${idx + 1} 行：订购件数必须 > 0`);
    }
    if (supplyPrice != null && (Number.isNaN(supplyPrice) || supplyPrice < 0)) {
      throw new Error(`第 ${idx + 1} 行：采购单价非法`);
    }
    if (
      unitsPerCase != null &&
      (Number.isNaN(unitsPerCase) || unitsPerCase <= 0)
    ) {
      throw new Error(`第 ${idx + 1} 行：每件数量必须为正整数`);
    }

    normalized.push({
      line_no: idx + 1,
      item_id: itemId,
      category: null,

      spec_text: l.spec_text.trim() || null,
      base_uom: l.base_uom.trim() || null,
      purchase_uom: l.purchase_uom.trim() || null,
      units_per_case: unitsPerCase,

      qty_cases: qty,
      qty_ordered: qty,

      supply_price: supplyPrice,
    });
  }

  return normalized;
}
