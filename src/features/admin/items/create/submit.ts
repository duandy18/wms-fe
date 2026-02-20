// src/features/admin/items/create/submit.ts

import type { Supplier } from "../../suppliers/api";
import type { Item, ItemCreateInput } from "../api";
import { createItem } from "../api";
import type { FormState } from "./types";
import { effectiveUom } from "./types";

export type SubmitResult =
  | { ok: true; created: { id: number; sku: string } }
  | { ok: false; error: string };

export async function submitCreateItem(args: {
  form: FormState;
  suppliers: Supplier[];
  supLoading: boolean;
}): Promise<{ body: ItemCreateInput } | SubmitResult> {
  const { form, suppliers, supLoading } = args;

  // 供货商必须存在（UI级防撞墙）
  if (!supLoading && suppliers.length === 0) {
    return { ok: false, error: "没有可用供货商。请先到「系统管理 → 供应商主数据」新建供应商。" };
  }

  const name = form.name.trim();
  if (!name) return { ok: false, error: "商品名称不能为空" };

  // ✅ spec：可选展示文本（空串视为 undefined，不传）
  const spec = form.spec.trim() || undefined;

  const supplierId = Number(form.supplier_id);
  if (!form.supplier_id || !Number.isFinite(supplierId) || supplierId <= 0) {
    return { ok: false, error: "供货商必须选择" };
  }

  const uom = effectiveUom(form);
  if (!uom) return { ok: false, error: "最小包装单位必须选择或填写" };

  // 单位净重必填（允许 0）
  const weightRaw = form.weight_kg.trim();
  if (!weightRaw) return { ok: false, error: "单位净重(kg)必须填写（可填 0）" };
  const weightNum = Number(weightRaw);
  if (!Number.isFinite(weightNum) || weightNum < 0) {
    return { ok: false, error: "单位净重(kg)必须是 >= 0 的数字" };
  }
  const weight_kg: number = weightNum;

  // 主条码必填
  const barcode = form.barcode.trim();
  if (!barcode) return { ok: false, error: "主条码必须填写" };

  const has_shelf_life = form.shelf_mode === "yes";

  // 当有效期=有：默认有效期值必填 + 单位必选
  let shelf_life_value: number | null = null;
  let shelf_life_unit: "MONTH" | "DAY" | null = null;

  if (has_shelf_life) {
    const v = form.shelf_life_value.trim();
    if (!v) return { ok: false, error: "默认有效期值必须填写" };
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0) {
      return { ok: false, error: "默认有效期值必须是 >= 0 的数字" };
    }
    shelf_life_value = n;
    shelf_life_unit = form.shelf_life_unit;
  } else {
    shelf_life_value = null;
    shelf_life_unit = null;
  }

  const enabled = form.status === "enabled";

  return {
    body: {
      name,
      // ✅ 新增：规格（可选）
      spec,

      supplier_id: supplierId,
      uom,
      weight_kg,

      has_shelf_life,
      shelf_life_value,
      shelf_life_unit,

      enabled,
      barcode,
    },
  };
}

export async function runCreateItem(body: ItemCreateInput): Promise<Item> {
  return await createItem(body);
}
