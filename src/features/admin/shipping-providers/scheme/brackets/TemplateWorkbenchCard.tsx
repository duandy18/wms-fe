// src/features/admin/shipping-providers/scheme/brackets/TemplateWorkbenchCard.tsx
//
// 右侧编辑区：重量段结构 + 保存/启用（不负责方案选择/创建）
// - 保存草稿：draft 且 dirty → PUT items + publish（保存为版本）
// - 启用为当前生效：仅 published 可用（archived 禁止）
// - 成功反馈：绿条提示（不弹窗）

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { SegmentTemplateOut } from "./segmentTemplates";
import type { WeightSegment } from "./PricingRuleEditor";
import PricingRuleEditor from "./PricingRuleEditor";
import { UI } from "../ui";
import { isTemplateActive } from "./segmentTemplates";
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
  if (isTemplateActive(props.t)) {
    return (
      <span className="ml-2 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
        当前生效
      </span>
    );
  }
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
  onActivateTemplate: () => Promise<void>;
}> = ({ schemeId, disabled, selectedTemplate, draftSegments, setDraftSegments, onSaveDraft, onActivateTemplate }) => {
  const [dirty, setDirty] = useState(false);
  const lastSavedKeyRef = useRef<string>(stableKey(draftSegments));
  const lastTplIdRef = useRef<number | null>(null);

  const [okMsg, setOkMsg] = useState<string | null>(null);
  const okTimerRef = useRef<number | null>(null);

  const isActive = isTemplateActive(selectedTemplate ?? undefined);
  const isDraft = isDraftTemplate(selectedTemplate);
  const isPublished = isPublishedTemplate(selectedTemplate);
  const isArchived = isArchivedTemplate(selectedTemplate);

  const editable = isDraft;

  function clearOkMsg() {
    setOkMsg(null);
    if (okTimerRef.current != null) {
      window.clearTimeout(okTimerRef.current);
      okTimerRef.current = null;
    }
  }

  function flashOkMsg(msg: string) {
    clearOkMsg();
    setOkMsg(msg);
    okTimerRef.current = window.setTimeout(() => {
      setOkMsg(null);
      okTimerRef.current = null;
    }, 1800);
  }

  useEffect(() => {
    const tplId = selectedTemplate?.id ?? null;
    if (tplId !== lastTplIdRef.current) {
      lastTplIdRef.current = tplId;
      lastSavedKeyRef.current = stableKey(draftSegments);
      setDirty(false);
      clearOkMsg();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate?.id]);

  useEffect(() => {
    if (!editable) {
      setDirty(false);
      clearOkMsg();
      return;
    }
    const cur = stableKey(draftSegments);
    const nextDirty = cur !== lastSavedKeyRef.current;
    setDirty(nextDirty);
    if (nextDirty) clearOkMsg();
  }, [draftSegments, editable]);

  async function handleSave() {
    if (disabled) return;
    if (!editable) return;
    if (!dirty) return;

    await onSaveDraft();
    lastSavedKeyRef.current = stableKey(draftSegments);
    setDirty(false);
    flashOkMsg("✅ 已保存为版本");
  }

  async function handleActivate() {
    if (disabled) return;
    if (!selectedTemplate) return;
    if (isArchived) return;

    // ✅ 刚性（前端先对齐后端）：仅已保存（published）可启用
    if (!isPublished) return;
    if (isActive) return;

    await onActivateTemplate();
    setDirty(false);
    flashOkMsg("✅ 已启用为当前生效");
  }

  const title = useMemo(() => (selectedTemplate ? displayName(selectedTemplate.name ?? "") : ""), [selectedTemplate]);

  // ✅ 关键：右侧展示的“细节段”不再依赖 draftSegments
  // - 草稿：展示 draftSegments（可编辑）
  // - 非草稿：展示 selectedTemplate.items 转出来的 segments（只读）
  const viewSegments: WeightSegment[] = useMemo(() => {
    if (!selectedTemplate) return [];
    if (isDraft) return draftSegments;
    return templateItemsToWeightSegments(selectedTemplate.items ?? []);
  }, [selectedTemplate, isDraft, draftSegments]);

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
            </div>
            {selectedTemplate ? (
              <div className="mt-1 text-xs text-slate-500">
                方案 ID：<span className="font-mono">{selectedTemplate.id}</span>
              </div>
            ) : (
              <div className="mt-1 text-xs text-slate-500">请在左侧选择一个方案进入查看/编辑。</div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {okMsg ? (
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                {okMsg}
              </span>
            ) : null}

            <button
              type="button"
              className={UI.btnNeutralSm}
              disabled={disabled || !editable || !dirty}
              onClick={() => void handleSave()}
              title={!editable ? "仅草稿方案可保存（保存会发布为版本）" : !dirty ? "无变更无需保存" : "保存为版本（草稿 → 已保存）"}
            >
              保存
            </button>

            <button
              type="button"
              className={UI.btnNeutralSm}
              disabled={disabled || !selectedTemplate || isArchived || isActive || !isPublished}
              onClick={() => void handleActivate()}
              title={
                !selectedTemplate
                  ? "请先选择一个方案"
                  : isArchived
                    ? "已归档方案不可启用"
                    : isActive
                      ? "该方案已是当前生效"
                      : !isPublished
                        ? "请先点击“保存”，将草稿保存为版本后再启用"
                        : "设为当前生效（会整体替换当前线上生效方案）"
              }
            >
              启用为当前生效
            </button>
          </div>
        </div>

        {selectedTemplate ? (
          <div className={`mt-3 ${disabled ? "opacity-70 pointer-events-none" : ""}`}>
            <PricingRuleEditor
              schemeId={schemeId}
              value={viewSegments}
              onChange={(next) => {
                // 只有草稿允许变更；非草稿只是只读展示
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
