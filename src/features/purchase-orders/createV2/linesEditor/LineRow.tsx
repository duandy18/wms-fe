// src/features/purchase-orders/createV2/linesEditor/LineRow.tsx
//
// 终态 PO Create 行编辑：
// - 输入单位：uom_id（来自 item_uoms）
// - 输入数量：qty_input
// - qty_base 由后端推导

import React, { useEffect, useMemo } from "react";
import type { ItemBasic } from "../../../../master-data/itemsApi";
import type { ItemUom } from "../../../../master-data/itemUomsApi";
import type { LineDraft } from "../../usePurchaseOrderCreatePresenter";
import { calcEstAmount } from "./calc";

export type PurchaseOrderLineRowProps = {
  line: LineDraft;
  idx: number;

  items: ItemBasic[];
  itemsLoading: boolean;

  selectedItem: ItemBasic | undefined;

  uomsForSelectedItem: ItemUom[];
  uomsLoading?: boolean;

  onChangeLineField: (lineId: number, field: keyof LineDraft, value: string) => void;
  onSelectItem: (lineId: number, itemId: number | null) => void;
  onRemoveLine: (lineId: number) => void;

  canRemove: boolean;
};

export const PurchaseOrderCreateLineRow: React.FC<PurchaseOrderLineRowProps> = ({
  line,
  idx,
  items,
  itemsLoading,
  selectedItem,
  uomsForSelectedItem,
  uomsLoading,
  onChangeLineField,
  onSelectItem,
  onRemoveLine,
  canRemove,
}) => {
  const selectedItemId = line.item_id ? Number(line.item_id) : null;

  const brandText = selectedItem?.brand_name?.trim() ? selectedItem.brand_name : "—";
  const categoryText = selectedItem?.category_name?.trim() ? selectedItem.category_name : "—";
  const barcodeText = selectedItem?.main_barcode?.trim() ? selectedItem.main_barcode : "—";

  const uomIdValue = (line.uom_id ?? "").trim();

  // 默认选择：purchase_default → base → first
  useEffect(() => {
    if (!selectedItemId || uomIdValue) return;
    if (!uomsForSelectedItem || uomsForSelectedItem.length === 0) return;

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

  const qtyInputRaw = (line.qty_input ?? "").trim();
  const qtyInputNum = qtyInputRaw ? Number(qtyInputRaw) : NaN;

  const qtyBaseHint =
    Number.isFinite(qtyInputNum) && qtyInputNum > 0
      ? Math.trunc(qtyInputNum) * Math.trunc(ratioToBaseHint)
      : null;

  const estAmount = calcEstAmount({ qtyBase: qtyBaseHint, supplyPrice: line.supply_price });

  const uomSelectDisabled = itemsLoading || !selectedItemId || Boolean(uomsLoading);

  return (
    <tr className="border-b border-slate-100">
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
            const brand = it.brand_name?.trim() ? it.brand_name : "—";
            const cat = it.category_name?.trim() ? it.category_name : "—";
            const bc = it.main_barcode?.trim() ? it.main_barcode : "—";
            const spec = it.spec ? ` ｜ ${it.spec}` : "";
            const label = `[${it.id}] ${it.name}${spec} · ${brand} · ${cat} · ${bc}`;
            return (
              <option key={it.id} value={it.id}>
                {label}
              </option>
            );
          })}
        </select>
      </td>

      <td className="px-3 py-3">
        <input
          className="w-56 rounded-xl border border-slate-300 px-3 py-2 text-base"
          value={line.item_name}
          onChange={(e) => onChangeLineField(line.id, "item_name", e.target.value)}
          placeholder="商品名称（供货商单据）"
        />
      </td>

      <td className="px-3 py-3 text-slate-700">{brandText}</td>
      <td className="px-3 py-3 text-slate-700">{categoryText}</td>

      <td className="px-3 py-3">
        <input
          className="w-44 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono text-slate-700"
          value={barcodeText}
          readOnly
        />
      </td>

      <td className="px-3 py-3">
        <input
          className="w-48 rounded-xl border border-slate-300 px-3 py-2 text-base"
          value={line.spec_text}
          onChange={(e) => onChangeLineField(line.id, "spec_text", e.target.value)}
          placeholder="如 1.5kg*8入"
        />
      </td>

      {/* 输入单位 */}
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

      {/* 数量 */}
      <td className="px-3 py-3 text-right">
        <input
          className="w-28 rounded-xl border border-slate-300 px-3 py-2 text-right text-base"
          value={line.qty_input}
          onChange={(e) => onChangeLineField(line.id, "qty_input", e.target.value)}
          placeholder="数量"
          inputMode="numeric"
        />
      </td>

      {/* 预计 base */}
      <td className="px-3 py-3 text-right">
        <div className="text-slate-900 font-mono">{qtyBaseHint ?? "-"}</div>
        <div className="text-[11px] text-slate-500">
          提示：后端按倍率推导{selectedUom ? `（×${selectedUom.ratio_to_base}）` : ""}
        </div>
      </td>

      <td className="px-3 py-3 text-right">
        <input
          className="w-32 rounded-xl border border-slate-300 px-3 py-2 text-right text-base"
          value={line.supply_price}
          onChange={(e) => onChangeLineField(line.id, "supply_price", e.target.value)}
          placeholder="每最小单位单价"
        />
      </td>

      <td className="px-3 py-3 text-right text-slate-800">
        {qtyBaseHint !== null && estAmount > 0 ? estAmount.toFixed(2) : "-"}
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
