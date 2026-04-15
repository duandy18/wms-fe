// src/features/purchase-orders/create/presenter/lineDraft.ts
//
// Phase M-6 终态：
// - 行输入合同 = item_id + uom_id + qty_input + 商业字段
// - qty_base 由后端通过 item_uoms.ratio_to_base 推导
// - 前端不再保留任何 case_* / snapshot 字段

import type { PurchaseOrderLineCreatePayload } from "../../api";
import type { ItemBasic } from "../../../../domains/pms/public/contracts/itemBasic";

export type LineDraft = {
  id: number;

  item_id: string;
  item_name: string;
  spec_text: string;

  // ✅ 终态字段
  uom_id: string;
  qty_input: string;

  // ✅ 行商业字段
  supply_price: string;
  discount_amount: string;
  discount_note: string;
  remark: string;
};

export const makeEmptyLine = (id: number): LineDraft => ({
  id,
  item_id: "",
  item_name: "",
  spec_text: "",
  uom_id: "",
  qty_input: "",
  supply_price: "",
  discount_amount: "",
  discount_note: "",
  remark: "",
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
      supply_price: "",
      discount_amount: "",
      discount_note: "",
      remark: "",
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
      supply_price: "",
      discount_amount: "",
      discount_note: "",
      remark: "",
    };
  }

  return {
    ...line,
    item_id: String(found.id),
    item_name: found.name,
    spec_text: found.spec ?? "",
    // 商品切换后，单位/数量/商业字段全部回到空态
    uom_id: "",
    qty_input: "",
    supply_price: "",
    discount_amount: "",
    discount_note: "",
    remark: "",
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

function trimOrNull(raw: string): string | null {
  const t = raw.trim();
  return t ? t : null;
}

function decimalTextOrNull(raw: string, label: string, lineNo: number): string | null {
  const t = raw.trim();
  if (!t) return null;

  if (!/^\d+(?:\.\d{1,2})?$/.test(t)) {
    throw new Error(`第 ${lineNo} 行：${label}必须为非负数字，且最多保留 2 位小数`);
  }

  return t;
}

export function buildPayloadLines(
  lines: LineDraft[],
): PurchaseOrderLineCreatePayload[] {
  const normalized: PurchaseOrderLineCreatePayload[] = [];

  for (const [idx, l] of lines.entries()) {
    const lineNo = idx + 1;
    const empty =
      !l.item_id.trim() &&
      !l.uom_id.trim() &&
      !l.qty_input.trim() &&
      !l.item_name.trim() &&
      !l.supply_price.trim() &&
      !l.discount_amount.trim() &&
      !l.discount_note.trim() &&
      !l.remark.trim();

    if (empty) continue;

    const itemId = Number(l.item_id.trim());
    const uomId = Number(l.uom_id.trim());
    const qtyInput = intOrNull(l.qty_input);

    if (Number.isNaN(itemId) || itemId <= 0) {
      throw new Error(`第 ${lineNo} 行：请选择商品`);
    }

    if (Number.isNaN(uomId) || uomId <= 0) {
      throw new Error(`第 ${lineNo} 行：请选择单位`);
    }

    if (qtyInput == null || qtyInput <= 0) {
      throw new Error(`第 ${lineNo} 行：数量必须为正整数`);
    }

    const supplyPrice = decimalTextOrNull(l.supply_price, "采购单价", lineNo);
    const discountAmount = decimalTextOrNull(l.discount_amount, "折扣金额", lineNo);
    const discountNote = trimOrNull(l.discount_note);
    const remark = trimOrNull(l.remark);

    const payload: PurchaseOrderLineCreatePayload = {
      line_no: lineNo,
      item_id: itemId,
      uom_id: uomId,
      qty_input: qtyInput,
    };

    if (supplyPrice != null) payload.supply_price = supplyPrice;
    if (discountAmount != null) payload.discount_amount = discountAmount;
    if (discountNote != null) payload.discount_note = discountNote;
    if (remark != null) payload.remark = remark;

    normalized.push(payload);
  }

  return normalized;
}
