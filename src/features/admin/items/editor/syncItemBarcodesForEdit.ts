// src/features/admin/items/editor/syncItemBarcodesForEdit.ts

import type { FormState } from "../create/types";
import {
  fetchItemBarcodes,
  createItemBarcode,
  setPrimaryBarcode,
  type ItemBarcode,
} from "../../../../master-data/itemBarcodesApi";
import { normalizeBarcode } from "./itemEditorUtils";

/**
 * 终态（无条码面板，条码输入并入 BasicSection）：
 * - 产品码：填写即确保存在，并设为主条码
 * - 箱码：确保存在为 INNER；永不设主条码
 *
 * 注意：不做删除，避免无面板时误删事实。
 */
export async function syncItemBarcodesForEdit(args: {
  itemId: number;
  form: FormState;
}): Promise<void> {
  const { itemId, form } = args;

  const itemCode = normalizeBarcode(form.barcodes.item_barcode);
  const caseCode = normalizeBarcode(form.barcodes.case_barcode);

  if (!itemCode && !caseCode) return;

  const existing = await fetchItemBarcodes(itemId);

  const findByCode = (code: string): ItemBarcode | null =>
    existing.find((b) => String(b.barcode ?? "").trim() === code) ?? null;

  // 产品码：确保存在并设为主条码
  if (itemCode) {
    const rec = findByCode(itemCode);

    if (!rec) {
      const created = await createItemBarcode({
        item_id: itemId,
        barcode: itemCode,
        kind: "EAN13",
        active: true,
      });
      await setPrimaryBarcode(created.id);
    } else if (!rec.is_primary) {
      await setPrimaryBarcode(rec.id);
    }
  }

  // 箱码：确保存在，永不设主
  if (caseCode) {
    const rec = findByCode(caseCode);
    if (!rec) {
      await createItemBarcode({
        item_id: itemId,
        barcode: caseCode,
        kind: "INNER",
        active: true,
      });
    }
  }
}
