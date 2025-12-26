// src/features/admin/shipping-providers/scheme/brackets/TemplateDetailCard.tsx
//
// 模板详情（只读 + 动作区）
// - draft：提示“请在草稿编辑器编辑”，动作：保存草稿/发布
// - published：只读展示，动作：启用（若未启用）
// - active/published：只读展示（启用段级开关在 ActiveTemplateCard）

import React, { useMemo } from "react";
import type { SegmentTemplateOut } from "../../api/types";
import UI from "../ui";
import { templateItemsToWeightSegments } from "./SegmentsPanel/utils";

function fmt2(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "";
  const n = Number(String(v).trim());
  if (!Number.isFinite(n)) return String(v);
  return n.toFixed(2);
}

function fmtRange(min: string, max: string): string {
  const mn = fmt2(min);
  const mx = max ? fmt2(max) : "";
  if (!mx) return `w ≥ ${mn}`;
  return `${mn} ≤ w < ${mx}`;
}

export const TemplateDetailCard: React.FC<{
  template: SegmentTemplateOut | null;
  disabled: boolean;

  onSaveDraft: () => void;
  onPublishDraft: () => void;
  onActivateTemplate: () => void;
}> = ({ template, disabled, onSaveDraft, onPublishDraft, onActivateTemplate }) => {
  const readonlySegs = useMemo(() => {
    if (!template) return [];
    return templateItemsToWeightSegments(template.items);
  }, [template]);

  return (
    <div className={UI.cardSoft}>
      <div className={UI.sectionTitle}>模板详情</div>

      {!template ? (
        <div className="mt-3 text-sm text-slate-600">请选择一个模板，或新建草稿模板。</div>
      ) : (
        <>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-slate-800">
              <span className="font-semibold">{template.name}</span>
              <span className="ml-2 text-xs text-slate-500">
                template_id={template.id} / status={template.status} / is_active={String(template.is_active)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {template.status === "draft" ? (
                <>
                  <button type="button" className={UI.btnNeutral} disabled={disabled} onClick={onSaveDraft}>
                    保存草稿
                  </button>
                  <button type="button" className={UI.btnNeutral} disabled={disabled} onClick={onPublishDraft}>
                    发布
                  </button>
                </>
              ) : null}

              {template.status === "published" && !template.is_active ? (
                <button type="button" className={UI.btnNeutral} disabled={disabled} onClick={onActivateTemplate}>
                  启用该模板
                </button>
              ) : null}
            </div>
          </div>

          {template.status === "draft" ? (
            <div className="mt-3">
              <div className={UI.panelHint}>
                草稿可编辑：请在下方「草稿编辑器」修改重量段并保存。发布后结构只读（不允许改 min/max/ord）。
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <div className={UI.panelHint}>
                已发布模板只读（结构不可改）。段级启用/暂停请在「当前启用模板」卡里操作。
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {readonlySegs.map((s, idx) => (
                  <span
                    key={`${idx}-${s.min}-${s.max}`}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-mono text-slate-700"
                  >
                    {fmtRange(s.min, s.max)}
                  </span>
                ))}
              </div>

              <div className="mt-2 text-xs text-slate-500">
                published_at：{template.published_at ?? "—"}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TemplateDetailCard;
