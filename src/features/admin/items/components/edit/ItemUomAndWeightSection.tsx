// src/features/admin/items/components/edit/ItemUomAndWeightSection.tsx

import React from "react";
import type { ItemDraft } from "../ItemEditModal";

const COMMON_UOMS = ["袋", "个", "罐", "箱", "瓶"];

function effectiveUom(draft: ItemDraft): string {
  return draft.uom_mode === "preset"
    ? draft.uom_preset.trim()
    : draft.uom_custom.trim();
}

export const ItemUomAndWeightSection: React.FC<{
  draft: ItemDraft;
  saving: boolean;
  onChangeDraft: (next: ItemDraft) => void;
}> = ({ draft, saving, onChangeDraft }) => {
  const uom = effectiveUom(draft);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <div className="text-sm font-medium">单位净重（kg）</div>
        <input
          className="w-full rounded border px-3 py-2 text-base font-mono"
          value={draft.weight_kg}
          onChange={(e) => onChangeDraft({ ...draft, weight_kg: e.target.value })}
          disabled={saving}
          placeholder="可为空"
        />
        <div className="text-[11px] text-slate-500">
          表示 1 个「最小包装单位」的净重（统一用 kg 存储）。
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">最小包装单位</div>
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
            placeholder="输入最小包装单位"
            value={draft.uom_custom}
            onChange={(e) => onChangeDraft({ ...draft, uom_custom: e.target.value })}
            disabled={saving}
          />
        ) : null}

        <div className="text-[11px] text-slate-500">
          系统中库存数量、重量、有效期均以此为最小单位计算。
        </div>
        <div className="text-[11px] text-slate-500">
          当前单位：<span className="font-mono">{uom || "—"}</span>
        </div>
      </div>
    </div>
  );
};

export default ItemUomAndWeightSection;
