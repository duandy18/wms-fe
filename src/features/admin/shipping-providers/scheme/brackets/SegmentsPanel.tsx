// src/features/admin/shipping-providers/scheme/brackets/SegmentsPanel.tsx
//
// 重量分段模板工作台（简化心智版）
// - 左：方案列表（草稿/已保存/已归档）
// - 右：编辑区（重量段结构 + 保存）
//
// ✅ 本轮裁决：
// - 未使用：允许改结构（draft / published 都可）
// - 使用中：不可改结构（前端禁用 + 后端 409 护栏）
// - 归档：只读
// - 不再暴露“可绑定/不可绑定”（is_active）按钮/心智
// - 新建时必须能输入名称（左侧输入框保留）

import React, { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import type { PricingSchemeDetail } from "../../api";

import type { SchemeWeightSegment } from "./segmentTemplates";
import TemplateWorkbenchCard from "./TemplateWorkbenchCard";
import SegmentTemplateListPanel from "./SegmentTemplateListPanel";
import { useSegmentTemplateWorkbench } from "./useSegmentTemplateWorkbench";

import { apiPutTemplateItems } from "./segmentTemplates/api";
import { weightSegmentsToPutItemsDraftPrefix } from "./SegmentsPanel/utils";
import type { WeightSegment } from "./PricingRuleEditor";

function toErrMsg(e: unknown, fallback: string): string {
  if (e instanceof Error) return e.message || fallback;
  return fallback;
}

export const SegmentsPanel: React.FC<{
  detail: PricingSchemeDetail;
  disabled?: boolean;
  onError?: (msg: string) => void;
  onOk?: (msg: string) => void;
}> = ({ detail, disabled, onError, onOk }) => {
  const schemeId = detail.id;

  const location = useLocation();

  // 当前 PricingSchemeDetail 类型中没有 segments_json（并且后端也可能已迁移到模板体系）
  const mirror: SchemeWeightSegment[] | null = null;

  const w = useSegmentTemplateWorkbench({
    schemeId,
    mirrorSegmentsJson: mirror,
    disabled,
    onError,
  });

  // ✅ “强制流程”入口：从 Workbench 的按钮跳转到 /segments#create
  // 这里不强依赖具体按钮 DOM，滚动到左侧列表面板即可
  const createAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (location.hash !== "#create") return;
    if (!createAnchorRef.current) return;

    const id = window.requestAnimationFrame(() => {
      createAnchorRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
      createAnchorRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(id);
    };
  }, [location.hash]);

  // ✅ 事实：模板是否使用中（被任何 Zone 引用）
  const inUseCountByTemplateId = useMemo(() => {
    const m = new Map<number, number>();
    const zones = (detail.zones ?? []) as Array<{ segment_template_id?: number | null }>;
    for (const z of zones) {
      const tid = z.segment_template_id ?? null;
      if (typeof tid !== "number" || !Number.isFinite(tid) || tid <= 0) continue;
      m.set(tid, (m.get(tid) ?? 0) + 1);
    }
    return m;
  }, [detail.zones]);

  const selectedInUseCount = useMemo(() => {
    const tid = w.selectedTemplateId ?? null;
    if (typeof tid !== "number" || tid <= 0) return 0;
    return inUseCountByTemplateId.get(tid) ?? 0;
  }, [inUseCountByTemplateId, w.selectedTemplateId]);

  async function handleSaveTemplateItems(templateId: number, segs: WeightSegment[]) {
    if (disabled || w.busy) return;

    const items = weightSegmentsToPutItemsDraftPrefix(segs);
    if (!items || items.length === 0) {
      onError?.("请先填写至少 1 段有效重量分段（最后一段可留空表示 ∞）。");
      return;
    }

    try {
      await apiPutTemplateItems(templateId, items);
      onOk?.("已保存重量段结构");
      await w.refreshTemplates(w.selectedTemplateId);

      // ✅ 若保存的是当前选中模板：强制触发 detail reload（避免右侧仍显示旧结构）
      if (w.selectedTemplateId === templateId) {
        w.setSelectedTemplateId(null);
        window.requestAnimationFrame(() => {
          w.setSelectedTemplateId(templateId);
        });
      }
    } catch (e: unknown) {
      onError?.(toErrMsg(e, "保存重量段结构失败"));
    }
  }

  return (
    <div className="space-y-3">
      {w.err ? <div className="text-red-600 text-sm">{w.err}</div> : null}

      {/* ✅ 纵向主线页收敛：取消“模板概览”大卡片展示（避免重复与占位）。
          - 状态在左侧列表可见
          - 细节在右侧编辑区可见 */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div ref={createAnchorRef} tabIndex={-1}>
          <SegmentTemplateListPanel
            disabled={!!disabled || w.busy}
            templates={w.templates}
            selectedTemplateId={w.selectedTemplateId}
            onSelectTemplateId={w.setSelectedTemplateId}
            onCreateDraftNamed={(name) => void w.actions.createDraftTemplate(name)}
            onArchiveTemplate={(id) => void w.actions.archiveTemplate(id)}
            onUnarchiveTemplate={(id) => void w.actions.unarchiveTemplate(id)}
            inUseCountByTemplateId={inUseCountByTemplateId}
          />
        </div>

        <TemplateWorkbenchCard
          schemeId={schemeId}
          disabled={!!disabled || w.busy}
          selectedTemplate={w.selectedTemplate}
          draftSegments={w.draftSegments}
          setDraftSegments={w.setDraftSegments}
          onSaveDraftAsVersion={w.actions.saveDraftItems}
          onSaveTemplateItems={handleSaveTemplateItems}
          inUseCount={selectedInUseCount}
          onOk={onOk}
          onError={onError}
        />
      </div>
    </div>
  );
};

export default SegmentsPanel;
