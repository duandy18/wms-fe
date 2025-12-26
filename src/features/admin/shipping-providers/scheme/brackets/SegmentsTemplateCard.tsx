// src/features/admin/shipping-providers/scheme/brackets/SegmentsTemplateCard.tsx
//
// 重量段模板卡：让“模板”从黑箱按钮变成可视、可理解、可应用的卡片
// - 目前仅提供：系统默认模板
// - 后续可扩展：从当前方案保存为模板 / 自定义模板库

import React, { useMemo } from "react";
import type { WeightSegment } from "./PricingRuleEditor";
import { getDefaultSegmentsTemplate } from "./segmentsTemplate";
import UI from "../ui";

function segLabel(min: string, max: string): string {
  const mn = (min ?? "").trim();
  const mx = (max ?? "").trim();
  if (!mx) return `w > ${mn}`;
  return `${mn} < w ≤ ${mx}`;
}

export const SegmentsTemplateCard: React.FC<{
  disabled: boolean;
  currentSegments: WeightSegment[];
  onApply: (tpl: WeightSegment[]) => void;
}> = ({ disabled, currentSegments, onApply }) => {
  const defaultTpl = useMemo(() => getDefaultSegmentsTemplate(), []);
  const currentKey = useMemo(() => JSON.stringify(currentSegments ?? []), [currentSegments]);
  const defaultKey = useMemo(() => JSON.stringify(defaultTpl ?? []), [defaultTpl]);

  const isSameAsDefault = currentKey === defaultKey;

  return (
    <div className={UI.cardSoft}>
      <div className={UI.sectionTitle}>重量段模板</div>
      <div className={UI.panelHint}>模板是“列结构的来源”。应用模板会覆盖当前表头结构（需要你确认）。</div>

      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">系统默认模板</div>
            <div className="mt-1 text-xs text-slate-500">
              用于快速起步；后续你可以在“编辑表头”里按合同细化。
            </div>
          </div>

          <button
            type="button"
            className={UI.btnNeutral}
            disabled={disabled || isSameAsDefault}
            onClick={() => {
              const ok = window.confirm(
                "确定要应用「系统默认模板」吗？\n\n该操作会覆盖当前表头结构，并影响后续录价列。",
              );
              if (!ok) return;
              onApply(defaultTpl);
            }}
            title={isSameAsDefault ? "当前表头已与默认模板一致" : "应用模板会覆盖当前表头结构"}
          >
            {isSameAsDefault ? "已是默认模板" : "应用为当前表头"}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {defaultTpl.map((s, idx) => (
            <span key={`${idx}-${s.min}-${s.max}`} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-mono text-slate-700">
              {segLabel(s.min, s.max)}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-2 text-xs text-slate-500">
        后续扩展（不在本轮强做）：保存当前表头为自定义模板、模板库管理。
      </div>
    </div>
  );
};

export default SegmentsTemplateCard;
