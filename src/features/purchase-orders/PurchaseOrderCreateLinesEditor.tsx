// src/features/purchase-orders/PurchaseOrderCreateLinesEditor.tsx
// 多行采购明细编辑（大字号 Cockpit 版 + 最小单位 + 数量（最小单位））

import React, { useMemo } from "react";
import type { LineDraft } from "./usePurchaseOrderCreatePresenter";
import type { ItemBasic } from "../../master-data/itemsApi";
import { PurchaseOrderCreateLineRow } from "./createV2/linesEditor/LineRow";
import { PurchaseOrderCreateLinesTableHead } from "./createV2/linesEditor/Columns";
import { PO_CREATE_LINE_COLSPAN } from "./createV2/linesEditor/columns.def";

interface PurchaseOrderCreateLinesEditorProps {
  lines: LineDraft[];
  items: ItemBasic[];
  itemsLoading: boolean;
  onChangeLineField: (lineId: number, field: keyof LineDraft, value: string) => void;
  onSelectItem: (lineId: number, itemId: number | null) => void;
  onAddLine: () => void;
  onRemoveLine: (lineId: number) => void;
}

export const PurchaseOrderCreateLinesEditor: React.FC<PurchaseOrderCreateLinesEditorProps> = ({
  lines,
  items,
  itemsLoading,
  onChangeLineField,
  onSelectItem,
  onAddLine,
  onRemoveLine,
}) => {
  const itemMap = useMemo(() => {
    const m = new Map<number, ItemBasic>();
    for (const it of items) m.set(it.id, it);
    return m;
  }, [items]);

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">行明细（多行编辑）</h2>
        <button
          type="button"
          onClick={onAddLine}
          className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-base font-medium text-slate-800 hover:bg-slate-50"
        >
          + 添加一行
        </button>
      </div>

      <p className="text-base text-slate-600">
        每一行代表一个 SKU 的采购计划：选择系统商品 → 填写规格、最小单位与采购单位 →
        输入订购件数和每件包含的最小单位数量，系统会实时预估行金额并显示按最小单位折算后的数量。
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-base border-collapse">
          <PurchaseOrderCreateLinesTableHead />

          <tbody>
            {lines.length === 0 ? (
              <tr>
                <td
                  colSpan={PO_CREATE_LINE_COLSPAN}
                  className="px-3 py-6 text-center text-base text-slate-400"
                >
                  暂无行，请点击右上角“添加一行”
                </td>
              </tr>
            ) : (
              lines.map((line, idx) => {
                const selectedItemId = line.item_id ? Number(line.item_id) : null;
                const selectedItem =
                  selectedItemId != null ? itemMap.get(selectedItemId) : undefined;

                return (
                  <PurchaseOrderCreateLineRow
                    key={line.id}
                    line={line}
                    idx={idx}
                    items={items}
                    itemsLoading={itemsLoading}
                    selectedItem={selectedItem}
                    onChangeLineField={onChangeLineField}
                    onSelectItem={onSelectItem}
                    onRemoveLine={onRemoveLine}
                    canRemove={lines.length > 1}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
