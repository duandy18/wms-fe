// src/features/admin/shipping-providers/scheme/brackets/TemplateWorkbenchSelectBar.tsx
import React from "react";
import type { SegmentTemplateOut, SchemeWeightSegment } from "./segmentTemplates";
import { UI } from "../ui";

function displayName(name: string): string {
  return String(name ?? "")
    .replace(/表头模板/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export const TemplateWorkbenchSelectBar: React.FC<{
  disabled: boolean;
  templates: SegmentTemplateOut[];
  selectedTemplateId: number | null;
  onSelectTemplateId: (id: number | null) => void;
  onCreateDraft: () => void;
  mirrorSegmentsJson: SchemeWeightSegment[] | null;

  // 右侧操作区（保存 / 启用）
  rightSlot?: React.ReactNode;
}> = ({ disabled, templates, selectedTemplateId, onSelectTemplateId, onCreateDraft, rightSlot }) => {
  return (
    <>
      <div className={UI.sectionTitle}>重量段方案管理</div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={UI.btnNeutral}
            disabled={disabled}
            onClick={onCreateDraft}
          >
            新建方案
          </button>

          <select
            className={`${UI.selectBase} min-w-[360px]`}
            disabled={disabled}
            value={selectedTemplateId ?? ""}
            onChange={(e) => onSelectTemplateId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">
              {templates.length ? "选择一个方案…" : "暂无方案（请先新建）"}
            </option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.is_active ? "★ 当前生效 · " : ""}
                {displayName(t.name ?? "")}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          {rightSlot ?? null}
        </div>
      </div>
    </>
  );
};

export default TemplateWorkbenchSelectBar;
