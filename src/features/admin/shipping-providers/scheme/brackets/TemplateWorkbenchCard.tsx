// src/features/admin/shipping-providers/scheme/brackets/TemplateWorkbenchCard.tsx
//
// 单卡流程：选择方案 → 编辑 → 保存 / 启用（两步走）

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { SegmentTemplateItemOut, SegmentTemplateOut, SchemeWeightSegment } from "../../api/types";
import type { WeightSegment } from "./PricingRuleEditor";
import UI from "../ui";

import TemplateWorkbenchSelectBar from "./TemplateWorkbenchSelectBar";
import TemplateWorkbenchMetaBar from "./TemplateWorkbenchMetaBar";
import TemplateWorkbenchDraftSection from "./TemplateWorkbenchDraftSection";

function stableKey(segs: WeightSegment[]): string {
  return JSON.stringify(segs ?? []);
}

function fmt2(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "";
  const n = Number(String(v).trim());
  if (!Number.isFinite(n)) return String(v);
  return n.toFixed(2);
}

function fmtRange(min: string, max: string | null): string {
  const mn = fmt2(min);
  const mx = max ? fmt2(max) : "";
  if (!mx) return `w ≥ ${mn} kg`;
  return `${mn} ≤ w < ${mx} kg`;
}

function sortItems(items: SegmentTemplateItemOut[]): SegmentTemplateItemOut[] {
  const arr = (items ?? []).slice();
  arr.sort((a, b) => (a.ord ?? 0) - (b.ord ?? 0));
  return arr;
}

export const TemplateWorkbenchCard: React.FC<{
  schemeId: number;
  disabled: boolean;

  templates: SegmentTemplateOut[];
  selectedTemplateId: number | null;
  setSelectedTemplateId: (id: number | null) => void;

  selectedTemplate: SegmentTemplateOut | null;

  draftSegments: WeightSegment[];
  setDraftSegments: React.Dispatch<React.SetStateAction<WeightSegment[]>>;

  onCreateDraft: () => void;
  onSaveDraft: () => Promise<void>;
  onActivateTemplate: () => void;

  mirrorSegmentsJson: SchemeWeightSegment[] | null;
}> = ({
  schemeId,
  disabled,
  templates,
  selectedTemplateId,
  setSelectedTemplateId,
  selectedTemplate,
  draftSegments,
  setDraftSegments,
  onCreateDraft,
  onSaveDraft,
  onActivateTemplate,
  mirrorSegmentsJson,
}) => {
  const [dirty, setDirty] = useState(false);
  const lastSavedKeyRef = useRef<string>(stableKey(draftSegments));
  const lastTplIdRef = useRef<number | null>(null);

  const tplStatus = selectedTemplate?.status ? String(selectedTemplate.status) : "";
  const isDraft = tplStatus === "draft";

  const readonlyItems = useMemo(() => {
    if (!selectedTemplate) return [];
    return sortItems(selectedTemplate.items ?? []);
  }, [selectedTemplate]);

  useEffect(() => {
    const tplId = selectedTemplate?.id ?? null;
    if (tplId !== lastTplIdRef.current) {
      lastTplIdRef.current = tplId;
      lastSavedKeyRef.current = stableKey(draftSegments);
      setDirty(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate?.id]);

  useEffect(() => {
    if (!isDraft) {
      setDirty(false);
      return;
    }
    const cur = stableKey(draftSegments);
    if (cur !== lastSavedKeyRef.current) setDirty(true);
  }, [draftSegments, isDraft]);

  async function saveDraftAndMarkClean() {
    if (disabled) return;
    await onSaveDraft();
    lastSavedKeyRef.current = stableKey(draftSegments);
    setDirty(false);
  }

  return (
    <div className={UI.cardSoft}>
      <TemplateWorkbenchSelectBar
        disabled={disabled}
        templates={templates}
        selectedTemplateId={selectedTemplateId}
        onSelectTemplateId={setSelectedTemplateId}
        onCreateDraft={onCreateDraft}
        mirrorSegmentsJson={mirrorSegmentsJson}
        rightSlot={
          selectedTemplate ? (
            <TemplateWorkbenchMetaBar
              template={selectedTemplate}
              disabled={disabled}
              dirty={dirty}
              onSaveDraft={() => void saveDraftAndMarkClean()}
              onActivateTemplate={onActivateTemplate}
            />
          ) : null
        }
      />

      {!selectedTemplate ? (
        <div className="mt-3 text-base text-slate-600">请选择一个方案，或新建方案。</div>
      ) : isDraft ? (
        <TemplateWorkbenchDraftSection
          disabled={disabled}
          schemeId={schemeId}
          draftSegments={draftSegments}
          setDraftSegments={setDraftSegments}
          onSaveDraft={() => void saveDraftAndMarkClean()}
        />
      ) : (
        <div className="mt-4 overflow-x-auto">
          {readonlyItems.length === 0 ? (
            <div className="text-base text-slate-600">该方案没有段数据。</div>
          ) : (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left text-base font-semibold text-slate-700">
                  <th className="px-3 py-2 w-[240px]">重量段（kg）</th>
                  <th className="px-3 py-2 w-[120px]">使用状态</th>
                  <th className="px-3 py-2 w-[160px]">操作</th>
                </tr>
              </thead>
              <tbody>
                {readonlyItems.map((it) => (
                  <tr key={it.id} className="border-b border-slate-100 text-base">
                    <td className="px-3 py-2 font-mono text-slate-800">{fmtRange(it.min_kg, it.max_kg)}</td>
                    <td className="px-3 py-2">
                      <span className={it.active ? UI.statusOn : UI.statusOff}>{it.active ? "启用" : "已暂停"}</span>
                    </td>
                    <td className="px-3 py-2 text-slate-400">—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default TemplateWorkbenchCard;
