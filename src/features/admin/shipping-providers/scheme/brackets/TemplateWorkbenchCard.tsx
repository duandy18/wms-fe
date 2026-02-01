// src/features/admin/shipping-providers/scheme/brackets/TemplateWorkbenchCard.tsx
//
// 右侧编辑区：重量段结构 + 保存（不负责方案选择/创建）
//
// ✅ 本轮裁决：
// - 未使用：允许改结构（draft / published 都可）
// - 使用中：不可改结构（前端禁用 + 后端 409 护栏）
// - 归档：只读
// - 草稿“保存”仍保持现状：保存为版本（draft → published）
// - 已保存（published）未使用：允许保存修改（PUT items）

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

function isArchivedTemplate(t: SegmentTemplateOut | null): boolean {
  return !!t && String(t.status ?? "") === "archived";
}
function isDraftTemplate(t: SegmentTemplateOut | null): boolean {
  return !!t && String(t.status ?? "") === "draft";
}
function isPublishedTemplate(t: SegmentTemplateOut | null): boolean {
  return !!t && String(t.status ?? "") === "published";
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

  // ✅ 草稿保存为版本（draft → published）
  onSaveDraftAsVersion: () => Promise<void>;

  // ✅ 保存结构（draft/published 未使用时都可以调用）
  onSaveTemplateItems: (templateId: number, segs: WeightSegment[]) => Promise<void>;

  // ✅ 使用事实：引用该模板的 Zone 数量
  inUseCount: number;

  // ✅ 上层成功提示（用于顶栏绿条）
  onOk?: (msg: string) => void;
  onError?: (msg: string) => void;
}> = ({
  schemeId,
  disabled,
  selectedTemplate,
  draftSegments,
  setDraftSegments,
  onSaveDraftAsVersion,
  onSaveTemplateItems,
  inUseCount,
  onOk,
  onError,
}) => {
  const [dirty, setDirty] = useState(false);
  const lastSavedKeyRef = useRef<string>(stableKey(draftSegments));
  const lastTplIdRef = useRef<number | null>(null);

  const isDraft = isDraftTemplate(selectedTemplate);
  const isPublished = isPublishedTemplate(selectedTemplate);
  const isArchived = isArchivedTemplate(selectedTemplate);

  // ✅ 可编辑规则：未使用 且 未归档
  const lockedByInUse = selectedTemplate != null && inUseCount > 0;
  const editable = !!selectedTemplate && !isArchived && !lockedByInUse;

  useEffect(() => {
    const tplId = selectedTemplate?.id ?? null;
    if (tplId !== lastTplIdRef.current) {
      lastTplIdRef.current = tplId;

      // 当切换模板时：
      // - 若该模板可编辑（未使用/未归档）：把当前结构加载进 draftSegments 作为编辑态
      // - 若不可编辑：仅用于只读展示
      if (selectedTemplate && !lockedByInUse && !isArchived) {
        const next = isDraft ? draftSegments : templateItemsToWeightSegments(selectedTemplate.items ?? []);
        // 对于 published：用模板当前 items 初始化可编辑结构
        if (!isDraft) {
          setDraftSegments(next);
        }
        lastSavedKeyRef.current = stableKey(next);
        setDirty(false);
      } else {
        lastSavedKeyRef.current = stableKey(draftSegments);
        setDirty(false);
      }
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
    if (isArchived) return;
    if (lockedByInUse) return;

    if (isDraft) {
      // ✅ 维持现有语义：草稿保存为版本（draft → published）
      await onSaveDraftAsVersion();
      lastSavedKeyRef.current = stableKey(draftSegments);
      setDirty(false);
      onOk?.("已保存为版本");
      return;
    }

    // published 未使用：允许保存修改（PUT items）
    if (isPublished) {
      await onSaveTemplateItems(selectedTemplate.id, draftSegments);
      lastSavedKeyRef.current = stableKey(draftSegments);
      setDirty(false);
      onOk?.("已保存修改");
    }
  }

  const title = useMemo(() => (selectedTemplate ? displayName(selectedTemplate.name ?? "") : ""), [selectedTemplate]);

  // 展示用 segments：
  // - 可编辑：永远用 draftSegments（编辑态）
  // - 不可编辑：用模板 items 转换出来的只读视图
  const viewSegments: WeightSegment[] = useMemo(() => {
    if (!selectedTemplate) return [];
    if (editable) return draftSegments;
    return templateItemsToWeightSegments(selectedTemplate.items ?? []);
  }, [selectedTemplate, editable, draftSegments]);

  const dirtyBadge =
    editable && selectedTemplate ? (
      dirty ? (
        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
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
    ) : lockedByInUse ? (
      <div className="mt-1 text-xs text-emerald-800">
        该模板已被 <span className="font-mono">{inUseCount}</span> 个区域使用。为避免线上结构漂移，已锁定重量段结构；如需调整，请新建模板并切换区域绑定。
      </div>
    ) : isPublished ? (
      <div className="mt-1 text-xs text-slate-500">该方案为已保存版本（未使用时允许修改；使用后将自动锁定结构）。</div>
    ) : null;

  const saveBtnText = !selectedTemplate
    ? "保存"
    : isDraft
      ? "保存为版本"
      : isPublished
        ? "保存修改"
        : "保存";

  const saveBtnTitle = !selectedTemplate
    ? "请先选择一个方案"
    : isArchived
      ? "已归档方案不可保存"
      : lockedByInUse
        ? "使用中模板已锁定结构"
        : isDraft
          ? "保存为版本（草稿 → 已保存）"
          : "保存修改（未使用版本可改）";

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
              disabled={disabled || !selectedTemplate || isArchived || lockedByInUse}
              onClick={() => void handleSave()}
              title={saveBtnTitle}
            >
              {saveBtnText}
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

        {!lockedByInUse && isPublished && !editable && selectedTemplate ? (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
            提示：若该模板被区域绑定后，将自动进入“使用中锁定”状态，禁止再修改结构。
          </div>
        ) : null}

        {!selectedTemplate && onError ? (
          <div className="mt-3 text-xs text-slate-500">新建方案请在左侧点击「新建方案」，并输入名称。</div>
        ) : null}
      </div>
    </div>
  );
};

export default TemplateWorkbenchCard;
