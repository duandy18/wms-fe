// src/features/pms/items/create/submit.ts

import type { Supplier } from "@/features/pms/suppliers/api/suppliersApi";
import type { Item, ItemCreateInput } from "../../../../contracts/item/contract";
import { createItem } from "../api/itemsOwnerApi";
import type { FormState } from "./types";

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
  return createItem(body);
}
