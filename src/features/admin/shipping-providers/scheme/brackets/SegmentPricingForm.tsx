// src/features/admin/shipping-providers/scheme/brackets/SegmentPricingForm.tsx
//
// 录价主流程（段级）
// ✅ 主流程：重量段 → 模型 → 区域 → 输入价格 → 保存

import React, { useEffect, useMemo, useState } from "react";
import type { PricingSchemeZone } from "../../api";
import type { SchemeDefaultPricingMode } from "../../api/types";

import type { WeightSegment } from "./PricingRuleEditor";
import type { RowDraft } from "./quoteModel";
import { segLabel } from "./quoteModel";
import { PUI } from "./ui";

import SegmentPricingHeader from "./SegmentPricingHeader";
import SegmentPricingBlockingTips from "./SegmentPricingBlockingTips";
import SegmentPricingSelectors from "./SegmentPricingSelectors";
import SegmentPricingPriceInputs from "./SegmentPricingPriceInputs";

import {
  type CellMode,
  type SegmentOption,
  buildConfirmText,
  buildSegmentOptions,
  makeDraft,
  needsBeforeWriteTips,
} from "./SegmentPricingForm/utils";

export const SegmentPricingForm: React.FC<{
  schemeMode: SchemeDefaultPricingMode; // 仅作为默认值
  segments: WeightSegment[];
  hasSegments: boolean;

  busy: boolean;

  selectableZones: PricingSchemeZone[];
  selectedZoneId: number | null;
  onSelectZone: (zoneId: number | null) => void;

  onSave: (args: { zoneId: number; min: number; max: number | null; draft: RowDraft }) => Promise<void>;
}> = ({ schemeMode, segments, hasSegments, busy, selectableZones, selectedZoneId, onSelectZone, onSave }) => {
  const segmentOptions = useMemo<SegmentOption[]>(() => buildSegmentOptions(segments ?? []), [segments]);

  const [selectedSegKey, setSelectedSegKey] = useState<string>("");
  const selectedSeg = useMemo(
    () => segmentOptions.find((x) => x.key === selectedSegKey) ?? null,
    [segmentOptions, selectedSegKey],
  );

  useEffect(() => {
    if (!segmentOptions.length) return;
    if (selectedSegKey) return;
    setSelectedSegKey(segmentOptions[0].key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segmentOptions.length]);

  const [mode, setMode] = useState<CellMode>(schemeMode);
  useEffect(() => {
    setMode(schemeMode);
  }, [schemeMode]);

  const [draft, setDraft] = useState<RowDraft>(() => makeDraft(schemeMode));
  useEffect(() => {
    setDraft(makeDraft(mode));
  }, [mode]);

  const canWrite = hasSegments && !!selectedZoneId && !!selectedSeg;

  const blockingTips = useMemo(
    () =>
      needsBeforeWriteTips({
        hasSegments,
        selectedZoneId,
        selectedSeg,
      }),
    [hasSegments, selectedZoneId, selectedSeg],
  );

  async function handleSave() {
    if (!canWrite || !selectedZoneId || !selectedSeg) return;

    const zoneName = selectableZones.find((z) => z.id === selectedZoneId)?.name ?? `Zone#${selectedZoneId}`;

    const ok = window.confirm(
      buildConfirmText({
        zoneName,
        seg: selectedSeg.seg,
        mode,
        draft,
      }),
    );
    if (!ok) return;

    await onSave({
      zoneId: selectedZoneId,
      min: selectedSeg.min,
      max: selectedSeg.max,
      draft: { ...draft, mode },
    });

    window.alert(`保存成功：${zoneName} / ${segLabel(selectedSeg.seg)}`);
  }

  return (
    <div className={PUI.card}>
      <SegmentPricingHeader schemeMode={schemeMode} />

      <SegmentPricingBlockingTips tips={blockingTips} />

      <SegmentPricingSelectors
        hasSegments={hasSegments}
        busy={busy}
        segmentOptions={segmentOptions}
        selectedSegKey={selectedSegKey}
        onChangeSegKey={setSelectedSegKey}
        mode={mode}
        onChangeMode={setMode}
        selectableZones={selectableZones}
        selectedZoneId={selectedZoneId}
        onSelectZone={onSelectZone}
      />

      {/* ④ 输入价格 */}
      <div className="mt-3">
        <div className={PUI.formLabel}>④ 输入价格</div>

        <SegmentPricingPriceInputs
          mode={mode}
          draft={draft}
          setDraft={setDraft}
          canWrite={canWrite}
          busy={busy}
          PUI={PUI}
        />

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            className={canWrite && !busy ? PUI.primaryBtn : PUI.primaryBtnDisabled}
            disabled={!canWrite || busy}
            onClick={() => void handleSave()}
            title={
              !hasSegments
                ? "请先维护重量分段"
                : !selectedZoneId
                  ? "请先选择区域分类"
                  : !selectedSeg
                    ? "请先选择重量段"
                    : "保存该段报价"
            }
          >
            保存该重量段报价
          </button>
        </div>
      </div>
    </div>
  );
};

export default SegmentPricingForm;
