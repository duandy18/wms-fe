// src/features/admin/items/components/ItemEditModal.tsx

import React from "react";
import type { Supplier } from "../../suppliers/api";

import { ModalShell } from "./edit/ModalShell";
import { ItemBasicFields } from "./edit/ItemBasicFields";
import { ItemUomAndWeightSection } from "./edit/ItemUomAndWeightSection";
import { ItemShelfLifeSection } from "./edit/ItemShelfLifeSection";
import { ItemStatusSection } from "./edit/ItemStatusSection";
import ItemBarcodesSection from "./edit/ItemBarcodesSection";

export type ItemDraft = {
  name: string;

  // ✅ 规格（items.spec，展示文本）
  spec: string;

  // ✅ 品牌 / 品类（主数据字段）
  brand: string;
  category: string;

  supplier_id: number | null;
  weight_kg: string;

  uom_mode: "preset" | "custom";
  uom_preset: string;
  uom_custom: string;

  shelf_mode: "yes" | "no";
  shelf_value: string;
  shelf_unit: "MONTH" | "DAY";

  enabled: boolean;
};

export const ItemEditModal: React.FC<{
  open: boolean;
  saving: boolean;

  // ✅ 当前编辑的 itemId（用于条码管理区块）
  itemId: number;

  suppliers: Supplier[];
  supLoading: boolean;

  error: string | null;
  supError: string | null;

  draft: ItemDraft;
  onChangeDraft: (next: ItemDraft) => void;

  onClose: () => void;
  onSave: () => void;
}> = ({
  open,
  saving,
  itemId,
  suppliers,
  supLoading,
  error,
  supError,
  draft,
  onChangeDraft,
  onClose,
  onSave,
}) => {
  return (
    <ModalShell open={open} title="编辑商品" saving={saving} onClose={onClose}>
      {(error || supError) ? (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-base text-red-700">
          {error ?? supError}
        </div>
      ) : null}

      <div className="space-y-5">
        <ItemBasicFields
          draft={draft}
          saving={saving}
          suppliers={suppliers}
          supLoading={supLoading}
          onChangeDraft={onChangeDraft}
        />

        <ItemUomAndWeightSection draft={draft} saving={saving} onChangeDraft={onChangeDraft} />

        <ItemShelfLifeSection draft={draft} saving={saving} onChangeDraft={onChangeDraft} />

        <ItemStatusSection draft={draft} saving={saving} onChangeDraft={onChangeDraft} />

        {/* ✅ 合并：条码管理并入主编辑弹窗（仍然走 /item-barcodes，不走 /items） */}
        <ItemBarcodesSection itemId={itemId} disabled={saving} />

        <div className="flex justify-end gap-3">
          <button
            className="rounded border px-4 py-2 text-base"
            onClick={onClose}
            disabled={saving}
            type="button"
          >
            取消
          </button>
          <button
            className="rounded bg-slate-900 px-5 py-2 text-base text-white disabled:opacity-60"
            onClick={onSave}
            disabled={saving}
            type="button"
          >
            {saving ? "保存中…" : "保存"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default ItemEditModal;
