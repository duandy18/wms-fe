// src/features/admin/shipping-providers/scheme/brackets/TemplateWorkbenchSelectBar.tsx
import React from "react";
import type { SegmentTemplateOut, SchemeWeightSegment } from "./segmentTemplates";
import { isTemplateActive } from "./segmentTemplates";
import { UI } from "../ui";

function displayName(name: string): string {
  return String(name ?? "")
    .replace(/表头模板/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function statusLabel(t: SegmentTemplateOut): string {
  const st = String(t.status ?? "");
  if (isTemplateActive(t)) return "当前生效";
  if (st === "draft") return "草稿";
  if (st === "published") return "已保存";
  if (st === "archived") return "已归档";
  return st ? st : "未知";
}

export const TemplateWorkbenchSelectBar: React.FC<{
  disabled: boolean;
  templates: SegmentTemplateOut[];
  selectedTemplateId: number | null;
  onSelectTemplateId: (id: number | null) => void;
  onCreateDraft: () => void;
  mirrorSegmentsJson: SchemeWeightSegment[] | null;
  rightSlot?: React.ReactNode;
}> = ({ disabled, templates, selectedTemplateId, onSelectTemplateId, onCreateDraft, rightSlot }) => {
  return (
    <>
      <div className={`${UI.sectionTitle} text-[15px] font-semibold`}>正在编辑的方案</div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={UI.btnNeutral}
            disabled={disabled}
            onClick={onCreateDraft}
            title="新建一个方案名，然后在下方编辑重量段结构"
          >
            新建方案
          </button>

          <select
            className={`${UI.selectBase} min-w-[460px] text-sm`}
            disabled={disabled}
            value={selectedTemplateId ?? ""}
            onChange={(e) => onSelectTemplateId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">{templates.length ? "请选择一个方案…" : "暂无方案（请先新建）"}</option>

            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {isTemplateActive(t) ? "★ " : ""}
                {displayName(t.name ?? "")}（{statusLabel(t)}）
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center">{rightSlot ?? null}</div>
      </div>
    </>
  );
};

export default TemplateWorkbenchSelectBar;
