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
}> = ({ disabled, schemeId, draftSegments, setDraftSegments }) => {
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
      <div className={UI.panelHint}>方案编辑区（唯一允许修改结构的地方）：按流程“填 max →（在上方点击）保存方案 → 启用”。最后一行 max 留空表示无上限（∞）。</div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" className={UI.btnNeutralSm} disabled={!canAppendRow} onClick={appendRow}>
          追加一行
        </button>

        <div className="text-xs text-slate-500">保存入口仅在上方状态栏，避免多处保存造成误解。</div>
      </div>

      <div className={`mt-2 ${disabled ? "opacity-70 pointer-events-none" : ""}`}>
        <PricingRuleEditor
          schemeId={schemeId}
          value={draftSegments}
          onChange={setDraftSegments}
          onSave={async () => {}}
          saving={disabled}
          hideAddRow={true}
          mode="draft"
        />
      </div>

      <div className="mt-2 text-xs text-slate-500">提示：编辑/保存不会影响线上；只有“启用”才会替换当前生效方案。</div>
    </div>
  );
};

export default TemplateWorkbenchDraftSection;
