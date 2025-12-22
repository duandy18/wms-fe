// src/features/admin/shipping-providers/scheme/brackets/useBracketsPanelModel.ts
import { useEffect, useMemo, useState } from "react";
import type { PricingSchemeDetail, PricingSchemeZone, PricingSchemeZoneBracket } from "../../api";
import { createZoneBracket, patchZoneBracket } from "../../api";

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
} from "./quoteModel";
import { loadSegments } from "./segmentsTemplate";

type BracketWriteBody = {
  pricing_mode: "flat" | "linear_total" | "manual_quote";
  flat_amount?: number;
  base_amount?: number;
  rate_per_kg?: number;
};

function buildBracketWriteBody(p: ReturnType<typeof buildPayloadFromDraft>): BracketWriteBody {
  // ✅ 本轮立法：payload 字段集合由 pricing_mode 唯一决定（不传多余字段）
  if (p.pricing_mode === "flat") {
    return { pricing_mode: "flat", flat_amount: p.flat_amount ?? 0 };
  }
  if (p.pricing_mode === "linear_total") {
    return { pricing_mode: "linear_total", base_amount: p.base_amount ?? 0, rate_per_kg: p.rate_per_kg ?? 0 };
  }
  return { pricing_mode: "manual_quote" };
}

export function useBracketsPanelModel(args: { detail: PricingSchemeDetail; selectedZoneId: number | null }) {
  const { detail, selectedZoneId } = args;

  // ✅ 稳定化，避免 useMemo deps warning（react-hooks/exhaustive-deps）
  const zones = useMemo(() => detail.zones ?? [], [detail.zones]);

  // 下拉只显示 active（防误操作）
  const selectableZones = useMemo(() => zones.filter((z) => isZoneActive(z)), [zones]);

  // ✅ 成果表也只展示 active zones（停用的不显示）
  const zonesForTable = selectableZones;

  const selectedZone = useMemo<PricingSchemeZone | null>(() => {
    if (!selectedZoneId) return null;
    return zones.find((z) => z.id === selectedZoneId) ?? null;
  }, [zones, selectedZoneId]);

  // ✅ 方案级模板（表头）自动回显：进入页面/切换 scheme 自动从 localStorage 载入
  const [segments, setSegments] = useState<WeightSegment[]>(() => loadSegments(detail.id));
  useEffect(() => {
    setSegments(loadSegments(detail.id));
  }, [detail.id]);

  const [bracketsByZoneId, setBracketsByZoneId] = useState<Record<number, PricingSchemeZoneBracket[]>>({});
  const [draftsByZoneId, setDraftsByZoneId] = useState<Record<number, Record<string, RowDraft>>>({});
  const [busy, setBusy] = useState(false);

  // 初始化：bracketsByZoneId + draftsByZoneId 都灌满（便于回显/编辑）
  useEffect(() => {
    const bMap: Record<number, PricingSchemeZoneBracket[]> = {};
    const dMap: Record<number, Record<string, RowDraft>> = {};

    for (const z of zones) {
      const bs = z.brackets ?? [];
      bMap[z.id] = bs;

      const ds: Record<string, RowDraft> = {};
      for (const b of bs) ds[keyFromBracket(b)] = draftFromBracket(b);
      dMap[z.id] = ds;
    }

    setBracketsByZoneId(bMap);
    setDraftsByZoneId((prev) => ({ ...dMap, ...prev })); // 保留用户未保存草稿优先
     
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

  async function saveCurrentZonePrices() {
    if (!selectedZone || !selectedZoneId) {
      alert("请先选择 Zone");
      return;
    }

    const ops: Array<{
      key: string;
      min: number;
      max: number | null;
      bracket: PricingSchemeZoneBracket | null;
      draft: RowDraft;
    }> = [];

    for (const row of tableRows) {
      if (!row.key) continue;

      const min = parseNum(row.segment.min.trim());
      if (min == null) continue;
      const max = row.segment.max.trim() ? parseNum(row.segment.max.trim()) : null;
      if (max != null && max <= min) continue;

      const b = currentBracketByKey[row.key] ?? null;
      const d = currentDrafts[row.key] ?? defaultDraft();

      ops.push({ key: row.key, min, max, bracket: b, draft: d });
    }

    if (ops.length === 0) {
      alert("没有可保存的列（请先完善重量分段模板）");
      return;
    }

    setBusy(true);
    try {
      const updated: PricingSchemeZoneBracket[] = [];

      for (const op of ops) {
        const p = buildPayloadFromDraft(op.draft);
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
        for (const b of updated) next[keyFromBracket(b)] = draftFromBracket(b);
        return { ...prev, [selectedZoneId]: next };
      });

      alert(`保存成功：写入 ${updated.length} 条报价（自动补齐缺失区间）。`);
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

    setBusy(true);
    try {
      const rowBrackets = bracketsByZoneId[zoneId] ?? [];
      const rowByKey: Record<string, PricingSchemeZoneBracket> = {};
      for (const b of rowBrackets) rowByKey[keyFromBracket(b)] = b;

      const exist = rowByKey[key] ?? null;
      const p = buildPayloadFromDraft(draft);
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
        const next = { ...cur, [keyFromBracket(updated)]: draftFromBracket(updated) };
        return { ...prev, [zoneId]: next };
      });
    } finally {
      setBusy(false);
    }
  }

  function afterRefreshBrackets(freshZones: PricingSchemeZone[]) {
    // 只更新 brackets/drafts 的本地缓存（不改父级 detail）
    const bMap: Record<number, PricingSchemeZoneBracket[]> = {};
    const dMap: Record<number, Record<string, RowDraft>> = {};
    for (const z of freshZones) {
      const bs = z.brackets ?? [];
      bMap[z.id] = bs;
      const ds: Record<string, RowDraft> = {};
      for (const b of bs) ds[keyFromBracket(b)] = draftFromBracket(b);
      dMap[z.id] = ds;
    }
    setBracketsByZoneId((prev) => ({ ...prev, ...bMap }));
    setDraftsByZoneId((prev) => ({ ...prev, ...dMap }));
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
    saveCurrentZonePrices,
    upsertCellPrice,
    afterRefreshBrackets,
  };
}
