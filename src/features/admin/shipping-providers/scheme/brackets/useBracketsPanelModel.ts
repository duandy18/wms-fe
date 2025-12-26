// src/features/admin/shipping-providers/scheme/brackets/useBracketsPanelModel.ts
import { useEffect, useMemo, useState } from "react";
import type { PricingSchemeDetail, PricingSchemeZone, PricingSchemeZoneBracket } from "../../api";
import { createZoneBracket, patchZoneBracket } from "../../api";
import type { SchemeDefaultPricingMode } from "../../api/types";

import type { WeightSegment } from "./PricingRuleEditor";
import type { RowDraft } from "./quoteModel";
import {
  buildPayloadFromDraft,
  draftFromBracket,
  isZoneActive,
  keyFromBracket,
  keyFromSegment,
  parseNum,
  defaultDraft,
  segLabel,
} from "./quoteModel";

import { buildBracketWriteBody } from "./bracketWriteBody";
import { validateDraftForSave } from "./draftValidation";
import { buildBracketsMap, buildDraftsMap } from "./zoneBracketMaps";

export function useBracketsPanelModel(args: {
  detail: PricingSchemeDetail;
  selectedZoneId: number | null;
  schemeMode: SchemeDefaultPricingMode;

  // ✅ Phase 4.3：segments 由外部注入（后端真相），本 hook 不再读取 localStorage，不做 fallback
  segments: WeightSegment[];
}) {
  const { detail, selectedZoneId, schemeMode, segments } = args;

  const zones = useMemo(() => detail.zones ?? [], [detail.zones]);
  const selectableZones = useMemo(() => zones.filter((z) => isZoneActive(z)), [zones]);
  const zonesForTable = selectableZones;

  const selectedZone = useMemo<PricingSchemeZone | null>(() => {
    if (!selectedZoneId) return null;
    return zones.find((z) => z.id === selectedZoneId) ?? null;
  }, [zones, selectedZoneId]);

  const [bracketsByZoneId, setBracketsByZoneId] = useState<Record<number, PricingSchemeZoneBracket[]>>({});
  const [draftsByZoneId, setDraftsByZoneId] = useState<Record<number, Record<string, RowDraft>>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const bMap = buildBracketsMap(zones);
    const dMap = buildDraftsMap(zones, schemeMode);

    setBracketsByZoneId(bMap);

    // ✅ 合并策略：以新构建 dMap 为底座，但保留 prev 里用户尚未保存的输入（避免切换/刷新导致丢输入）
    setDraftsByZoneId((prev) => ({ ...dMap, ...prev }));
  }, [detail.id, zones, schemeMode]);

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
      const cur = curZoneDrafts[key] ?? defaultDraft(schemeMode);

      // ✅ 不再强行归一到 schemeMode：允许按 patch.mode（段级/格级）设置混合口径
      const nextMode: RowDraft["mode"] = (patch.mode ?? cur.mode ?? schemeMode) as RowDraft["mode"];

      return {
        ...prev,
        [selectedZoneId]: {
          ...curZoneDrafts,
          [key]: { ...cur, ...patch, mode: nextMode },
        },
      };
    });
  }

  async function saveCurrentZonePrices() {
    if (!selectedZone || !selectedZoneId) {
      alert("请先选择区域（Zone）");
      return;
    }

    const ops: Array<{
      key: string;
      min: number;
      max: number | null;
      bracket: PricingSchemeZoneBracket | null;
      draft: RowDraft;
      seg: WeightSegment;
    }> = [];

    for (const row of tableRows) {
      if (!row.key) continue;

      const min = parseNum(row.segment.min.trim());
      if (min == null) continue;
      const max = row.segment.max.trim() ? parseNum(row.segment.max.trim()) : null;
      if (max != null && max <= min) continue;

      const b = currentBracketByKey[row.key] ?? null;
      const d = currentDrafts[row.key] ?? defaultDraft(schemeMode);

      ops.push({ key: row.key, min, max, bracket: b, draft: d, seg: row.segment });
    }

    if (ops.length === 0) {
      alert("没有可保存的重量段（请先完善重量分段表头）");
      return;
    }

    for (const op of ops) {
      const msg = validateDraftForSave(op.draft, schemeMode);
      if (msg) {
        alert(`【${segLabel(op.seg)}】${msg}`);
        return;
      }
    }

    setBusy(true);
    try {
      const updated: PricingSchemeZoneBracket[] = [];

      for (const op of ops) {
        const p = buildPayloadFromDraft(op.draft, schemeMode);
        const body = buildBracketWriteBody(p);

        if (op.bracket) {
          const b2 = await patchZoneBracket(op.bracket.id, body);
          updated.push(b2);
        } else {
          const bNew = await createZoneBracket(selectedZoneId, {
            min_kg: op.min,
            max_kg: op.max,
            ...body,
            active: true,
          });
          updated.push(bNew);
        }
      }

      setBracketsByZoneId((prev) => {
        const old = prev[selectedZoneId] ?? [];
        const byId: Record<number, PricingSchemeZoneBracket> = {};
        for (const b of old) byId[b.id] = b;
        for (const b of updated) byId[b.id] = b;
        return { ...prev, [selectedZoneId]: Object.values(byId) };
      });

      setDraftsByZoneId((prev) => {
        const cur = prev[selectedZoneId] ?? {};
        const next = { ...cur };
        for (const b of updated) next[keyFromBracket(b)] = draftFromBracket(b, schemeMode);
        return { ...prev, [selectedZoneId]: next };
      });

      alert(`保存成功：写入 ${updated.length} 条报价。`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "保存失败";
      alert(msg);
    } finally {
      setBusy(false);
    }
  }

  async function upsertCellPrice(args2: { zoneId: number; min: number; max: number | null; draft: RowDraft }) {
    const { zoneId, min, max, draft } = args2;
    const key = `${min}__${max == null ? "INF" : String(max)}`;

    const msg = validateDraftForSave(draft, schemeMode);
    if (msg) {
      alert(msg);
      return;
    }

    setBusy(true);
    try {
      const rowBrackets = bracketsByZoneId[zoneId] ?? [];
      const rowByKey: Record<string, PricingSchemeZoneBracket> = {};
      for (const b of rowBrackets) rowByKey[keyFromBracket(b)] = b;

      const exist = rowByKey[key] ?? null;

      const p = buildPayloadFromDraft(draft, schemeMode);
      const body = buildBracketWriteBody(p);

      let updated: PricingSchemeZoneBracket;
      if (exist) {
        updated = await patchZoneBracket(exist.id, body);
      } else {
        updated = await createZoneBracket(zoneId, {
          min_kg: min,
          max_kg: max,
          ...body,
          active: true,
        });
      }

      setBracketsByZoneId((prev) => {
        const old = prev[zoneId] ?? [];
        const byId: Record<number, PricingSchemeZoneBracket> = {};
        for (const b of old) byId[b.id] = b;
        byId[updated.id] = updated;
        return { ...prev, [zoneId]: Object.values(byId) };
      });

      setDraftsByZoneId((prev) => {
        const cur = prev[zoneId] ?? {};
        const next = { ...cur, [keyFromBracket(updated)]: draftFromBracket(updated, schemeMode) };
        return { ...prev, [zoneId]: next };
      });
    } finally {
      setBusy(false);
    }
  }

  function afterRefreshBrackets(freshZones: PricingSchemeZone[]) {
    const bMap = buildBracketsMap(freshZones);
    const dMap = buildDraftsMap(freshZones, schemeMode);
    setBracketsByZoneId((prev) => ({ ...prev, ...bMap }));
    setDraftsByZoneId((prev) => ({ ...prev, ...dMap }));
  }

  return {
    zones,
    selectableZones,
    zonesForTable,
    selectedZone,

    tableRows,
    currentDrafts,
    currentBrackets,
    bracketsByZoneId,
    draftsByZoneId,

    busy,
    setBusy,

    setDraftForCurrentZone,
    saveCurrentZonePrices,
    upsertCellPrice,
    afterRefreshBrackets,
  };
}
