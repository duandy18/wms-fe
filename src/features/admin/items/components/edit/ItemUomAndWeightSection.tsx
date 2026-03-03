// src/features/admin/items/components/edit/ItemUomAndWeightSection.tsx

import React from "react";
import type { ItemDraft } from "../ItemEditModal";

const COMMON_UOMS = ["袋", "个", "罐", "箱", "瓶"];

function effectiveUom(draft: ItemDraft): string {
  return draft.uom_mode === "preset" ? draft.uom_preset.trim() : draft.uom_custom.trim();
}

export const ItemUomAndWeightSection: React.FC<{
  draft: ItemDraft;
  saving: boolean;
  onChangeDraft: (next: ItemDraft) => void;
}> = ({ draft, saving, onChangeDraft }) => {
  void effectiveUom(draft);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <input
          className="w-full rounded border px-3 py-2 text-base font-mono"
          placeholder="单位净重(kg)"
          value={draft.weight_kg}
          onChange={(e) => onChangeDraft({ ...draft, weight_kg: e.target.value })}
          disabled={saving}
        />
      </div>

      <div className="space-y-2">
        <select
          className="w-full rounded border px-3 py-2 text-base"
          value={draft.uom_mode === "preset" ? draft.uom_preset : "__CUSTOM__"}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "__CUSTOM__") onChangeDraft({ ...draft, uom_mode: "custom", uom_custom: "" });
            else onChangeDraft({ ...draft, uom_mode: "preset", uom_preset: v });
          }}
          disabled={saving}
        >
          {COMMON_UOMS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
          <option value="__CUSTOM__">自定义</option>
        </select>

        {draft.uom_mode === "custom" ? (
          <input
            className="w-full rounded border px-3 py-2 text-base"
            placeholder="最小单位（自定义）"
            value={draft.uom_custom}
            onChange={(e) => onChangeDraft({ ...draft, uom_custom: e.target.value })}
            disabled={saving}
          />
        ) : null}

        <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <div className="font-semibold">单位治理提示</div>
          <div className="mt-1">
            终态合同：单位真相在 <span className="font-mono">item_uoms</span> 子表（基准单位 + 采购单位）。
            本弹窗不再提供“包装单位/换算（case_uom/case_ratio）”编辑入口。
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemUomAndWeightSection;
