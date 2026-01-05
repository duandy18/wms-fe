// src/features/admin/shipping-providers/scheme/brackets/useBracketsPanelModel_internal/actions.ts
//
// 写操作：
// - saveCurrentZonePrices（批量保存当前 zone）
// - upsertCellPrice（核对表单格写入）
// - afterRefreshBrackets（用 freshZones 刷新本地缓存）
//
// 目标：
// - 让主 hook 只负责状态编排，不承载大段写逻辑
// - actions 通过依赖注入拿到 state 与 setters，便于测试与复用

import type { PricingSchemeZone, PricingSchemeZoneBracket } from "../../../api";
import type { WeightSegment } from "../PricingRuleEditor";
import type { RowDraft } from "../quoteModel";
import {
  buildPayloadFromDraft,
  defaultDraft,
  draftFromBracket,
  keyFromBracket,
  parseNum,
} from "../quoteModel";
import { buildBracketWriteBody } from "./payload";

type BracketMode = "flat" | "linear_total" | "step_over" | "manual_quote";

type BracketCreateBody = {
  min_kg: number;
  max_kg: number | null;
  pricing_mode: BracketMode;
  flat_amount?: number;
  base_amount?: number;
  rate_per_kg?: number;
  base_kg?: number;
  active: boolean;
};

type BracketPatchBody = {
  pricing_mode: BracketMode;
  flat_amount?: number;
  base_amount?: number;
  rate_per_kg?: number;
  base_kg?: number;
};

export async function saveCurrentZonePrices(args: {
  selectedZone: PricingSchemeZone | null;
  selectedZoneId: number | null;
  tableRows: { segment: WeightSegment; key: string | null }[];
  currentBracketByKey: Record<string, PricingSchemeZoneBracket>;
  currentDrafts: Record<string, RowDraft>;
  createZoneBracket: (zoneId: number, body: BracketCreateBody) => Promise<PricingSchemeZoneBracket>;
  patchZoneBracket: (bracketId: number, body: BracketPatchBody) => Promise<PricingSchemeZoneBracket>;
  setBusy: (v: boolean) => void;
  setBracketsByZoneId: React.Dispatch<React.SetStateAction<Record<number, PricingSchemeZoneBracket[]>>>;
  setDraftsByZoneId: React.Dispatch<React.SetStateAction<Record<number, Record<string, RowDraft>>>>;
}) {
  const {
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
  } = args;

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

export async function upsertCellPrice(args: {
  zoneId: number;
  min: number;
  max: number | null;
  draft: RowDraft;
  bracketsByZoneId: Record<number, PricingSchemeZoneBracket[]>;
  createZoneBracket: (zoneId: number, body: BracketCreateBody) => Promise<PricingSchemeZoneBracket>;
  patchZoneBracket: (bracketId: number, body: BracketPatchBody) => Promise<PricingSchemeZoneBracket>;
  setBusy: (v: boolean) => void;
  setBracketsByZoneId: React.Dispatch<React.SetStateAction<Record<number, PricingSchemeZoneBracket[]>>>;
  setDraftsByZoneId: React.Dispatch<React.SetStateAction<Record<number, Record<string, RowDraft>>>>;
}) {
  const {
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
  } = args;

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

export function afterRefreshBrackets(args: {
  freshZones: PricingSchemeZone[];
  setBracketsByZoneId: React.Dispatch<React.SetStateAction<Record<number, PricingSchemeZoneBracket[]>>>;
  setDraftsByZoneId: React.Dispatch<React.SetStateAction<Record<number, Record<string, RowDraft>>>>;
}) {
  const { freshZones, setBracketsByZoneId, setDraftsByZoneId } = args;

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
