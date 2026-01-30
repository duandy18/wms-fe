// src/features/admin/shipping-providers/scheme/brackets/TemplateWorkbenchCard.tsx
//
// 右侧编辑区：重量段结构 + 保存（不负责方案选择/创建）
//
// ✅ 收敛（本次改造重点）
// - 重量段方案只保留：草稿 / 已保存 / 已归档
// - 移除“启用/生效”入口与文案：生效语义下沉到“区域绑定模板”步骤
// - 保存：draft -> publish（保存为版本）
// - 成功反馈：通过 onOk 回调，由上层 SuccessBar 显示绿条

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { SegmentTemplateOut } from "./segmentTemplates";
import type { WeightSegment } from "./PricingRuleEditor";
import PricingRuleEditor from "./PricingRuleEditor";
import { UI } from "../ui";
import { templateItemsToWeightSegments } from "./SegmentsPanel/utils";

function stableKey(segs: WeightSegment[]): string {
  return JSON.stringify(segs ?? []);
}

function displayName(name: string): string {
  return String(name ?? "")
    .replace(/表头模板/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isDraftTemplate(t: SegmentTemplateOut | null): boolean {
  return !!t && String(t.status ?? "") === "draft";
}
function isPublishedTemplate(t: SegmentTemplateOut | null): boolean {
  return !!t && String(t.status ?? "") === "published";
}
function isArchivedTemplate(t: SegmentTemplateOut | null): boolean {
  return !!t && String(t.status ?? "") === "archived";
}

function StatusBadge(props: { t: SegmentTemplateOut }) {
  const st = String(props.t.status ?? "");
  if (st === "draft") {
    return (
      <span className="ml-2 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
        草稿
      </span>
    );
  }
  if (st === "published") {
    return (
      <span className="ml-2 inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-600">
        已保存
      </span>
    );
  }
  if (st === "archived") {
    return (
      <span className="ml-2 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-500">
        已归档
      </span>
    );
  }
  return (
    <span className="ml-2 inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-600">
      {st || "未知"}
    </span>
  );
}

export const TemplateWorkbenchCard: React.FC<{
  schemeId: number;
  disabled: boolean;

  selectedTemplate: SegmentTemplateOut | null;

  draftSegments: WeightSegment[];
  setDraftSegments: React.Dispatch<React.SetStateAction<WeightSegment[]>>;

  onSaveDraft: () => Promise<void>;

  // ✅ 上层成功提示（用于顶栏绿条）
  onOk?: (msg: string) => void;
}> = ({ schemeId, disabled, selectedTemplate, draftSegments, setDraftSegments, onSaveDraft, onOk }) => {
  const [dirty, setDirty] = useState(false);
  const lastSavedKeyRef = useRef<string>(stableKey(draftSegments));
  const lastTplIdRef = useRef<number | null>(null);

  const isDraft = isDraftTemplate(selectedTemplate);
  const isPublished = isPublishedTemplate(selectedTemplate);
  const isArchived = isArchivedTemplate(selectedTemplate);

  const editable = isDraft;

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
    setDirty(cur !== lastSavedKeyRef.current);
  }, [draftSegments, editable]);

  async function handleSave() {
    if (disabled) return;
    if (!selectedTemplate) return;

    // ✅ 只允许草稿保存（草稿 -> 已保存）
    if (!editable) return;
    if (isArchived) return;

    // 草稿允许直接保存（不强依赖 dirty）
    await onSaveDraft();
    lastSavedKeyRef.current = stableKey(draftSegments);
    setDirty(false);
    onOk?.("已保存重量段方案");
  }

  const title = useMemo(() => (selectedTemplate ? displayName(selectedTemplate.name ?? "") : ""), [selectedTemplate]);

  // - 草稿：展示 draftSegments（可编辑）
  // - 非草稿：展示 selectedTemplate.items 转出来的 segments（只读）
  const viewSegments: WeightSegment[] = useMemo(() => {
    if (!selectedTemplate) return [];
    if (isDraft) return draftSegments;
    return templateItemsToWeightSegments(selectedTemplate.items ?? []);
  }, [selectedTemplate, isDraft, draftSegments]);

  const dirtyBadge =
    editable && selectedTemplate ? (
      dirty ? (
        <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
          未保存
        </span>
      ) : (
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-600">
          已保存
        </span>
      )
    ) : null;

  const readonlyHint =
    !selectedTemplate ? (
      <div className="mt-1 text-xs text-slate-500">请在左侧选择一个方案进入查看/编辑。</div>
    ) : isArchived ? (
      <div className="mt-1 text-xs text-slate-500">该方案已归档，仅可查看。</div>
    ) : isPublished ? (
      <div className="mt-1 text-xs text-slate-500">该方案已保存为版本。若需修改，请复制/新建草稿再编辑。</div>
    ) : null;

  return (
    <div className={UI.cardSoft}>
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-[15px] font-semibold text-slate-800">
                重量段结构
                {selectedTemplate ? <span className="ml-2 text-slate-500 font-normal text-sm truncate">{title}</span> : null}
                {selectedTemplate ? <StatusBadge t={selectedTemplate} /> : null}
              </div>
              {dirtyBadge}
            </div>

            {selectedTemplate ? (
              <div className="mt-1 text-xs text-slate-500">
                方案 ID：<span className="font-mono">{selectedTemplate.id}</span>
              </div>
            ) : null}
            {readonlyHint}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className={UI.btnNeutralSm}
              disabled={disabled || !editable || !selectedTemplate || isArchived}
              onClick={() => void handleSave()}
              title={
                !selectedTemplate
                  ? "请先选择一个方案"
                  : !editable
                    ? "仅草稿方案可保存（保存会发布为版本）"
                    : isArchived
                      ? "已归档方案不可保存"
                      : "保存为版本（草稿 → 已保存）"
              }
            >
              保存
            </button>
          </div>
        </div>

        {selectedTemplate ? (
          <div className={`mt-3 ${disabled ? "opacity-70 pointer-events-none" : ""}`}>
            <PricingRuleEditor
              schemeId={schemeId}
              value={viewSegments}
              onChange={(next) => {
                if (!editable) return;
                setDraftSegments(next);
              }}
              mode={editable ? "always" : "locked"}
              dirty={dirty}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TemplateWorkbenchCard;
