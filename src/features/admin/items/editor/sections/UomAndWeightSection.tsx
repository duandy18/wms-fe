// src/features/admin/items/editor/sections/UomAndWeightSection.tsx

import React, { useMemo } from "react";
import type { ItemEditorVm } from "../useItemEditor";
import type { UomDraft } from "../../create/types";

const FieldError: React.FC<{ msg?: string }> = ({ msg }) =>
  msg ? <div className="mt-1 text-xs text-red-600">{msg}</div> : null;

function trimOrEmpty(v: string): string {
  return (v ?? "").trim();
}

function findBase(uoms: UomDraft[]): UomDraft | null {
  return uoms.find((x) => x.is_base) ?? null;
}

function findPurchaseDefault(uoms: UomDraft[]): UomDraft | null {
  return uoms.find((x) => x.is_purchase_default && !x.is_base) ?? null;
}

function emptyUomDraft(): UomDraft {
  return {
    uom: "",
    ratio_to_base: "",
    display_name: "",
    is_base: false,
    is_purchase_default: false,
    is_inbound_default: false,
    is_outbound_default: false,
  };
}

function upsertBase(uoms: UomDraft[], patch: Partial<UomDraft>): UomDraft[] {
  const base = findBase(uoms);
  const rest = uoms.filter((x) => !x.is_base);

  const draft: UomDraft = {
    ...emptyUomDraft(),
    ...(base ?? {}),
    ...patch,
  };

  const nextBase: UomDraft = {
    ...draft,
    is_base: true,
    ratio_to_base: "1",
    is_inbound_default: true,
    is_outbound_default: true,
    display_name: "",
  };

  return [nextBase, ...rest];
}

function removePurchase(uoms: UomDraft[]): UomDraft[] {
  const rest = uoms.filter((x) => !(x.is_purchase_default && !x.is_base));
  const base = findBase(rest);
  if (!base) return rest;
  return upsertBase(rest, { is_purchase_default: true });
}

function upsertPurchase(uoms: UomDraft[], patch: Partial<UomDraft>): UomDraft[] {
  const base = findBase(uoms);

  const cleaned = uoms.filter((x) => !(x.is_purchase_default && !x.is_base));

  const nextWithBase = base != null ? upsertBase(cleaned, { is_purchase_default: false }) : cleaned;

  const prevPurchase = findPurchaseDefault(uoms);

  const draft: UomDraft = {
    ...emptyUomDraft(),
    ...(prevPurchase ?? {}),
    ...patch,
  };

  const nextPurchase: UomDraft = {
    ...draft,
    is_base: false,
    is_purchase_default: true,
    is_inbound_default: false,
    is_outbound_default: false,
    display_name: "",
  };

  return [...nextWithBase, nextPurchase];
}

const UomAndWeightSection: React.FC<{ vm: ItemEditorVm }> = ({ vm }) => {
  const { form, setForm, fieldErrors } = vm;

  // ✅ 与页面其它输入框统一：白底、同样 border/spacing
  const monoInput = "rounded border px-3 py-2 w-full bg-white font-mono text-base";

  const base = useMemo(() => findBase(form.uoms) ?? null, [form.uoms]);
  const purchase = useMemo(() => findPurchaseDefault(form.uoms) ?? null, [form.uoms]);

  const baseUom = base?.uom ?? "";
  const purchaseUom = purchase?.uom ?? "";
  const purchaseRatio = purchase?.ratio_to_base ?? "";

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {/* 单件净重 */}
      <div>
        <input
          className={monoInput}
          placeholder="单件净重(kg)（可选，如：0.2）"
          value={form.weight_kg}
          onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
          disabled={vm.saving}
          inputMode="decimal"
        />
        <FieldError msg={fieldErrors.weight_kg} />
      </div>

      {/* 最小包装单位 */}
      <div>
        <input
          className={monoInput}
          placeholder="最小包装单位（必填，如：PCS/袋/箱）"
          value={baseUom}
          onChange={(e) =>
            setForm({
              ...form,
              uoms: upsertBase(form.uoms, { uom: e.target.value }),
            })
          }
          disabled={vm.saving}
        />
        <FieldError msg={fieldErrors.base_uom_uom} />
      </div>

      {/* 采购包装单位 */}
      <div>
        <input
          className={monoInput}
          placeholder="采购包装单位（可选，如：箱/件）"
          value={purchaseUom}
          onChange={(e) => {
            const uom = e.target.value;
            if (!trimOrEmpty(uom)) {
              setForm({ ...form, uoms: removePurchase(form.uoms) });
              return;
            }
            setForm({
              ...form,
              uoms: upsertPurchase(form.uoms, { uom }),
            });
          }}
          disabled={vm.saving}
        />
        <FieldError msg={fieldErrors.purchase_default_uom} />
      </div>

      {/* 采购倍率 */}
      <div>
        <input
          className={monoInput}
          placeholder="采购包装倍率（整数≥1，如：12）"
          value={purchaseRatio}
          onChange={(e) => {
            if (!trimOrEmpty(purchaseUom)) return;
            setForm({
              ...form,
              uoms: upsertPurchase(form.uoms, { ratio_to_base: e.target.value }),
            });
          }}
          disabled={vm.saving || !trimOrEmpty(purchaseUom)}
          inputMode="numeric"
        />
      </div>
    </div>
  );
};

export default UomAndWeightSection;
