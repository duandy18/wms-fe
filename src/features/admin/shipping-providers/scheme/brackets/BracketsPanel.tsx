// src/features/admin/shipping-providers/scheme/brackets/BracketsPanel.tsx
//
// 录价页 v1（段级主流程）
// ✅ 主流程：重量段 → 模型 → 区域 → 输入价格 → 保存
// ✅ 复制区域报价：独立卡片（已拆分）
// ✅ 快递公司报价表下沉到底部：作为“核对 + 补录”入口（不抢主流程）

import React, { useMemo } from "react";
import type { PricingSchemeDetail } from "../../api";
import type { SchemeDefaultPricingMode, SchemeWeightSegment, SchemeSegmentOut } from "../../api/types";

import { useBracketsPanelModel } from "./useBracketsPanelModel";

import type { WeightSegment } from "./PricingRuleEditor";

import SegmentPricingForm from "./SegmentPricingForm";
import PricingCopyCard from "./PricingCopyCard";
import PricingAuditTableCard from "./PricingAuditTableCard";

function normalizeNumText(v: string): string {
  const t = String(v ?? "").trim();
  if (!t) return "";
  const n = Number(t);
  if (!Number.isFinite(n)) return t;
  // 用 JS 的数字格式去掉尾随 0（0.000 -> 0, 1.2300 -> 1.23）
  return String(n);
}

function segKey(minText: string, maxText: string): string {
  const mn = normalizeNumText(minText);
  const mx = normalizeNumText(maxText);
  return `${mn}__${mx || "INF"}`;
}

function fromBackendSegments(v?: SchemeWeightSegment[] | null): WeightSegment[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => ({
      min: String(x.min ?? "").trim(),
      max: String(x.max ?? "").trim(),
    }))
    .filter((x) => Boolean(x.min || x.max));
}

export const BracketsPanel: React.FC<{
  detail: PricingSchemeDetail;
  selectedZoneId: number | null;
  onSelectZone: (zoneId: number | null) => void;
}> = ({ detail, selectedZoneId, onSelectZone }) => {
  const schemeMode = useMemo(
    () => ((detail.default_pricing_mode ?? "linear_total") as SchemeDefaultPricingMode),
    [detail.default_pricing_mode],
  );

  // 1) 先拿 segments_json（结构）
  const segmentsAll = useMemo<WeightSegment[]>(
    () => fromBackendSegments(detail.segments_json ?? null),
    [detail.segments_json],
  );

  // 2) 再用段表 segments（含 active）过滤出启用段
  const segments = useMemo<WeightSegment[]>(() => {
    const segRows: SchemeSegmentOut[] = Array.isArray(detail.segments) ? (detail.segments as SchemeSegmentOut[]) : [];

    // 若后端还没返回 segments（兼容旧环境），就不做过滤
    if (!segRows.length) return segmentsAll;

    const activeKeys = new Set<string>();
    for (const s of segRows) {
      if (!s?.active) continue;
      const mn = normalizeNumText(String(s.min_kg ?? ""));
      const mx = s.max_kg == null ? "" : normalizeNumText(String(s.max_kg ?? ""));
      activeKeys.add(`${mn}__${mx || "INF"}`);
    }

    // segments_json 是字符串 min/max（如 "0","1",""），段表是 "0.000"；统一 normalize 后比 key
    return segmentsAll.filter((seg) => activeKeys.has(segKey(seg.min, seg.max)));
  }, [detail.segments, segmentsAll]);

  const hasSegments = segments.length > 0;

  const vm = useBracketsPanelModel({ detail, selectedZoneId, schemeMode, segments });

  return (
    <div className="space-y-4">
      {/* 1) 主流程录价 */}
      <SegmentPricingForm
        schemeMode={schemeMode}
        segments={segments}
        hasSegments={hasSegments}
        busy={vm.busy}
        selectableZones={vm.selectableZones}
        selectedZoneId={selectedZoneId}
        onSelectZone={onSelectZone}
        onSave={async (args) => {
          await vm.upsertCellPrice(args);
        }}
      />

      {/* 2) 复制区域报价（已拆出页面级卡片） */}
      <PricingCopyCard
        schemeId={detail.id}
        zones={vm.zones}
        selectableZones={vm.selectableZones}
        selectedZoneId={selectedZoneId}
        busy={vm.busy}
        onBusy={vm.setBusy}
        onAfterRefreshBrackets={vm.afterRefreshBrackets}
      />

      {/* 3) 最底部：核对 + 补录 */}
      <PricingAuditTableCard
        busy={vm.busy}
        schemeMode={schemeMode}
        segments={segments}
        hasSegments={hasSegments}
        zonesForTable={vm.zonesForTable}
        selectedZoneId={selectedZoneId}
        bracketsByZoneId={vm.bracketsByZoneId}
        draftsByZoneId={vm.draftsByZoneId}
        onUpsertCell={vm.upsertCellPrice}
      />
    </div>
  );
};

export default BracketsPanel;
