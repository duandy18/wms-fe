// src/features/admin/shipping-providers/scheme/brackets/SegmentsPanel.tsx
//
// 重量分段模板工作台（路线：draft → publish → activate）
// - 左：方案列表（草稿/已保存/已归档）
// - 右：编辑区（重量段结构 + 保存/启用）
//
// ✅ 收敛：重量段方案为整体启用/整体不启用
// - 段级启停入口不在主流程暴露（避免交叉与隐性风险）

import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import type { PricingSchemeDetail } from "../../api";

import type { SchemeWeightSegment } from "./segmentTemplates";
import { activateSegmentTemplate, deactivateSegmentTemplate, renameSegmentTemplate } from "./segmentTemplates";
import TemplateWorkbenchCard from "./TemplateWorkbenchCard";
import SegmentTemplateListPanel from "./SegmentTemplateListPanel";
import { useSegmentTemplateWorkbench } from "./useSegmentTemplateWorkbench";

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

  async function handleSetBindable(templateId: number, bindable: boolean) {
    if (disabled || w.busy) return;

    try {
      if (bindable) {
        await activateSegmentTemplate(templateId);
        onOk?.("已加入可绑定区域");
      } else {
        await deactivateSegmentTemplate(templateId);
        onOk?.("已从可绑定区域移除");
      }
      await w.refreshTemplates(w.selectedTemplateId);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : bindable ? "加入可绑定区域失败" : "移除可绑定区域失败";
      onError?.(msg);
    }
  }

  async function handleRenameTemplate(templateId: number, name: string) {
    if (disabled || w.busy) return;

    try {
      await renameSegmentTemplate(templateId, { name });
      onOk?.("已更新方案名称");
      await w.refreshTemplates(w.selectedTemplateId);

      // ✅ 如果改名的是当前选中模板：强制触发 detail reload（避免右侧仍显示旧名）
      if (w.selectedTemplateId === templateId) {
        w.setSelectedTemplateId(null);
        window.requestAnimationFrame(() => {
          w.setSelectedTemplateId(templateId);
        });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "改名失败";
      onError?.(msg);
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
            onSetBindable={(id, b) => void handleSetBindable(id, b)}
            onRenameTemplate={(id, name) => void handleRenameTemplate(id, name)}
            onArchiveTemplate={(id) => void w.actions.archiveTemplate(id)}
            onUnarchiveTemplate={(id) => void w.actions.unarchiveTemplate(id)}
          />
        </div>

        <TemplateWorkbenchCard
          schemeId={schemeId}
          disabled={!!disabled || w.busy}
          selectedTemplate={w.selectedTemplate}
          draftSegments={w.draftSegments}
          setDraftSegments={w.setDraftSegments}
          onSaveDraft={w.actions.saveDraftItems}
          onOk={onOk}
        />
      </div>
    </div>
  );
};

export default SegmentsPanel;
