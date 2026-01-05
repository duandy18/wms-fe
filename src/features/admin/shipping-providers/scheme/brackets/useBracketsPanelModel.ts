// src/features/admin/shipping-providers/scheme/brackets/useBracketsPanelModel.ts
import { useEffect, useMemo, useState } from "react";
import type { PricingSchemeDetail, PricingSchemeZone, PricingSchemeZoneBracket } from "../../api";
import { createZoneBracket, patchZoneBracket } from "../../api/brackets";

import type { WeightSegment } from "./PricingRuleEditor";
import type { RowDraft } from "./quoteModel";
import { defaultDraft, isZoneActive, keyFromBracket, keyFromSegment } from "./quoteModel";

import { afterRefreshBrackets, buildInitialCaches, saveCurrentZonePrices, upsertCellPrice } from "./useBracketsPanelModel_internal";

// ✅ 段模板体系：以“当前生效方案”为唯一真相
import {
  fetchSegmentTemplates,
  fetchSegmentTemplateDetail,
  isTemplateActive,
  type SegmentTemplateOut,
} from "./segmentTemplates";
import { templateItemsToWeightSegments } from "./SegmentsPanel/utils";

// fallback（仅在没有任何生效模板时兜底，避免页面空白）
const FALLBACK_SEGMENTS: WeightSegment[] = [
  { min: "0", max: "1" },
  { min: "1", max: "2" },
  { min: "2", max: "3" },
  { min: "3", max: "" },
];

async function loadActiveTemplateSegments(schemeId: number): Promise<WeightSegment[] | null> {
  const list = await fetchSegmentTemplates(schemeId);
  const active = (list ?? []).find((t) => isTemplateActive(t)) ?? null;
  if (!active) return null;

  const detail: SegmentTemplateOut = await fetchSegmentTemplateDetail(active.id);
  const rows = templateItemsToWeightSegments(detail.items ?? []);
  return rows.length ? rows : null;
}

export function useBracketsPanelModel(args: { detail: PricingSchemeDetail; selectedZoneId: number | null }) {
  const { detail, selectedZoneId } = args;

  const zones = useMemo(() => detail.zones ?? [], [detail.zones]);

  const selectableZones = useMemo(() => zones.filter((z) => isZoneActive(z)), [zones]);

  const zonesForTable = selectableZones;

  const selectedZone = useMemo<PricingSchemeZone | null>(() => {
    if (!selectedZoneId) return null;
    return zones.find((z) => z.id === selectedZoneId) ?? null;
  }, [zones, selectedZoneId]);

  // ✅ 录价页重量段：严格对齐“当前生效重量段方案”
  const [segments, setSegments] = useState<WeightSegment[]>(FALLBACK_SEGMENTS);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const rows = await loadActiveTemplateSegments(detail.id);
        if (cancelled) return;
        setSegments(rows ?? FALLBACK_SEGMENTS);
      } catch {
        // 如果后端暂时不可用/没配模板，兜底不让页面空
        if (cancelled) return;
        setSegments(FALLBACK_SEGMENTS);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [detail.id]);

  const [bracketsByZoneId, setBracketsByZoneId] = useState<Record<number, PricingSchemeZoneBracket[]>>({});
  const [draftsByZoneId, setDraftsByZoneId] = useState<Record<number, Record<string, RowDraft>>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { bMap, dMap } = buildInitialCaches(zones);
    setBracketsByZoneId(bMap);
    setDraftsByZoneId((prev) => ({ ...dMap, ...prev }));
  }, [detail.id, zones]);

  const tableRows = useMemo(() => segments.map((s) => ({ segment: s, key: keyFromSegment(s) })), [segments]);

  const currentDrafts = useMemo(() => {
    if (!selectedZoneId) return {};
    return draftsByZoneId[selectedZoneId] ?? {};
  }, [draftsByZoneId, selectedZoneId]);

  const currentBrackets = useMemo(() => {
    if (!selectedZoneId) return [];
    return bracketsByZoneId[selectedZoneId] ?? (selectedZone?.brackets ?? []);
  }, [bracketsByZoneId, selectedZoneId, selectedZone]);

  const currentBracketByKey = useMemo(() => {
    const m: Record<string, PricingSchemeZoneBracket> = {};
    for (const b of currentBrackets) m[keyFromBracket(b)] = b;
    return m;
  }, [currentBrackets]);

  function setDraftForCurrentZone(key: string, patch: Partial<RowDraft>) {
    if (!selectedZoneId) return;
    setDraftsByZoneId((prev) => {
      const curZoneDrafts = prev[selectedZoneId] ?? {};
      const cur = curZoneDrafts[key] ?? defaultDraft();

      return {
        ...prev,
        [selectedZoneId]: {
          ...curZoneDrafts,
          [key]: { ...cur, ...patch },
        },
      };
    });
  }

  async function saveCurrentZonePricesWrapper() {
    await saveCurrentZonePrices({
      selectedZone,
      selectedZoneId,
      tableRows,
      currentBracketByKey,
      currentDrafts,
      createZoneBracket,
      patchZoneBracket,
      setBusy,
      setBracketsByZoneId,
      setDraftsByZoneId,
    });
  }

  async function upsertCellPriceWrapper(args2: { zoneId: number; min: number; max: number | null; draft: RowDraft }) {
    const { zoneId, min, max, draft } = args2;
    await upsertCellPrice({
      zoneId,
      min,
      max,
      draft,
      bracketsByZoneId,
      createZoneBracket,
      patchZoneBracket,
      setBusy,
      setBracketsByZoneId,
      setDraftsByZoneId,
    });
  }

  function afterRefreshBracketsWrapper(freshZones: PricingSchemeZone[]) {
    afterRefreshBrackets({
      freshZones,
      setBracketsByZoneId,
      setDraftsByZoneId,
    });
  }

  return {
    zones,
    selectableZones,
    zonesForTable,
    selectedZone,

    // ✅ segments 现在是“当前生效重量段方案”的真相
    segments,
    setSegments, // 保留 API 形状（尽量不要在录价页手动 set；以生效模板为准）

    tableRows,
    currentDrafts,
    currentBrackets,

    bracketsByZoneId,
    draftsByZoneId,

    busy,
    setBusy,

    setDraftForCurrentZone,
    saveCurrentZonePrices: saveCurrentZonePricesWrapper,
    upsertCellPrice: upsertCellPriceWrapper,
    afterRefreshBrackets: afterRefreshBracketsWrapper,
  };
}

export default useBracketsPanelModel;
