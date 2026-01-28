// src/features/admin/shipping-providers/scheme/brackets/useBracketsPanelModel.ts
import { useEffect, useMemo, useRef, useState } from "react";
import type { PricingSchemeDetail, PricingSchemeZone, PricingSchemeZoneBracket } from "../../api";
import { createZoneBracket, patchZoneBracket } from "../../api/brackets";

import type { RowDraft } from "./quoteModel";
import { defaultDraft, isZoneActive, keyFromSegment } from "./quoteModel";

import { afterRefreshBrackets, saveCurrentZonePrices, upsertCellPrice } from "./useBracketsPanelModel_internal";

import { useZoneTemplateSegments } from "./contracts/segmentsContract";
import { mergeCachesFromZones } from "./contracts/bracketsCache";
import { buildBracketByKey, buildRowKeySet, computeBackendKeyStats } from "./contracts/bracketsDiagnostics";

type BracketsCacheState = {
  bracketsByZoneId: Record<number, PricingSchemeZoneBracket[]>;
  draftsByZoneId: Record<number, Record<string, RowDraft>>;
};

function applyStateAction<T>(prev: T, action: React.SetStateAction<T>): T {
  if (typeof action === "function") {
    return (action as (p: T) => T)(prev);
  }
  return action;
}

function makeBridges(setCache: React.Dispatch<React.SetStateAction<BracketsCacheState>>) {
  const setBracketsByZoneId: React.Dispatch<React.SetStateAction<Record<number, PricingSchemeZoneBracket[]>>> = (
    action,
  ) => {
    setCache((prev) => ({
      ...prev,
      bracketsByZoneId: applyStateAction(prev.bracketsByZoneId, action),
    }));
  };

  const setDraftsByZoneId: React.Dispatch<React.SetStateAction<Record<number, Record<string, RowDraft>>>> = (
    action,
  ) => {
    setCache((prev) => ({
      ...prev,
      draftsByZoneId: applyStateAction(prev.draftsByZoneId, action),
    }));
  };

  return { setBracketsByZoneId, setDraftsByZoneId };
}

// -----------------------------
// main hook
// -----------------------------

export function useBracketsPanelModel(args: { detail: PricingSchemeDetail; selectedZoneId: number | null }) {
  const { detail, selectedZoneId } = args;

  const zones = useMemo(() => detail.zones ?? [], [detail.zones]);

  const selectableZones = useMemo(() => zones.filter((z) => isZoneActive(z)), [zones]);

  const zonesForTable = selectableZones;

  const selectedZone = useMemo<PricingSchemeZone | null>(() => {
    if (!selectedZoneId) return null;
    return zones.find((z) => z.id === selectedZoneId) ?? null;
  }, [zones, selectedZoneId]);

  // =========================================================
  // ✅ 派生“稳定的合同字段”
  // =========================================================

  const zoneTemplateId: number | null = selectedZone?.segment_template_id ?? null;

  // =========================================================
  // ✅ 核心：segments 来源（严格合同）
  // =========================================================

  const { segments } = useZoneTemplateSegments(zoneTemplateId);

  // =========================================================
  // 价格 / 草稿缓存（合并成一个 state，保证原子更新）
  // =========================================================

  const [cache, setCache] = useState<BracketsCacheState>({
    bracketsByZoneId: {},
    draftsByZoneId: {},
  });

  const [busy, setBusy] = useState(false);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const successTimerRef = useRef<number | null>(null);

  function showSuccess(msg: string) {
    setSuccessMsg(msg);

    if (successTimerRef.current != null) {
      window.clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }

    successTimerRef.current = window.setTimeout(() => {
      setSuccessMsg(null);
      successTimerRef.current = null;
    }, 2500);
  }

  function clearSuccess() {
    if (successTimerRef.current != null) {
      window.clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
    setSuccessMsg(null);
  }

  useEffect(() => {
    return () => {
      if (successTimerRef.current != null) {
        window.clearTimeout(successTimerRef.current);
        successTimerRef.current = null;
      }
    };
  }, []);

  // ✅ zones -> caches 合并：单次 setState，依赖清爽，eslint 也清爽
  useEffect(() => {
    setCache((prev) => {
      const { nextBracketsByZoneId, nextDraftsByZoneId } = mergeCachesFromZones({
        zones,
        prevBracketsByZoneId: prev.bracketsByZoneId,
        prevDraftsByZoneId: prev.draftsByZoneId,
      });
      return {
        bracketsByZoneId: nextBracketsByZoneId,
        draftsByZoneId: nextDraftsByZoneId,
      };
    });
  }, [detail.id, zones]);

  const tableRows = useMemo(() => segments.map((s) => ({ segment: s, key: keyFromSegment(s) })), [segments]);

  const currentDrafts = useMemo(() => {
    if (!selectedZoneId) return {};
    return cache.draftsByZoneId[selectedZoneId] ?? {};
  }, [cache.draftsByZoneId, selectedZoneId]);

  const currentBrackets = useMemo(() => {
    if (!selectedZoneId) return [];
    return cache.bracketsByZoneId[selectedZoneId] ?? (selectedZone?.brackets ?? []);
  }, [cache.bracketsByZoneId, selectedZoneId, selectedZone]);

  const rowKeySet = useMemo(() => buildRowKeySet(tableRows), [tableRows]);

  const backendKeyStats = useMemo(
    () => computeBackendKeyStats({ currentBrackets, rowKeySet }),
    [currentBrackets, rowKeySet],
  );

  const currentBracketByKey = useMemo(() => buildBracketByKey(currentBrackets), [currentBrackets]);

  function setDraftForCurrentZone(key: string, patch: Partial<RowDraft>) {
    if (!selectedZoneId) return;

    setCache((prev) => {
      const curZoneDrafts = prev.draftsByZoneId[selectedZoneId] ?? {};
      const cur = curZoneDrafts[key] ?? defaultDraft();

      return {
        ...prev,
        draftsByZoneId: {
          ...prev.draftsByZoneId,
          [selectedZoneId]: {
            ...curZoneDrafts,
            [key]: { ...cur, ...patch },
          },
        },
      };
    });
  }

  async function saveCurrentZonePricesWrapper() {
    if (!selectedZoneId || !selectedZone) {
      alert("请先选择区域（Zone）");
      return;
    }

    if (!zoneTemplateId) {
      alert("当前 Zone 未绑定重量段方案，禁止录价。请先在【区域分类】为该 Zone 选择重量段方案。");
      return;
    }

    if (tableRows.length === 0) {
      alert("当前重量段方案没有任何有效区间，禁止录价。请先完善重量段方案的段结构。");
      return;
    }

    if (backendKeyStats.invalidKeyCount > 0) {
      alert("后端返回的报价区间字段不符合合同（无法解析 min/max），为避免写入污染，本次操作已阻断。请先检查接口字段。");
      return;
    }

    const { setBracketsByZoneId, setDraftsByZoneId } = makeBridges(setCache);

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
      onSuccess: showSuccess,
    });
  }

  async function upsertCellPriceWrapper(args2: { zoneId: number; min: number; max: number | null; draft: RowDraft }) {
    const { zoneId, min, max, draft } = args2;

    const { setBracketsByZoneId, setDraftsByZoneId } = makeBridges(setCache);

    await upsertCellPrice({
      zoneId,
      min,
      max,
      draft,
      bracketsByZoneId: cache.bracketsByZoneId,
      createZoneBracket,
      patchZoneBracket,
      setBusy,
      setBracketsByZoneId,
      setDraftsByZoneId,
    });
  }

  function afterRefreshBracketsWrapper(freshZones: PricingSchemeZone[]) {
    const { setBracketsByZoneId, setDraftsByZoneId } = makeBridges(setCache);

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

    // ✅ 段结构真相（严格合同）
    segments,

    tableRows,
    currentDrafts,
    currentBrackets,

    bracketsByZoneId: cache.bracketsByZoneId,
    draftsByZoneId: cache.draftsByZoneId,

    busy,
    setBusy,

    successMsg,
    clearSuccess,

    // 给 UI 做诊断/提示（可选使用）
    zoneTemplateId,
    backendKeyStats,

    setDraftForCurrentZone,
    saveCurrentZonePrices: saveCurrentZonePricesWrapper,
    upsertCellPrice: upsertCellPriceWrapper,
    afterRefreshBrackets: afterRefreshBracketsWrapper,
  };
}

export default useBracketsPanelModel;
