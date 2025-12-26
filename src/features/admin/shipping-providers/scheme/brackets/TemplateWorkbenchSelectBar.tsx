// src/features/admin/shipping-providers/scheme/brackets/TemplateWorkbenchSelectBar.tsx
import React, { useMemo } from "react";
import type { SegmentTemplateOut, SchemeWeightSegment } from "../../api/types";
import UI from "../ui";

function humanStatus(status: string): string {
  if (status === "draft") return "草稿";
  if (status === "published") return "已发布";
  if (status === "archived") return "已归档";
  return status;
}

export const TemplateWorkbenchSelectBar: React.FC<{
  disabled: boolean;
  templates: SegmentTemplateOut[];
  selectedTemplateId: number | null;
  onSelectTemplateId: (id: number | null) => void;
  onCreateDraft: () => void;
  mirrorSegmentsJson: SchemeWeightSegment[] | null;
}> = ({ disabled, templates, selectedTemplateId, onSelectTemplateId, onCreateDraft, mirrorSegmentsJson }) => {
  const mirrorCount = useMemo(
    () => (Array.isArray(mirrorSegmentsJson) ? mirrorSegmentsJson.length : 0),
    [mirrorSegmentsJson],
  );

  return (
    <>
      <div className={UI.sectionTitle}>需要调整重量段吗？</div>
      <div className={UI.panelHint}>当前规则会持续生效，直到你发布并启用一个新的调整方案（模板版本）。</div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" className={UI.btnNeutral} disabled={disabled} onClick={onCreateDraft}>
          新建调整方案（草稿）
        </button>

        <select
          className={UI.selectBase}
          disabled={disabled}
          value={selectedTemplateId ?? ""}
          onChange={(e) => onSelectTemplateId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">选择一个方案版本…</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.is_active ? "★ 当前生效 · " : ""}
              {t.name}（{humanStatus(String(t.status))}）
            </option>
          ))}
        </select>

        <div className="ml-auto text-xs text-slate-500">镜像 segments_json：{mirrorCount ? `${mirrorCount} 段` : "—"}</div>
      </div>
    </>
  );
};

export default TemplateWorkbenchSelectBar;
