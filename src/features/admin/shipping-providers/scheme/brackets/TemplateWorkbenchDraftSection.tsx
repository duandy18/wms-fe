// src/features/admin/shipping-providers/scheme/brackets/TemplateWorkbenchDraftSection.tsx
import React from "react";
import type { WeightSegment } from "./PricingRuleEditor";
import PricingRuleEditor from "./PricingRuleEditor";
import { UI } from "../ui";

export const TemplateWorkbenchDraftSection: React.FC<{
  disabled: boolean;
  schemeId: number;
  draftSegments: WeightSegment[];
  setDraftSegments: React.Dispatch<React.SetStateAction<WeightSegment[]>>;
  onSaveDraft: () => void;

  // ✅ 传入 dirty，用于：上方保存成功后自动锁定编辑器
  dirty: boolean;
}> = ({ disabled, schemeId, draftSegments, setDraftSegments, dirty }) => {
  return (
    <div className="mt-4">
      <div className={UI.panelHint}>
        方案编辑区：修改/新增/删除 →（在上方点击）保存方案 → 设为生效版本。
      </div>

      <div className={`mt-2 ${disabled ? "opacity-70 pointer-events-none" : ""}`}>
        <PricingRuleEditor
          schemeId={schemeId}
          value={draftSegments}
          onChange={(next) => setDraftSegments(next)}
          dirty={dirty}
          mode="always"
        />
      </div>
    </div>
  );
};

export default TemplateWorkbenchDraftSection;
