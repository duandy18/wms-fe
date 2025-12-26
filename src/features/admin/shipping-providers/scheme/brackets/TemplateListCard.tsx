// src/features/admin/shipping-providers/scheme/brackets/TemplateListCard.tsx
//
// 模板列表（选择/新建草稿）
// 使用者视角：这是“我要不要调整重量段”的入口，而不是系统列表

import React, { useMemo } from "react";
import type { SegmentTemplateOut, SchemeWeightSegment } from "../../api/types";
import UI from "../ui";

function humanStatus(status: string): string {
  if (status === "draft") return "草稿";
  if (status === "published") return "已发布";
  if (status === "archived") return "已归档";
  return status;
}

export const TemplateListCard: React.FC<{
  templates: SegmentTemplateOut[];
  selectedTemplateId: number | null;
  disabled: boolean;
  onSelectTemplateId: (id: number | null) => void;
  onCreateDraft: () => void;
  mirrorSegmentsJson: SchemeWeightSegment[] | null;
}> = ({ templates, selectedTemplateId, disabled, onSelectTemplateId, onCreateDraft, mirrorSegmentsJson }) => {
  const mirrorCount = useMemo(
    () => (Array.isArray(mirrorSegmentsJson) ? mirrorSegmentsJson.length : 0),
    [mirrorSegmentsJson],
  );

  return (
    <div className={UI.cardSoft}>
      <div className={UI.sectionTitle}>需要调整重量段吗？</div>
      <div className={UI.panelHint}>
        当前规则会持续生效，直到你发布并启用一个新的调整方案（模板版本）。
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" className={UI.btnNeutral} disabled={disabled} onClick={onCreateDraft}>
          新建调整方案（草稿）
        </button>

        <select
          className={UI.selectBase}
          disabled={disabled}
          value={selectedTemplateId ?? ""}
          onChange={(e) => onSelectTemplateId(e.target.value ? Number(e.target.value) : null)}
          title="选择一个方案版本以查看/编辑/发布/启用"
        >
          <option value="">选择一个方案版本…</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.is_active ? "★ 当前生效 · " : ""}
              {t.name}（{humanStatus(String(t.status))}）
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 text-xs text-slate-500">
        当前方案镜像 segments_json：{mirrorCount ? `${mirrorCount} 段` : "—"}（由“启用模板”同步生成）
      </div>
    </div>
  );
};

export default TemplateListCard;
