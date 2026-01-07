// src/features/admin/items/components/edit/ItemShelfLifeSection.tsx

import React from "react";
import type { ItemDraft } from "../ItemEditModal";

export const ItemShelfLifeSection: React.FC<{
  draft: ItemDraft;
  saving: boolean;
  onChangeDraft: (next: ItemDraft) => void;
}> = ({ draft, saving, onChangeDraft }) => {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">有效期</div>
      <select
        className="w-full rounded border px-3 py-2 text-base"
        value={draft.shelf_mode}
        onChange={(e) => {
          const v = e.target.value as "yes" | "no";
          if (v === "no") onChangeDraft({ ...draft, shelf_mode: v, shelf_value: "" });
          else onChangeDraft({ ...draft, shelf_mode: v });
        }}
        disabled={saving}
      >
        <option value="yes">有</option>
        <option value="no">无</option>
      </select>

      {draft.shelf_mode === "yes" ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="text-sm font-medium text-slate-800">默认有效期参数（可选）</div>
          <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              className="rounded border px-3 py-2 text-base font-mono"
              placeholder="例如 18（留空=不设置默认）"
              value={draft.shelf_value}
              onChange={(e) => onChangeDraft({ ...draft, shelf_value: e.target.value })}
              disabled={saving}
            />
            <select
              className="rounded border px-3 py-2 text-base"
              value={draft.shelf_unit}
              onChange={(e) => onChangeDraft({ ...draft, shelf_unit: e.target.value as "MONTH" | "DAY" })}
              disabled={saving || !draft.shelf_value.trim()}
              title={!draft.shelf_value.trim() ? "未填写数值时无需选择单位" : ""}
            >
              <option value="MONTH">月</option>
              <option value="DAY">天</option>
            </select>
            <div className="flex items-center text-[11px] text-slate-500">
              入库时：有生产日期可自动算到期日；也允许直接填到期日。
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ItemShelfLifeSection;
