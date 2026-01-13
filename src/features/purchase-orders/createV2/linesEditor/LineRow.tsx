// src/features/purchase-orders/createV2/linesEditor/LineRow.tsx

import React from "react";
import type { ItemBasic } from "../../../../master-data/itemsApi";
import type { LineDraft } from "../../usePurchaseOrderCreatePresenter";
import { calcEstAmount, calcQtyBase } from "./calc";

export type PurchaseOrderLineRowProps = {
  line: LineDraft;
  idx: number;

  items: ItemBasic[];
  itemsLoading: boolean;

  selectedItem: ItemBasic | undefined;

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
  onChangeLineField,
  onSelectItem,
  onRemoveLine,
  canRemove,
}) => {
  const qtyBase = calcQtyBase({ qtyOrdered: line.qty_ordered, unitsPerCase: line.units_per_case });
  const estAmount = calcEstAmount({ qtyBase, supplyPrice: line.supply_price });

  const selectedItemId = line.item_id ? Number(line.item_id) : null;

  const brandText = selectedItem?.brand_name?.trim() ? selectedItem.brand_name : "—";
  const categoryText = selectedItem?.category_name?.trim() ? selectedItem.category_name : "—";
  const barcodeText = selectedItem?.barcode?.trim() ? selectedItem.barcode : "—";

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
            const bc = it.barcode?.trim() ? it.barcode : "—";
            const spec = it.spec ? ` ｜ ${it.spec}` : "";
            const label = `[${it.id}] ${it.name}${spec} · ${brand} · ${cat} · ${bc}`;
            return (
              <option key={it.id} value={it.id}>
                {label}
              </option>
            );
          })}
        </select>

        {line.item_id ? (
          <div className="mt-1 text-sm text-slate-500">系统商品 ID：{line.item_id}</div>
        ) : null}
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

      {/* ✅ 条码（只读，来自主数据） */}
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

      <td className="px-3 py-3">
        <input
          className="w-28 rounded-xl border border-slate-300 px-3 py-2 text-base"
          value={line.base_uom}
          onChange={(e) => onChangeLineField(line.id, "base_uom", e.target.value)}
          placeholder="袋 / 罐 / PCS"
        />
      </td>

      <td className="px-3 py-3">
        <input
          className="w-28 rounded-xl border border-slate-300 px-3 py-2 text-base"
          value={line.purchase_uom}
          onChange={(e) => onChangeLineField(line.id, "purchase_uom", e.target.value)}
          placeholder="件 / 箱 / 托"
        />
      </td>

      <td className="px-3 py-3 text-right">
        <input
          className="w-28 rounded-xl border border-slate-300 px-3 py-2 text-right text-base"
          value={line.units_per_case}
          onChange={(e) => onChangeLineField(line.id, "units_per_case", e.target.value)}
          placeholder="每件包含数量"
        />
      </td>

      <td className="px-3 py-3 text-right">
        <input
          className="w-28 rounded-xl border border-slate-300 px-3 py-2 text-right text-base"
          value={line.qty_ordered}
          onChange={(e) => onChangeLineField(line.id, "qty_ordered", e.target.value)}
          placeholder="件数"
        />
      </td>

      <td className="px-3 py-3 text-right text-slate-900 font-mono">{qtyBase ?? "-"}</td>

      <td className="px-3 py-3 text-right">
        <input
          className="w-32 rounded-xl border border-slate-300 px-3 py-2 text-right text-base"
          value={line.supply_price}
          onChange={(e) => onChangeLineField(line.id, "supply_price", e.target.value)}
          placeholder="每最小单位单价"
        />
      </td>

      <td className="px-3 py-3 text-right text-slate-800">
        {qtyBase !== null && estAmount > 0 ? estAmount.toFixed(2) : "-"}
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
