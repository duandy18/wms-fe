// src/features/pms/items/editor/buildEditForm.ts

import type { Item } from "../../../../contracts/item/contract";
import type { FormState } from "../create/types";
import { asRecord } from "./itemEditorUtils";

/**
 * 编辑模式下只回填 item 本体字段。
 * 商品页不再承载包装单位 / 条码 / 单位换算治理。
 */
export function buildEditForm(args: { selectedItem: Item; emptyForm: FormState }): FormState {
  const { selectedItem, emptyForm } = args;

  const r = asRecord(selectedItem);

  const nextForm: FormState = {
    ...emptyForm,

    sku: selectedItem.sku ?? "",
    name: selectedItem.name ?? "",
    spec: (selectedItem.spec ?? "").trim(),
    brand: (selectedItem.brand ?? "").trim(),
    category: (selectedItem.category ?? "").trim(),

    supplier_id: selectedItem.supplier_id == null ? "" : String(selectedItem.supplier_id),

    lot_source_policy: (r["lot_source_policy"] as FormState["lot_source_policy"]) ?? "SUPPLIER_ONLY",
    expiry_policy: (r["expiry_policy"] as FormState["expiry_policy"]) ?? "NONE",
    derivation_allowed: Boolean(r["derivation_allowed"]),
    uom_governance_enabled: Boolean(r["uom_governance_enabled"]),

    shelf_life_value: r["shelf_life_value"] == null ? "" : String(r["shelf_life_value"]),
    shelf_life_unit: (r["shelf_life_unit"] ?? "MONTH") as FormState["shelf_life_unit"],

    status: selectedItem.enabled ? "enabled" : "disabled",
  };

  return nextForm;
}
