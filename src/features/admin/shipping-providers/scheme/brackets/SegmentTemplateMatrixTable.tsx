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
 * - QuoteMatrixCard 的展示/编辑复用旧逻辑（只读模式用于综合展示）
 * - draftsByZoneId 在 QuoteMatrixCard 内已明确“不再用于展示”，这里传空对象
 */

function segToWeightSegment(s: ZoneBracketsMatrixSegment): WeightSegment {
  const minRaw = s.min_kg ?? s.min ?? 0
  const maxRaw = s.max_kg ?? s.max ?? ""

  const min = typeof minRaw === "number" ? String(minRaw) : String(minRaw ?? "0")
  const max = maxRaw == null ? "" : typeof maxRaw === "number" ? String(maxRaw) : String(maxRaw)

  return { min, max } as WeightSegment
}

function toPricingSchemeZoneBracket(b: ZoneBracketsMatrixBracket): PricingSchemeZoneBracket {
  return b as unknown as PricingSchemeZoneBracket;
}

function readBool(v: unknown): boolean | null {
  return typeof v === "boolean" ? v : null;
}

function readArr(v: unknown): unknown[] | null {
  return Array.isArray(v) ? v : null;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function readField<T = unknown>(obj: unknown, key: string): T | undefined {
  if (!isRecord(obj)) return undefined;
  return obj[key] as T;
}

function isZoneRenderable(z: ZoneBracketsMatrixZone): boolean {
  const rawActive = readField<unknown>(z, "active");
  const active = readBool(rawActive);
  if (active === false) return false;

  const archivedAt = readField<unknown>(z, "archived_at") ?? readField<unknown>(z, "archivedAt");
  if (typeof archivedAt === "string" && archivedAt.trim()) return false;

  return true;
}

function toPricingSchemeZone(z: ZoneBracketsMatrixZone, templateId: number): PricingSchemeZone {
  const brackets = (z.brackets ?? []).map(toPricingSchemeZoneBracket);

  const rawActive = readField<unknown>(z, "active");
  const active = readBool(rawActive);
  const rawMembers = readField<unknown>(z, "members");
  const members = readArr(rawMembers);

  return {
    id: z.id,
    name: z.name,
    active: active == null ? true : active,
    priority: 0,
    segment_template_id: templateId,
    members: (members ?? []) as unknown[],
    brackets,
  } as unknown as PricingSchemeZone;
}

export const SegmentTemplateMatrixTable: React.FC<{
  group: ZoneBracketsMatrixGroup;
  busy: boolean;
  selectedZoneId: number | null;
  onUpsertCell: (args: { zoneId: number; min: number; max: number | null; draft: RowDraft }) => Promise<void>;

  // ✅ 新增：综合展示时只读
  readonly?: boolean;

  // ✅ 新增：行操作回调
  onRequestEditZone?: (zoneId: number) => void;
}> = ({ group, busy, selectedZoneId, onUpsertCell, readonly, onRequestEditZone }) => {
  const segments = useMemo<WeightSegment[]>(() => (group.segments ?? []).map(segToWeightSegment), [group.segments]);

  const zonesForTable = useMemo<PricingSchemeZone[]>(() => {
    const zs = (group.zones ?? []) as ZoneBracketsMatrixZone[];
    return zs.filter((z) => isZoneRenderable(z)).map((z) => toPricingSchemeZone(z, group.segment_template_id));
  }, [group.zones, group.segment_template_id]);

  const bracketsByZoneId = useMemo<Record<number, PricingSchemeZoneBracket[]>>(() => {
    const m: Record<number, PricingSchemeZoneBracket[]> = {};
    const zs = (group.zones ?? []) as ZoneBracketsMatrixZone[];
    for (const zone of zs) {
      if (!isZoneRenderable(zone)) continue;
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
        readonly={readonly}
        onRequestEditZone={onRequestEditZone}
      />
    </div>
  );
};

export default SegmentTemplateMatrixTable;
