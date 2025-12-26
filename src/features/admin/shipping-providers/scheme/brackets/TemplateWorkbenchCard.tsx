// src/features/admin/shipping-providers/scheme/brackets/TemplateWorkbenchCard.tsx
//
// 单卡流程：需要调整重量段吗？ → 选模板 → 草稿编辑 → 保存/应用
// ✅ 新规则：
// - 新建方案后自动带几行（复制当前镜像；无镜像则默认 3 行）
// - 草稿编辑区只保留一个新增入口：追加一行
// - 草稿编辑器不需要“编辑/退出编辑”，直接可填 max
// - UI 层面移除“发布”按钮：用户只理解“保存草稿”和“应用”

import React, { useEffect, useRef, useState } from "react";
import type { SegmentTemplateOut, SchemeWeightSegment } from "../../api/types";
import type { WeightSegment } from "./PricingRuleEditor";
import UI from "../ui";

import TemplateWorkbenchSelectBar from "./TemplateWorkbenchSelectBar";
import TemplateWorkbenchMetaBar from "./TemplateWorkbenchMetaBar";
import TemplateWorkbenchDraftSection from "./TemplateWorkbenchDraftSection";

function stableKey(segs: WeightSegment[]): string {
  return JSON.stringify(segs ?? []);
}

export const TemplateWorkbenchCard: React.FC<{
  schemeId: number;
  disabled: boolean;

  templates: SegmentTemplateOut[];
  selectedTemplateId: number | null;
  setSelectedTemplateId: (id: number | null) => void;

  selectedTemplate: SegmentTemplateOut | null;

  draftSegments: WeightSegment[];
  setDraftSegments: React.Dispatch<React.SetStateAction<WeightSegment[]>>;

  onCreateDraft: () => void;
  onSaveDraft: () => Promise<void>;
  onActivateTemplate: () => void;

  mirrorSegmentsJson: SchemeWeightSegment[] | null;
}> = ({
  schemeId,
  disabled,
  templates,
  selectedTemplateId,
  setSelectedTemplateId,
  selectedTemplate,
  draftSegments,
  setDraftSegments,
  onCreateDraft,
  onSaveDraft,
  onActivateTemplate,
  mirrorSegmentsJson,
}) => {
  // dirty：草稿是否有未保存改动（只对 draft 模板生效）
  const [dirty, setDirty] = useState(false);
  const lastSavedKeyRef = useRef<string>(stableKey(draftSegments));
  const lastTplIdRef = useRef<number | null>(null);

  const tplStatus = selectedTemplate?.status ? String(selectedTemplate.status) : "";
  const isDraft = tplStatus === "draft";

  // 切模板 → 重置 dirty 基线
  useEffect(() => {
    const tplId = selectedTemplate?.id ?? null;
    if (tplId !== lastTplIdRef.current) {
      lastTplIdRef.current = tplId;
      lastSavedKeyRef.current = stableKey(draftSegments);
      setDirty(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate?.id]);

  // 草稿变化 → dirty=true
  useEffect(() => {
    if (!isDraft) {
      setDirty(false);
      return;
    }
    const cur = stableKey(draftSegments);
    if (cur !== lastSavedKeyRef.current) setDirty(true);
  }, [draftSegments, isDraft]);

  async function saveDraftAndMarkClean() {
    if (disabled) return;
    await onSaveDraft();
    lastSavedKeyRef.current = stableKey(draftSegments);
    setDirty(false);
  }

  return (
    <div className={UI.cardSoft}>
      <TemplateWorkbenchSelectBar
        disabled={disabled}
        templates={templates}
        selectedTemplateId={selectedTemplateId}
        onSelectTemplateId={setSelectedTemplateId}
        onCreateDraft={onCreateDraft}
        mirrorSegmentsJson={mirrorSegmentsJson}
      />

      {!selectedTemplate ? (
        <div className="mt-3 text-sm text-slate-600">请选择一个重量段文件，或新建草稿。</div>
      ) : (
        <>
          <TemplateWorkbenchMetaBar
            template={selectedTemplate}
            disabled={disabled}
            dirty={dirty}
            onSaveDraft={() => void saveDraftAndMarkClean()}
            onActivateTemplate={onActivateTemplate}
          />

          {isDraft ? (
            <TemplateWorkbenchDraftSection
              disabled={disabled}
              schemeId={schemeId}
              draftSegments={draftSegments}
              setDraftSegments={setDraftSegments}
              onSaveDraft={() => void saveDraftAndMarkClean()}
            />
          ) : null}
        </>
      )}
    </div>
  );
};

export default TemplateWorkbenchCard;
