// src/features/admin/shipping-providers/scheme/brackets/TemplateWorkbenchDraftSection.tsx
import React, { useMemo } from "react";
import type { WeightSegment } from "./PricingRuleEditor";
import PricingRuleEditor from "./PricingRuleEditor";
import UI from "../ui";

function lastMaxFilled(segs: WeightSegment[]): boolean {
  if (!segs.length) return true;
  const last = segs[segs.length - 1];
  return !!String(last?.max ?? "").trim();
}

export const TemplateWorkbenchDraftSection: React.FC<{
  disabled: boolean;
  schemeId: number;
  draftSegments: WeightSegment[];
  setDraftSegments: React.Dispatch<React.SetStateAction<WeightSegment[]>>;
  onSaveDraft: () => void;
}> = ({ disabled, schemeId, draftSegments, setDraftSegments, onSaveDraft }) => {
  const canAppendRow = useMemo(() => !disabled && lastMaxFilled(draftSegments), [disabled, draftSegments]);

  function appendRow() {
    if (!canAppendRow) {
      window.alert("请先填写当前最后一行的 max。\n\n提示：最后一行 max 留空表示无上限（∞），因此不能再追加后续段。");
      return;
    }
    setDraftSegments((prev) => [...(prev ?? []), { min: "", max: "" }]);
  }

  return (
    <div className="mt-4">
      <div className={UI.panelHint}>
        草稿编辑区（唯一允许修改结构的地方）：按流程“填 max → 保存草稿”。最后一行 max 留空表示无上限（∞）。
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" className={UI.btnNeutralSm} disabled={!canAppendRow} onClick={appendRow}>
          追加一行
        </button>

        <button type="button" className={UI.btnNeutralSm} disabled={disabled} onClick={onSaveDraft}>
          保存草稿
        </button>
      </div>

      <div className={`mt-2 ${disabled ? "opacity-70 pointer-events-none" : ""}`}>
        <PricingRuleEditor
          schemeId={schemeId}
          value={draftSegments}
          onChange={setDraftSegments}
          onSave={async () => {
            if (disabled) return;
            await onSaveDraft();
          }}
          saving={disabled}
          hideAddRow={true}
          mode="draft"
        />
      </div>

      <div className="mt-2 text-xs text-slate-500">
        提示：草稿不会影响当前生效规则；只有“启用模板”才会改变线上表头结构。
      </div>
    </div>
  );
};

export default TemplateWorkbenchDraftSection;
