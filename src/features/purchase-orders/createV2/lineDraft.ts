// src/features/purchase-orders/createV2/lineDraft.ts

import type { PurchaseOrderLineCreatePayload } from "../api";
import type { ItemBasic } from "../../../master-data/itemsApi";

/**
 * Phase2（B 档）：
 * - UI/状态字段名使用快照解释器语言（uom_snapshot / case_uom_snapshot / case_ratio_snapshot / qty_ordered_case_input）
 * - 提交 payload 仍做兼容映射：purchase_uom / units_per_case / qty_ordered（后端当前兼容）
 */
export type LineDraft = {
  id: number;

  item_id: string;
  item_name: string;
  spec_text: string;

  // ✅ Phase2：快照解释器（UI/状态第一公民）
  uom_snapshot: string; // 最小单位快照
  case_uom_snapshot: string; // 采购单位快照
  case_ratio_snapshot: string; // 倍率输入（字符串）
  qty_ordered_case_input: string; // 订购数量输入痕迹（字符串）

  // ✅ 单价（按最小单位 base 计价）
  supply_price: string;
};

export const makeEmptyLine = (id: number): LineDraft => ({
  id,
  item_id: "",
  item_name: "",
  spec_text: "",
  uom_snapshot: "",
  case_uom_snapshot: "",
  case_ratio_snapshot: "",
  qty_ordered_case_input: "",
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
      uom_snapshot: "",
      case_uom_snapshot: "",
    };
  }

  const found = itemOptions.find((it) => it.id === itemId);
  if (!found) {
    // ✅ 不允许“幽灵商品”：找不到就清空
    return {
      ...line,
      item_id: "",
      item_name: "",
      spec_text: "",
      uom_snapshot: "",
      case_uom_snapshot: "",
    };
  }

  return {
    ...line,
    item_id: String(found.id),
    item_name: found.name,
    spec_text: found.spec ?? "",
    // ✅ 最小单位默认来自主数据（允许用户覆盖，作为单据快照）
    uom_snapshot: found.uom ?? line.uom_snapshot,
    // ✅ 采购单位由用户输入（不覆盖）
    case_uom_snapshot: line.case_uom_snapshot || "",
  };
}

function numOrNull(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function intOrNull(raw: string): number | null {
  const n = numOrNull(raw);
  if (n == null) return null;
  if (!Number.isInteger(n)) return null;
  return n;
}

function trimOrNull(raw: string): string | null {
  const s = raw.trim();
  return s ? s : null;
}

export function buildPayloadLines(lines: LineDraft[]): PurchaseOrderLineCreatePayload[] {
  const normalized: PurchaseOrderLineCreatePayload[] = [];

  for (const [idx, l] of lines.entries()) {
    const empty =
      !l.item_id.trim() &&
      !l.qty_ordered_case_input.trim() &&
      !l.item_name.trim();
    if (empty) continue;

    const itemId = Number(l.item_id.trim());
    const caseInputNum = Number(l.qty_ordered_case_input.trim());

    const supplyPrice = numOrNull(l.supply_price);

    // 倍率（输入允许为空；为空则默认 1）
    const ratioInt = intOrNull(l.case_ratio_snapshot);

    if (Number.isNaN(itemId) || itemId <= 0) {
      throw new Error(`第 ${idx + 1} 行：请选择商品`);
    }
    if (Number.isNaN(caseInputNum) || caseInputNum <= 0) {
      throw new Error(`第 ${idx + 1} 行：订购数量（case_input）必须 > 0`);
    }
    if (supplyPrice != null && (Number.isNaN(supplyPrice) || supplyPrice < 0)) {
      throw new Error(`第 ${idx + 1} 行：采购单价非法`);
    }
    if (ratioInt != null && ratioInt <= 0) {
      throw new Error(`第 ${idx + 1} 行：倍率（case_ratio）必须为正整数`);
    }

    const upc = ratioInt ?? 1;

    // ✅ Phase2：唯一事实口径
    const qtyOrderedBase = Math.trunc(caseInputNum) * Math.trunc(upc);

    const uomSnapshot = trimOrNull(l.uom_snapshot);
    const caseUomSnapshot = trimOrNull(l.case_uom_snapshot);
    const caseRatioSnapshot = upc > 1 ? upc : null;
    const qtyOrderedCaseInput = upc > 1 ? Math.trunc(caseInputNum) : null;

    // ---------------------------------------------------------
    // 兼容映射（后端当前仍接收旧字段）：
    // - purchase_uom      <- case_uom_snapshot
    // - units_per_case    <- case_ratio_snapshot（可空）
    // - qty_ordered       <- qty_ordered_case_input
    // - qty_cases         <- qty_ordered_case_input（历史字段）
    // ---------------------------------------------------------
    normalized.push({
      line_no: idx + 1,
      item_id: itemId,
      category: null,

      spec_text: trimOrNull(l.spec_text),

      // legacy compat
      base_uom: uomSnapshot,
      purchase_uom: caseUomSnapshot,
      units_per_case: ratioInt,

      qty_cases: Math.trunc(caseInputNum),
      qty_ordered: Math.trunc(caseInputNum),

      supply_price: supplyPrice,

      // Phase2 forward fields
      uom_snapshot: uomSnapshot,
      case_uom_snapshot: caseUomSnapshot,
      case_ratio_snapshot: caseRatioSnapshot,
      qty_ordered_case_input: qtyOrderedCaseInput,
      qty_ordered_base: qtyOrderedBase,
    });
  }

  return normalized;
}
