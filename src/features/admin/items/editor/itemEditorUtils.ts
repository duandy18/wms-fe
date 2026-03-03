// src/features/admin/items/editor/itemEditorUtils.ts

import type { UomDraft } from "../create/types";
import type { ItemUom } from "../../../../master-data/itemUomsApi";

export type UnknownRecord = Record<string, unknown>;

export function asRecord(v: unknown): UnknownRecord {
  return (v ?? {}) as UnknownRecord;
}

export function trimOrNull(s: string): string | null {
  const t = s.trim();
  return t ? t : null;
}

export function parsePositiveIntOrNull(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  if (!Number.isInteger(n)) return null;
  const i = Math.trunc(n);
  if (i < 1) return null;
  return i;
}

export function normalizeBarcode(v: string): string | null {
  const s = (v ?? "").trim();
  return s ? s : null;
}

export function pickBaseUom(uoms: ItemUom[]): ItemUom | null {
  return uoms.find((x) => x.is_base) ?? null;
}

export function pickPurchaseDefaultUom(uoms: ItemUom[]): ItemUom | null {
  return uoms.find((x) => x.is_purchase_default) ?? null;
}

export function pickBaseDraft(uoms: UomDraft[]): UomDraft | null {
  return uoms.find((x) => x.is_base) ?? null;
}

export function pickPurchaseDraft(uoms: UomDraft[]): UomDraft | null {
  return uoms.find((x) => x.is_purchase_default && !x.is_base) ?? null;
}

export function draftFromItemUom(u: ItemUom): UomDraft {
  return {
    uom: u.uom ?? "",
    ratio_to_base: String(u.ratio_to_base ?? ""),
    display_name: u.display_name ?? "",
    is_base: Boolean(u.is_base),
    is_purchase_default: Boolean(u.is_purchase_default),
    is_inbound_default: Boolean(u.is_inbound_default),
    is_outbound_default: Boolean(u.is_outbound_default),
  };
}
