// src/features/admin/items/components/edit/ItemUomAndWeightSection.tsx

import React from "react";
import type { ItemDraft } from "../ItemEditModal";

const COMMON_UOMS = ["袋", "个", "罐", "箱", "瓶"];

function effectiveUom(draft: ItemDraft): string {
  return draft.uom_mode === "preset" ? draft.uom_preset.trim() : draft.uom_custom.trim();
}

function parsePositiveInt(text: string): number | null {
  const t = (text ?? "").trim();
  if (!t) return null;
  if (!/^\d+$/.test(t)) return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  const i = Math.trunc(n);
  if (i < 1) return null;
  return i;
}

export const ItemUomAndWeightSection: React.FC<{
  draft: ItemDraft;
  saving: boolean;
  onChangeDraft: (next: ItemDraft) => void;
}> = ({ draft, saving, onChangeDraft }) => {
  void effectiveUom(draft);

  const ratio = parsePositiveInt(draft.case_ratio);
  const ratioTouched = (draft.case_ratio ?? "").trim().length > 0;
  const ratioInvalid = ratioTouched && ratio === null;

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

        <div className="grid grid-cols-2 gap-4">
          <input
            className="w-full rounded border border-slate-200 px-3 py-2 text-base"
            placeholder="包装单位（可选，默认：箱）"
            value={draft.case_uom}
            onChange={(e) => onChangeDraft({ ...draft, case_uom: e.target.value })}
            disabled={saving}
          />

          <input
            className={[
              "w-full rounded border px-3 py-2 text-base font-mono",
              ratioInvalid ? "border-red-300" : "border-slate-200",
            ].join(" ")}
            placeholder="单位换算（整数，可选，如：12）"
            value={draft.case_ratio}
            onChange={(e) => onChangeDraft({ ...draft, case_ratio: e.target.value })}
            disabled={saving}
            inputMode="numeric"
          />
        </div>

        {ratioTouched && ratioInvalid ? (
          <div className="text-xs text-red-600">请输入 ≥ 1 的整数</div>
        ) : null}
      </div>
    </div>
  );
};

export default ItemUomAndWeightSection;
