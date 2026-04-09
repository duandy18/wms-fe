// src/features/pms/items/editor/syncItemBarcodesForEdit.ts

import type { FormState } from "../create/types";
import {
  fetchItemBarcodes,
  createItemBarcode,
  setPrimaryBarcode,
  type ItemBarcode,
} from "../api/itemBarcodesOwnerApi";
import { fetchItemUoms } from "../api/itemUomsOwnerApi";
import { normalizeBarcode } from "./itemEditorUtils";

/**
 * 终态（无条码面板，条码输入并入 BasicSection）：
 * - 产品码：填写即确保存在，并绑定到 base uom，设为主条码
 * - 箱码：确保存在，并绑定到 purchase_default uom；永不设主条码
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
  const uoms = await fetchItemUoms(itemId);

  const baseUom = uoms.find((x) => x.is_base) ?? null;
  const purchaseDefaultUom = uoms.find((x) => x.is_purchase_default && !x.is_base) ?? null;

  const findByCode = (code: string): ItemBarcode | null =>
    existing.find((b) => String(b.barcode ?? "").trim() === code) ?? null;

  // 产品码：确保存在并设为主条码
  if (itemCode) {
    const rec = findByCode(itemCode);

    if (!rec) {
      if (!baseUom) throw new Error("缺少基准单位，无法绑定产品码");
      const created = await createItemBarcode({
        item_uom_id: baseUom.id,
        barcode: itemCode,
        symbology: "EAN13",
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
      if (!purchaseDefaultUom) throw new Error("箱码必须先配置采购默认单位");
      await createItemBarcode({
        item_uom_id: purchaseDefaultUom.id,
        barcode: caseCode,
        symbology: "CUSTOM",
        active: true,
      });
    }
  }
}
