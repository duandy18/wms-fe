// src/features/purchase-orders/create/linesEditor/LineRow.tsx
//
// 当前 PO Create 行编辑：
// - 输入单位：uom_id（来自 public aggregate.uoms）
// - 输入数量：qty_input
// - 商业字段：supply_price / discount_amount / discount_note / remark
// - qty_base 由后端推导

import React, { useEffect, useMemo } from "react";
import type { ItemBasic } from "../../../../domains/pms/export/contracts/itemBasic";
import type { PublicAggregateUom } from "../../../../domains/pms/export/contracts/itemAggregate";
import type { LineDraft } from "../presenter/lineDraft";
import { calcEstAmount } from "./calc";

export type PurchaseOrderLineRowProps = {
  line: LineDraft;
  idx: number;

  items: ItemBasic[];
  itemsLoading: boolean;

  selectedItem: ItemBasic | undefined;

  uomsForSelectedItem: PublicAggregateUom[];
  primaryBarcodeText?: string;
  uomsLoading?: boolean;

  onChangeLineField: (lineId: number, field: keyof LineDraft, value: string) => void;
  onSelectItem: (lineId: number, itemId: number | null) => void;
  onRemoveLine: (lineId: number) => void;

  canRemove: boolean;
};

function safeNonNegativeNumber(raw: string): number {
  const t = raw.trim();
  if (!t) return 0;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export const PurchaseOrderCreateLineRow: React.FC<PurchaseOrderLineRowProps> = ({
  line,
  idx,
  items,
  itemsLoading,
  selectedItem,
  uomsForSelectedItem,
  primaryBarcodeText,
  uomsLoading,
  onChangeLineField,
  onSelectItem,
  onRemoveLine,
  canRemove,
}) => {
  const selectedItemId = line.item_id ? Number(line.item_id) : null;

  const barcodeText = primaryBarcodeText?.trim() ? primaryBarcodeText : "—";
  const uomIdValue = line.uom_id.trim();

  useEffect(() => {
    if (!selectedItemId || uomIdValue) return;
    if (!uomsForSelectedItem.length) return;

    const preferred =
      uomsForSelectedItem.find((x) => x.is_purchase_default) ??
      uomsForSelectedItem.find((x) => x.is_base) ??
      uomsForSelectedItem[0];

    if (preferred) {
      onChangeLineField(line.id, "uom_id", String(preferred.id));
    }
  }, [selectedItemId, uomIdValue, uomsForSelectedItem, line.id, onChangeLineField]);

  const selectedUom = useMemo(() => {
    if (!uomIdValue) return null;
    return uomsForSelectedItem.find((u) => String(u.id) === uomIdValue) ?? null;
  }, [uomIdValue, uomsForSelectedItem]);

  const ratioToBaseHint = selectedUom?.ratio_to_base ?? 1;

  const qtyInputRaw = line.qty_input.trim();
  const qtyInputNum = qtyInputRaw ? Number(qtyInputRaw) : NaN;

  const qtyBaseHint =
    Number.isFinite(qtyInputNum) && qtyInputNum > 0
      ? Math.trunc(qtyInputNum) * Math.trunc(ratioToBaseHint)
      : null;

  const grossAmount = calcEstAmount({
    qtyBase: qtyBaseHint,
    supplyPrice: line.supply_price,
  });
  const discountAmountNum = safeNonNegativeNumber(line.discount_amount);
  const netAmount =
    qtyBaseHint !== null && grossAmount > 0
      ? Math.max(grossAmount - discountAmountNum, 0)
      : 0;

  const uomSelectDisabled = itemsLoading || !selectedItemId || Boolean(uomsLoading);

  const itemNameText = line.item_name || selectedItem?.name || "—";
  const specText = line.spec_text || selectedItem?.spec || "—";
  const skuText = selectedItem?.sku?.trim() ? selectedItem.sku : "—";
  const brandText = selectedItem?.brand?.trim() ? selectedItem.brand : "—";
  const categoryText = selectedItem?.category?.trim() ? selectedItem.category : "—";

  return (
    <tr className="border-b border-slate-100 align-top">
      <td className="px-3 py-3 text-left font-mono text-base">{idx + 1}</td>

      <td className="px-3 py-3">
        <select
          className="w-64 rounded-xl border border-slate-300 px-3 py-2 text-base"
          value={selectedItemId ?? ""}
          disabled={itemsLoading}
          onChange={(e) => onSelectItem(line.id, e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">{itemsLoading ? "加载中…" : "请选择商品"}</option>
          {items.map((it) => {
            const brand = it.brand?.trim() ? it.brand : "—";
            const cat = it.category?.trim() ? it.category : "—";
            const spec = it.spec ? ` ｜ ${it.spec}` : "";
            const label = `[${it.id}] ${it.name}${spec} · ${brand} · ${cat}`;
            return (
              <option key={it.id} value={it.id}>
                {label}
              </option>
            );
          })}
        </select>
      </td>

      <td className="px-3 py-3">
        <div className="min-w-[300px] space-y-1">
          <div className="font-medium text-slate-900">{itemNameText}</div>
          <div className="text-xs text-slate-600">
            SKU：{skuText} · 规格：{specText}
          </div>
          <div className="text-xs text-slate-600">
            品牌：{brandText} · 分类：{categoryText}
          </div>
          <div className="text-xs font-mono text-slate-500">条码：{barcodeText}</div>
        </div>
      </td>

      <td className="px-3 py-3">
        <select
          className="w-44 rounded-xl border border-slate-300 px-3 py-2 text-base"
          value={uomIdValue}
          disabled={uomSelectDisabled}
          onChange={(e) => onChangeLineField(line.id, "uom_id", e.target.value)}
        >
          <option value="">
            {!selectedItemId ? "先选商品" : uomsLoading ? "单位加载中…" : "请选择单位"}
          </option>

          {uomsForSelectedItem.map((u) => {
            const name = u.display_name?.trim() ? u.display_name : u.uom;
            const tag = u.is_purchase_default ? "默认" : u.is_base ? "基准" : "";
            const label = `${name}（×${u.ratio_to_base}）${tag ? ` · ${tag}` : ""}`;
            return (
              <option key={u.id} value={String(u.id)}>
                {label}
              </option>
            );
          })}
        </select>
      </td>

      <td className="px-3 py-3 text-right">
        <input
          className="w-28 rounded-xl border border-slate-300 px-3 py-2 text-right text-base"
          value={line.qty_input}
          onChange={(e) => onChangeLineField(line.id, "qty_input", e.target.value)}
          placeholder="数量"
          inputMode="numeric"
        />
      </td>

      <td className="px-3 py-3 text-right">
        <div className="font-mono text-slate-900">{qtyBaseHint ?? "-"}</div>
        <div className="text-[11px] text-slate-500">
          后端推导{selectedUom ? `（×${selectedUom.ratio_to_base}）` : ""}
        </div>
      </td>

      <td className="px-3 py-3 text-right">
        <input
          className="w-28 rounded-xl border border-slate-300 px-3 py-2 text-right text-base"
          value={line.supply_price}
          onChange={(e) => onChangeLineField(line.id, "supply_price", e.target.value)}
          placeholder="单价"
          inputMode="decimal"
        />
      </td>

      <td className="px-3 py-3 text-right">
        <input
          className="w-28 rounded-xl border border-slate-300 px-3 py-2 text-right text-base"
          value={line.discount_amount}
          onChange={(e) => onChangeLineField(line.id, "discount_amount", e.target.value)}
          placeholder="折扣"
          inputMode="decimal"
        />
      </td>

      <td className="px-3 py-3">
        <input
          className="w-44 rounded-xl border border-slate-300 px-3 py-2 text-base"
          value={line.discount_note}
          onChange={(e) => onChangeLineField(line.id, "discount_note", e.target.value)}
          placeholder="折扣说明"
        />
      </td>

      <td className="px-3 py-3">
        <input
          className="w-52 rounded-xl border border-slate-300 px-3 py-2 text-base"
          value={line.remark}
          onChange={(e) => onChangeLineField(line.id, "remark", e.target.value)}
          placeholder="行备注"
        />
      </td>

      <td className="px-3 py-3 text-right font-mono text-slate-800">
        {qtyBaseHint !== null && grossAmount > 0 ? netAmount.toFixed(2) : "-"}
      </td>

      <td className="px-3 py-3">
        <button
          type="button"
          onClick={() => onRemoveLine(line.id)}
          className="text-base text-red-600 hover:underline disabled:opacity-40"
          disabled={!canRemove}
        >
          删除
        </button>
      </td>
    </tr>
  );
};
