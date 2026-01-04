// src/features/admin/shipping-providers/scheme/brackets/TemplateWorkbenchCard.tsx
//
// 人类流程版：选择/新建方案名 → 编辑 → 保存 → 决定是否启用
// - 去掉解释型文案（避免噪音）
// - 保存/启用分开
// - 格式打磨：标题层级、badge、密度、对齐

import React, { useEffect, useRef, useState } from "react";
import type { SegmentTemplateOut, SchemeWeightSegment } from "./segmentTemplates";
import type { WeightSegment } from "./PricingRuleEditor";
import PricingRuleEditor from "./PricingRuleEditor";
import { UI } from "../ui";

import TemplateWorkbenchSelectBar from "./TemplateWorkbenchSelectBar";
import { isTemplateActive } from "./segmentTemplates";

function stableKey(segs: WeightSegment[]): string {
  return JSON.stringify(segs ?? []);
}

function isDraftTemplate(t: SegmentTemplateOut | null): boolean {
  if (!t) return false;
  return String(t.status ?? "") === "draft";
}

function displayName(name: string): string {
  return String(name ?? "")
    .replace(/表头模板/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function canEditTemplate(t: SegmentTemplateOut | null): boolean {
  return !!t && isDraftTemplate(t);
}

function ActiveBadge() {
  return (
    <span className="ml-2 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
      当前生效
    </span>
  );
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
  onActivateTemplate: () => Promise<void>;

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
  const [dirty, setDirty] = useState(false);
  const lastSavedKeyRef = useRef<string>(stableKey(draftSegments));
  const lastTplIdRef = useRef<number | null>(null);

  const editable = canEditTemplate(selectedTemplate);
  const isActive = isTemplateActive(selectedTemplate ?? undefined);

  useEffect(() => {
    const tplId = selectedTemplate?.id ?? null;
    if (tplId !== lastTplIdRef.current) {
      lastTplIdRef.current = tplId;
      lastSavedKeyRef.current = stableKey(draftSegments);
      setDirty(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate?.id]);

  useEffect(() => {
    if (!editable) {
      setDirty(false);
      return;
    }
    const cur = stableKey(draftSegments);
    if (cur !== lastSavedKeyRef.current) setDirty(true);
  }, [draftSegments, editable]);

  async function handleSave() {
    if (disabled) return;
    if (!editable) return;
    await onSaveDraft();
    lastSavedKeyRef.current = stableKey(draftSegments);
    setDirty(false);
  }

  async function handleActivate() {
    if (disabled) return;
    if (!selectedTemplate) return;
    if (dirty) {
      window.alert("请先保存。");
      return;
    }
    await onActivateTemplate();
    setDirty(false);
  }

  const titleName = selectedTemplate ? displayName(selectedTemplate.name ?? "") : "";

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

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-[15px] font-semibold text-slate-800">
            重量段结构
            {selectedTemplate ? (
              <span className="ml-2 text-slate-500 font-normal text-sm">
                {titleName}
              </span>
            ) : null}
            {selectedTemplate && isActive ? <ActiveBadge /> : null}
          </div>

          {/* 状态小提示（非解释性文案）：仅在草稿时显示 */}
          {editable ? (
            <span className={dirty ? "text-xs font-semibold text-red-700" : "text-xs font-semibold text-emerald-700"}>
              {dirty ? "未保存" : "已保存"}
            </span>
          ) : null}
        </div>

        <div className={`mt-3 ${disabled ? "opacity-70 pointer-events-none" : ""}`}>
          <PricingRuleEditor
            schemeId={schemeId}
            value={draftSegments}
            onChange={(next) => setDraftSegments(next)}
            mode={editable ? "always" : "locked"}
            dirty={dirty}
          />
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="text-[15px] font-semibold text-slate-800">保存与启用</div>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <button
              type="button"
              className={UI.btnNeutralSm}
              disabled={disabled || !editable || !dirty}
              onClick={() => void handleSave()}
            >
              保存
            </button>
          </div>

          <div className="flex flex-col gap-1 items-end">
            <button
              type="button"
              className={UI.btnNeutralSm}
              disabled={disabled || !selectedTemplate || dirty || !editable}
              onClick={() => void handleActivate()}
            >
              启用为当前生效
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateWorkbenchCard;
