// src/features/admin/shipping-providers/scheme/brackets/SegmentsPanel.tsx
//
// 重量分段模板工作台（路线 1：draft → publish → activate）
// - 顶部：当前生效重量段
// - 下方：整合卡（选择文件 + 编辑草稿 + 保存/启用）

import React from "react";
import type { PricingSchemeDetail } from "../../api";

import type { SchemeWeightSegment } from "./segmentTemplates";
import ActiveTemplateCard from "./ActiveTemplateCard";
import TemplateWorkbenchCard from "./TemplateWorkbenchCard";
import { useSegmentTemplateWorkbench } from "./useSegmentTemplateWorkbench";

export const SegmentsPanel: React.FC<{
  detail: PricingSchemeDetail;
  disabled?: boolean;
  onError?: (msg: string) => void;
}> = ({ detail, disabled, onError }) => {
  const schemeId = detail.id;

  // 当前 PricingSchemeDetail 类型中没有 segments_json（并且后端也可能已迁移到模板体系）
  const mirror: SchemeWeightSegment[] | null = null;

  const w = useSegmentTemplateWorkbench({
    schemeId,
    mirrorSegmentsJson: mirror,
    disabled,
    onError,
  });

  return (
    <div className="space-y-3">
      {w.err ? <div className="text-red-600 text-sm">{w.err}</div> : null}

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
