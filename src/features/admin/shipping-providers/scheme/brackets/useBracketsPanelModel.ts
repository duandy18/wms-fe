// src/features/admin/shipping-providers/scheme/brackets/useBracketsPanelModel.ts
import { useEffect, useMemo, useState } from "react";
import type { PricingSchemeDetail, PricingSchemeZone, PricingSchemeZoneBracket } from "../../api";
import { createZoneBracket, patchZoneBracket } from "../../api/brackets";

import type { WeightSegment } from "./PricingRuleEditor";
import type { RowDraft } from "./quoteModel";
import { defaultDraft, isZoneActive, keyFromBracket, keyFromSegment } from "./quoteModel";
import { loadSegments } from "./segmentsTemplate";

import { afterRefreshBrackets, buildInitialCaches, saveCurrentZonePrices, upsertCellPrice } from "./useBracketsPanelModel_internal";

export function useBracketsPanelModel(args: { detail: PricingSchemeDetail; selectedZoneId: number | null }) {
  const { detail, selectedZoneId } = args;

  const zones = useMemo(() => detail.zones ?? [], [detail.zones]);

  const selectableZones = useMemo(() => zones.filter((z) => isZoneActive(z)), [zones]);

  const zonesForTable = selectableZones;

  const selectedZone = useMemo<PricingSchemeZone | null>(() => {
    if (!selectedZoneId) return null;
    return zones.find((z) => z.id === selectedZoneId) ?? null;
  }, [zones, selectedZoneId]);

  const [segments, setSegments] = useState<WeightSegment[]>(() => loadSegments(detail.id));
  useEffect(() => {
    setSegments(loadSegments(detail.id));
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

    segments,
    setSegments,

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
