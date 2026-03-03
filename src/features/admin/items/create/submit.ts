// src/features/admin/items/create/submit.ts

import type { Supplier } from "../../suppliers/api";
import type { Item, ItemCreateInput } from "../../../../contracts/item/contract";
import { createItem } from "../api";
import type { FormState } from "./types";
import { createItemUom } from "../../../../master-data/itemUomsApi";
import { createItemBarcode, setPrimaryBarcode } from "../../../../master-data/itemBarcodesApi";

export type SubmitResult =
  | { ok: true; created: { id: number; sku: string } }
  | { ok: false; error: string };

export async function submitCreateItem(args: {
  form: FormState;
  suppliers: Supplier[];
  supLoading: boolean;
}): Promise<{ body: ItemCreateInput } | SubmitResult> {
  const { form, suppliers, supLoading } = args;

  if (!supLoading && suppliers.length === 0) {
    return {
      ok: false,
      error: "没有可用供货商。请先到「系统管理 → 供应商主数据」新建供应商。",
    };
  }

  const name = form.name.trim();
  if (!name) return { ok: false, error: "商品名称不能为空" };

  const body: ItemCreateInput = {
    name,
    spec: form.spec.trim() || null,
    brand: form.brand.trim() || null,
    category: form.category.trim() || null,

    supplier_id: form.supplier_id.trim() ? Number(form.supplier_id.trim()) : null,
    weight_kg: form.weight_kg.trim() ? Number(form.weight_kg.trim()) : null,

    lot_source_policy: form.lot_source_policy,
    expiry_policy: form.expiry_policy,
    derivation_allowed: Boolean(form.derivation_allowed),
    uom_governance_enabled: Boolean(form.uom_governance_enabled),

    shelf_life_value: form.shelf_life_value.trim() ? Number(form.shelf_life_value.trim()) : null,
    shelf_life_unit: form.shelf_life_value.trim() ? form.shelf_life_unit : null,

    enabled: form.status === "enabled",
  };

  return { body };
}

export async function runCreateItem(body: ItemCreateInput): Promise<Item> {
  return await createItem(body);
}

export async function runPostCreateWrites(args: {
  itemId: number;
  uomsToCreate: Array<{
    uom: string;
    ratio_to_base: number;
    display_name: string | null;
    is_base: boolean;
    is_purchase_default: boolean;
    is_inbound_default: boolean;
    is_outbound_default: boolean;
  }>;
  barcodesToCreate: Array<{ barcode: string; kind: "EAN13" | "UPC" | "INNER" | "CUSTOM"; set_primary: boolean }>;
}): Promise<void> {
  const { itemId, uomsToCreate, barcodesToCreate } = args;

  const base = uomsToCreate.find((x) => x.is_base);
  if (!base) throw new Error("missing base uom");

  // 先创建 base（ratio_to_base 强制 1）
  await createItemUom({
    item_id: itemId,
    uom: base.uom,
    ratio_to_base: 1,
    display_name: base.display_name,
    is_base: true,
    is_purchase_default: Boolean(base.is_purchase_default),
    is_inbound_default: Boolean(base.is_inbound_default),
    is_outbound_default: Boolean(base.is_outbound_default),
  });

  // 再创建 purchase_default（若存在）
  const purchase = uomsToCreate.find((x) => !x.is_base && x.is_purchase_default);
  if (purchase) {
    await createItemUom({
      item_id: itemId,
      uom: purchase.uom,
      ratio_to_base: purchase.ratio_to_base,
      display_name: purchase.display_name,
      is_base: false,
      is_purchase_default: true,
      is_inbound_default: Boolean(purchase.is_inbound_default),
      is_outbound_default: Boolean(purchase.is_outbound_default),
    });
  }

  for (const b of barcodesToCreate) {
    const created = await createItemBarcode({
      item_id: itemId,
      barcode: b.barcode,
      kind: b.kind,
      active: true,
    });
    if (b.set_primary) {
      await setPrimaryBarcode(created.id);
    }
  }
}
