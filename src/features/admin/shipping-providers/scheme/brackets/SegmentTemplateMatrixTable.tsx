// src/features/admin/shipping-providers/scheme/brackets/SegmentTemplateMatrixTable.tsx

import React, { useMemo } from "react";
import QuoteMatrixCard from "./QuoteMatrixCard";

import type { PricingSchemeZone, PricingSchemeZoneBracket } from "../../api";
import type { WeightSegment } from "./PricingRuleEditor";
import type { RowDraft } from "./quoteModel";

import type {
  ZoneBracketsMatrixGroup,
  ZoneBracketsMatrixSegment,
  ZoneBracketsMatrixZone,
  ZoneBracketsMatrixBracket,
} from "./matrix/types";

/**
 * ✅ 职责：
 * - 输入：matrix group（后端事实）
 * - 输出：一张“结构一致”的报价表
 * - 不做任何分组/兜底/推导（groups 已分好）
 *
 * 注意：
 * - QuoteMatrixCard 的展示/编辑复用旧逻辑（单元格编辑仍走 onUpsertCell）
 * - draftsByZoneId 在 QuoteMatrixCard 内已明确“不再用于展示”，这里传空对象
 */

function segToWeightSegment(s: ZoneBracketsMatrixSegment): WeightSegment {
  const minRaw = s.min_kg ?? s.min ?? 0;
  const maxRaw = s.max_kg ?? s.max ?? "";

  const min = typeof minRaw === "number" ? String(minRaw) : String(minRaw ?? "0");
  const max = maxRaw == null ? "" : typeof maxRaw === "number" ? String(maxRaw) : String(maxRaw);

  // WeightSegment 只要求有 min/max（QuoteMatrixCard 用 .trim/.parseNum）
  return { min, max } as WeightSegment;
}

function toPricingSchemeZoneBracket(b: ZoneBracketsMatrixBracket): PricingSchemeZoneBracket {
  return b as unknown as PricingSchemeZoneBracket;
}

function toPricingSchemeZone(z: ZoneBracketsMatrixZone, templateId: number): PricingSchemeZone {
  const brackets = (z.brackets ?? []).map(toPricingSchemeZoneBracket);

  // PricingSchemeZone 在你项目里通常包含 members/brackets/segment_template_id 等字段。
  // 我们提供最小可用结构，满足 QuoteMatrixCard 的展示与编辑。
  return {
    id: z.id,
    name: z.name,
    active: true,
    priority: 0,
    segment_template_id: templateId,
    members: [],
    brackets,
  } as unknown as PricingSchemeZone;
}

export const SegmentTemplateMatrixTable: React.FC<{
  group: ZoneBracketsMatrixGroup;
  busy: boolean;
  selectedZoneId: number | null;
  onUpsertCell: (args: { zoneId: number; min: number; max: number | null; draft: RowDraft }) => Promise<void>;
}> = ({ group, busy, selectedZoneId, onUpsertCell }) => {
  const segments = useMemo<WeightSegment[]>(() => (group.segments ?? []).map(segToWeightSegment), [group.segments]);

  const zonesForTable = useMemo<PricingSchemeZone[]>(() => {
    return (group.zones ?? []).map((z) => toPricingSchemeZone(z as ZoneBracketsMatrixZone, group.segment_template_id));
  }, [group.zones, group.segment_template_id]);

  const bracketsByZoneId = useMemo<Record<number, PricingSchemeZoneBracket[]>>(() => {
    const m: Record<number, PricingSchemeZoneBracket[]> = {};
    for (const z of group.zones ?? []) {
      const zone = z as ZoneBracketsMatrixZone;
      m[zone.id] = (zone.brackets ?? []).map(toPricingSchemeZoneBracket);
    }
    return m;
  }, [group.zones]);

  const draftsByZoneId = useMemo<Record<number, Record<string, RowDraft>>>(() => {
    return {};
  }, []);

  const titleParts = [
    group.template_name ? `模板：${group.template_name}` : `模板#${group.segment_template_id}`,
    group.template_is_active === false ? "（未启用）" : "",
    group.template_status ? `· ${group.template_status}` : "",
  ].filter(Boolean);

  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-slate-900">{titleParts.join(" ")}</div>

      <QuoteMatrixCard
        busy={busy}
        segments={segments}
        zonesForTable={zonesForTable}
        selectedZoneId={selectedZoneId}
        bracketsByZoneId={bracketsByZoneId}
        draftsByZoneId={draftsByZoneId}
        onUpsertCell={onUpsertCell}
      />
    </div>
  );
};

export default SegmentTemplateMatrixTable;
