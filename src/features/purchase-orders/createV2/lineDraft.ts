// src/features/purchase-orders/createV2/lineDraft.ts
//
// Phase M-6 终态：
// - 行输入合同 = item_id + uom_id + qty_input
// - qty_base 由后端通过 item_uoms.ratio_to_base 推导
// - 前端不再保留任何 case_* / snapshot 字段

import type { PurchaseOrderLineCreatePayload } from "../api";
import type { ItemBasic } from "../../../master-data/itemsApi";

export type LineDraft = {
  id: number;

  item_id: string;
  item_name: string;
  spec_text: string;

  // ✅ 终态字段
  uom_id: string;     // 选择的单位 ID（字符串形式）
  qty_input: string;  // 输入数量（字符串形式）

  supply_price: string;
};

export const makeEmptyLine = (id: number): LineDraft => ({
  id,
  item_id: "",
  item_name: "",
  spec_text: "",
  uom_id: "",
  qty_input: "",
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
      uom_id: "",
      qty_input: "",
    };
  }

  const found = itemOptions.find((it) => it.id === itemId);
  if (!found) {
    return {
      ...line,
      item_id: "",
      item_name: "",
      spec_text: "",
      uom_id: "",
      qty_input: "",
    };
  }

  return {
    ...line,
    item_id: String(found.id),
    item_name: found.name,
    spec_text: found.spec ?? "",
    // uom_id / qty_input 由用户选择与输入
    uom_id: "",
    qty_input: "",
  };
}

function intOrNull(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  if (!Number.isInteger(n)) return null;
  return n;
}

export function buildPayloadLines(
  lines: LineDraft[],
): PurchaseOrderLineCreatePayload[] {
  const normalized: PurchaseOrderLineCreatePayload[] = [];

  for (const [idx, l] of lines.entries()) {
    const empty =
      !l.item_id.trim() &&
      !l.qty_input.trim() &&
      !l.item_name.trim();

    if (empty) continue;

    const itemId = Number(l.item_id.trim());
    const uomId = Number(l.uom_id.trim());
    const qtyInput = intOrNull(l.qty_input);

    if (Number.isNaN(itemId) || itemId <= 0) {
      throw new Error(`第 ${idx + 1} 行：请选择商品`);
    }

    if (Number.isNaN(uomId) || uomId <= 0) {
      throw new Error(`第 ${idx + 1} 行：请选择单位`);
    }

    if (qtyInput == null || qtyInput <= 0) {
      throw new Error(`第 ${idx + 1} 行：数量必须为正整数`);
    }

    normalized.push({
      line_no: idx + 1,
      item_id: itemId,
      uom_id: uomId,
      qty_input: qtyInput,
    });
  }

  return normalized;
}
