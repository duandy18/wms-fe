// src/features/admin/shipping-providers/scheme/brackets/SegmentsPanel.tsx
//
// 重量分段模板工作台（路线 1：draft → publish → activate）
// - 顶部：当前生效重量段
// - 下方：整合卡（选择文件 + 编辑草稿 + 保存/启用）

import React from "react";
import type { PricingSchemeDetail } from "../../api";
import type { SchemeWeightSegment } from "../../api/types";
import UI from "../ui";

import ActiveTemplateCard from "./ActiveTemplateCard";
import TemplateWorkbenchCard from "./TemplateWorkbenchCard";
import { useSegmentTemplateWorkbench } from "./useSegmentTemplateWorkbench";

export const SegmentsPanel: React.FC<{
  detail: PricingSchemeDetail;
  disabled?: boolean;
  onError?: (msg: string) => void;
}> = ({ detail, disabled, onError }) => {
  const schemeId = detail.id;
  const mirror: SchemeWeightSegment[] | null = detail.segments_json ?? null;

  const w = useSegmentTemplateWorkbench({
    schemeId,
    mirrorSegmentsJson: mirror,
    disabled,
    onError,
  });

  return (
    <div className="space-y-3">
      {w.err ? <div className={UI.surchargeValidationError}>{w.err}</div> : null}

      <ActiveTemplateCard
        template={w.activeTemplate}
        disabled={!!disabled || w.busy}
        onToggleItem={(it) => void w.actions.toggleActiveItem(it)}
      />

      <TemplateWorkbenchCard
        schemeId={schemeId}
        disabled={!!disabled || w.busy}
        templates={w.templates}
        selectedTemplateId={w.selectedTemplateId}
        setSelectedTemplateId={w.setSelectedTemplateId}
        selectedTemplate={w.selectedTemplate}
        draftSegments={w.draftSegments}
        setDraftSegments={w.setDraftSegments}
        onCreateDraft={() => void w.actions.createDraftTemplate()}
        onSaveDraft={w.actions.saveDraftItems}
        onActivateTemplate={() => void w.actions.activateTemplate()}
        mirrorSegmentsJson={mirror}
      />
    </div>
  );
};

export default SegmentsPanel;
