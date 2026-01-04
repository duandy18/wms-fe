// src/features/admin/shipping-providers/scheme/brackets/TemplateWorkbenchSteps/TemplateWorkbenchStep2EditStructure.tsx
import React from "react";
import type { SegmentTemplateOut } from "../segmentTemplates";
import type { WeightSegment } from "../PricingRuleEditor";
import PricingRuleEditor from "../PricingRuleEditor";
import { UI } from "../../ui";

export const TemplateWorkbenchStep2EditStructure: React.FC<{
  disabled: boolean;
  schemeId: number;

  selectedTemplate: SegmentTemplateOut | null;
  isDraft: boolean;

  draftSegments: WeightSegment[];
  setDraftSegments: React.Dispatch<React.SetStateAction<WeightSegment[]>>;

  onBack: () => void;
  onNext: () => void;
}> = ({ disabled, schemeId, selectedTemplate, isDraft, draftSegments, setDraftSegments, onBack, onNext }) => {
  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Step 2：编辑重量段结构</div>
          <div className="mt-1 text-xs text-slate-500">
            在这里新增/删除/修改重量段。编辑完成后进入下一步保存。
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" className={UI.btnNeutralSm} disabled={disabled} onClick={onBack}>
            返回：选择草稿
          </button>

          <button type="button" className={UI.btnNeutralSm} disabled={disabled || !selectedTemplate || !isDraft} onClick={onNext}>
            下一步：保存并启用
          </button>
        </div>
      </div>

      {!selectedTemplate || !isDraft ? (
        <div className="mt-3 text-base text-slate-600">请先在 Step 1 选择一个草稿方案。</div>
      ) : (
        <div className={`mt-3 ${disabled ? "opacity-70 pointer-events-none" : ""}`}>
          <PricingRuleEditor
            schemeId={schemeId}
            value={draftSegments}
            onChange={(next) => setDraftSegments(next)}
            mode="always"
          />
        </div>
      )}
    </div>
  );
};

export default TemplateWorkbenchStep2EditStructure;
