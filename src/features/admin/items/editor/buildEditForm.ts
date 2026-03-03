// src/features/admin/items/editor/buildEditForm.ts

import type { Item } from "../../../../contracts/item/contract";
import type { FormState } from "../create/types";
import { asRecord } from "./itemEditorUtils";

/**
 * 编辑模式下的 items 基础字段回填（不回填 uoms；不回填条码表事实）
 * - uoms：留空，交给 item_uoms 回填 effect
 * - barcodes：留空，条码输入并入 BasicSection；保存时写入 item_barcodes
 */
export function buildEditForm(args: { selectedItem: Item; emptyForm: FormState }): FormState {
  const { selectedItem, emptyForm } = args;

  const r = asRecord(selectedItem);

  const nextForm: FormState = {
    ...emptyForm,

    name: selectedItem.name ?? "",
    spec: (selectedItem.spec ?? "").trim(),
    brand: (selectedItem.brand ?? "").trim(),
    category: (selectedItem.category ?? "").trim(),

    supplier_id: selectedItem.supplier_id == null ? "" : String(selectedItem.supplier_id),
    weight_kg: selectedItem.weight_kg == null ? "" : String(selectedItem.weight_kg),

    lot_source_policy: (r["lot_source_policy"] as FormState["lot_source_policy"]) ?? "SUPPLIER_ONLY",
    expiry_policy: (r["expiry_policy"] as FormState["expiry_policy"]) ?? "NONE",
    derivation_allowed: Boolean(r["derivation_allowed"]),
    uom_governance_enabled: Boolean(r["uom_governance_enabled"]),

    shelf_life_value: r["shelf_life_value"] == null ? "" : String(r["shelf_life_value"]),
    shelf_life_unit: (r["shelf_life_unit"] ?? "MONTH") as FormState["shelf_life_unit"],

    // 单位：置空，等待 item_uoms 回填
    uoms: [],

    // 条码：置空，用户可在 BasicSection 扫码/输入；保存时同步写入 item_barcodes
    barcodes: { item_barcode: "", case_barcode: "" },

    status: selectedItem.enabled ? "enabled" : "disabled",
  };

  return nextForm;
}
