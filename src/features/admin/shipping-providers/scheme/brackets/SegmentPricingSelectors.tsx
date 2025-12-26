// src/features/admin/shipping-providers/scheme/brackets/SegmentPricingSelectors.tsx
//
// 录价主流程 - ①②③ 选择器（重量段/模型/区域）
// 纯 UI：不做业务判断，只吃 props

import React from "react";
import type { PricingSchemeZone } from "../../api";
import { PUI } from "./ui";
import type { SegmentOption, CellMode } from "./SegmentPricingForm/utils";
import { segLabel } from "./quoteModel";

export const SegmentPricingSelectors: React.FC<{
  // ① segments
  hasSegments: boolean;
  busy: boolean;
  segmentOptions: SegmentOption[];
  selectedSegKey: string;
  onChangeSegKey: (key: string) => void;

  // ② mode
  mode: CellMode;
  onChangeMode: (m: CellMode) => void;

  // ③ zones
  selectableZones: PricingSchemeZone[];
  selectedZoneId: number | null;
  onSelectZone: (zoneId: number | null) => void;
}> = ({
  hasSegments,
  busy,
  segmentOptions,
  selectedSegKey,
  onChangeSegKey,
  mode,
  onChangeMode,
  selectableZones,
  selectedZoneId,
  onSelectZone,
}) => {
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12">
      {/* ① 重量段 */}
      <div className="md:col-span-4">
        <div className={PUI.formLabel}>① 选择重量段</div>
        <select
          className={PUI.formSelectMono}
          value={selectedSegKey}
          disabled={!hasSegments || busy}
          onChange={(e) => onChangeSegKey(e.target.value)}
        >
          {segmentOptions.length === 0 ? <option value="">无可用重量段</option> : null}
          {segmentOptions.map((o) => (
            <option key={o.key} value={o.key}>
              {segLabel(o.seg)}
            </option>
          ))}
        </select>
      </div>

      {/* ② 模型 */}
      <div className="md:col-span-3">
        <div className={PUI.formLabel}>② 选择计价模型</div>
        <select className={PUI.formSelect} value={mode} disabled={busy} onChange={(e) => onChangeMode(e.target.value as CellMode)}>
          <option value="linear_total">票费 + 元/kg</option>
          <option value="step_over">首重 + 续重</option>
          <option value="flat">固定价</option>
          <option value="manual_quote">人工/未设</option>
        </select>
      </div>

      {/* ③ 区域分类 */}
      <div className="md:col-span-5">
        <div className={PUI.formLabel}>③ 选择区域分类</div>
        <select
          className={PUI.formSelect}
          value={selectedZoneId ?? ""}
          disabled={busy}
          onChange={(e) => onSelectZone(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">请选择…</option>
          {selectableZones.map((z) => (
            <option key={z.id} value={z.id}>
              {z.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SegmentPricingSelectors;
