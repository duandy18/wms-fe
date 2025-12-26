// src/features/admin/items/table/components/ItemsTableView.tsx

import React from "react";
import type { Item } from "../../api";
import type { SupplierBasic } from "../../../../../master-data/suppliersApi";
import type { RowDraft } from "../hooks/useItemsTableModel";
import { UI } from "../ui";
import ItemsRow from "./ItemsRow";

export const ItemsTableView: React.FC<{
  items: Item[];
  selectedItemId: number | null;

  primaryBarcodes: Record<number, string>;
  barcodeCounts: Record<number, number>;

  rowRefs: React.MutableRefObject<Record<number, HTMLTableRowElement | null>>;

  suppliers: SupplierBasic[];
  suppliersLoading: boolean;

  editingId: number | null;
  draft: RowDraft;
  onChangeDraft: (patch: Partial<RowDraft>) => void;

  savingId: number | null;

  onOpenBarcodes: (it: Item) => void;
  onStartEdit: (it: Item) => void;
  onCancelEdit: () => void;
  onSave: (id: number) => void | Promise<void>;
}> = ({
  items,
  selectedItemId,
  primaryBarcodes,
  barcodeCounts,
  rowRefs,
  suppliers,
  suppliersLoading,
  editingId,
  draft,
  onChangeDraft,
  savingId,
  onOpenBarcodes,
  onStartEdit,
  onCancelEdit,
  onSave,
}) => {
  return (
    <div className={UI.wrap}>
      <div className={UI.scroll}>
        <table className={UI.table}>
          <thead className={UI.thead}>
            <tr>
              <th className={UI.th}>ID</th>
              <th className={UI.th}>SKU</th>
              <th className={UI.th}>名称</th>
              <th className={UI.th}>规格</th>
              <th className={UI.th}>单位</th>
              <th className={UI.th}>重量(kg)</th>
              <th className={UI.th}>供应商</th>
              <th className={UI.th}>主条码</th>
              <th className={UI.th}>条码数</th>
              <th className={UI.th}>状态</th>
              <th className={UI.th}>创建时间</th>
              <th className={UI.th}>操作</th>
            </tr>
          </thead>

          <tbody>
            {items.map((it) => {
              const isEditing = editingId === it.id;

              const supplierName = it.supplier_name ?? it.supplier ?? "";
              const primary = primaryBarcodes[it.id] || "-";
              const count = barcodeCounts[it.id] ?? 0;

              return (
                <ItemsRow
                  key={it.id}
                  it={it}
                  isSelected={!!selectedItemId && selectedItemId === it.id}
                  primary={primary}
                  barcodeCount={count}
                  supplierName={supplierName}
                  isEditing={isEditing}
                  suppliers={suppliers}
                  suppliersLoading={suppliersLoading}
                  draft={draft}
                  onChangeDraft={onChangeDraft}
                  saving={savingId === it.id}
                  onOpenBarcodes={() => onOpenBarcodes(it)}
                  onStartEdit={() => onStartEdit(it)}
                  onCancelEdit={onCancelEdit}
                  onSave={() => void onSave(it.id)}
                  rowRef={(el) => {
                    rowRefs.current[it.id] = el;
                  }}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ItemsTableView;
