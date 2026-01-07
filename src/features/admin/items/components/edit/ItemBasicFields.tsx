// src/features/admin/items/components/edit/ItemBasicFields.tsx

import React from "react";
import type { Supplier } from "../../../suppliers/api";
import type { ItemDraft } from "../ItemEditModal";

export const ItemBasicFields: React.FC<{
  draft: ItemDraft;
  saving: boolean;

  suppliers: Supplier[];
  supLoading: boolean;

  onChangeDraft: (next: ItemDraft) => void;
}> = ({ draft, saving, suppliers, supLoading, onChangeDraft }) => {
  return (
    <>
      <div className="space-y-2">
        <div className="text-sm font-medium">商品名称</div>
        <input
          className="w-full rounded border px-3 py-2 text-base"
          value={draft.name}
          onChange={(e) => onChangeDraft({ ...draft, name: e.target.value })}
          disabled={saving}
        />
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">供货商</div>
        <select
          className="w-full rounded border px-3 py-2 text-base"
          value={draft.supplier_id ?? ""}
          onChange={(e) =>
            onChangeDraft({
              ...draft,
              supplier_id: e.target.value ? Number(e.target.value) : null,
            })
          }
          disabled={saving || supLoading}
        >
          <option value="">{supLoading ? "加载中…" : "请选择供货商（必选）"}</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};

export default ItemBasicFields;
