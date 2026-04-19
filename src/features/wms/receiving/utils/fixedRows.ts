import type { PublicAggregateUom } from "../../../../domains/pms/public/contracts/itemAggregate";
import {
  createEmptyReceivingEntryDraft,
  type ReceivingActualUomOption,
  type ReceivingEntryDraft,
  type ReceivingTaskReadOut,
} from "../contracts/receiving";

export type ReceivingEntriesByLineNo = Record<number, ReceivingEntryDraft[]>;
export type ReceivingUomOptionsByLineNo = Record<
  number,
  ReceivingActualUomOption[]
>;

export const BASE_EPSILON = 1e-9;

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

export function normalizeOptionalString(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function isEntryTouched(entry: ReceivingEntryDraft): boolean {
  return Boolean(
    entry.qty_inbound.trim() ||
      entry.barcode_input.trim() ||
      entry.batch_no.trim() ||
      entry.production_date.trim() ||
      entry.expiry_date.trim() ||
      entry.remark.trim(),
  );
}

export function formatQty(
  value: string | number | null | undefined,
): string {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return "0";
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(4).replace(/\.?0+$/, "");
}

export function incrementQtyText(value: string): string {
  const n = Number(value.trim() || "0");
  const safe = Number.isFinite(n) && n > 0 ? n : 0;
  return String(safe + 1);
}

export function sortAggregateUoms(
  uoms: PublicAggregateUom[],
): PublicAggregateUom[] {
  const score = (u: PublicAggregateUom): number => {
    const inbound = u.is_inbound_default ? 0 : 10;
    const base = u.is_base ? 0 : 1;
    return inbound + base;
  };

  return [...uoms].sort(
    (a, b) =>
      score(a) - score(b) ||
      a.ratio_to_base - b.ratio_to_base ||
      a.id - b.id,
  );
}

export function buildLineUomOptions(
  line: ReceivingTaskReadOut["lines"][number],
  aggregateUoms: PublicAggregateUom[] | undefined,
): ReceivingActualUomOption[] {
  const fallback: ReceivingActualUomOption = {
    actual_item_uom_id: line.item_uom_id,
    actual_uom_name_snapshot:
      line.uom_name_snapshot || `包装 ${line.item_uom_id}`,
    actual_ratio_to_base_snapshot: Number(line.ratio_to_base_snapshot),
    is_base: Number(line.ratio_to_base_snapshot) === 1,
    is_inbound_default: Number(line.ratio_to_base_snapshot) === 1,
  };

  const source =
    aggregateUoms && aggregateUoms.length > 0
      ? sortAggregateUoms(aggregateUoms)
      : [];

  const map = new Map<number, ReceivingActualUomOption>();
  map.set(fallback.actual_item_uom_id, fallback);

  for (const u of source) {
    map.set(u.id, {
      actual_item_uom_id: u.id,
      actual_uom_name_snapshot:
        (u.display_name && u.display_name.trim()) || u.uom,
      actual_ratio_to_base_snapshot: u.ratio_to_base,
      is_base: u.is_base,
      is_inbound_default: u.is_inbound_default,
    });
  }

  return [...map.values()].sort(
    (a, b) =>
      Number(b.is_inbound_default) - Number(a.is_inbound_default) ||
      Number(b.is_base) - Number(a.is_base) ||
      a.actual_ratio_to_base_snapshot - b.actual_ratio_to_base_snapshot ||
      a.actual_item_uom_id - b.actual_item_uom_id,
  );
}

export function buildPresetEntriesFromUoms(
  options: ReceivingActualUomOption[],
  previousRows?: ReceivingEntryDraft[],
): ReceivingEntryDraft[] {
  const prevMap = new Map<number, ReceivingEntryDraft>();
  (previousRows ?? []).forEach((row) => {
    if (row.actual_item_uom_id != null) {
      prevMap.set(row.actual_item_uom_id, row);
    }
  });

  return options.map((opt) => {
    const prev = prevMap.get(opt.actual_item_uom_id);
    return {
      ...createEmptyReceivingEntryDraft(),
      ...prev,
      actual_item_uom_id: opt.actual_item_uom_id,
      actual_uom_name_snapshot: opt.actual_uom_name_snapshot,
      actual_ratio_to_base_snapshot: opt.actual_ratio_to_base_snapshot,
    };
  });
}

export function buildEmptyEntries(
  detail: ReceivingTaskReadOut,
  uomOptionsByLineNo: ReceivingUomOptionsByLineNo,
): ReceivingEntriesByLineNo {
  const next: ReceivingEntriesByLineNo = {};
  for (const line of detail.lines) {
    const options = uomOptionsByLineNo[line.line_no] ?? [];
    next[line.line_no] =
      options.length > 0
        ? buildPresetEntriesFromUoms(options)
        : [createEmptyReceivingEntryDraft()];
  }
  return next;
}

export function applyResolvedScanToFixedRows(
  currentRows: ReceivingEntryDraft[],
  resolved: {
    barcode: string;
    actual_item_uom_id: number;
    actual_uom_name_snapshot: string;
    actual_ratio_to_base_snapshot: number;
  },
): ReceivingEntryDraft[] {
  const rows = [...currentRows];
  const targetIndex = rows.findIndex(
    (row) => row.actual_item_uom_id === resolved.actual_item_uom_id,
  );

  if (targetIndex >= 0) {
    const current = rows[targetIndex] ?? createEmptyReceivingEntryDraft();
    rows[targetIndex] = {
      ...current,
      barcode_input: resolved.barcode,
      actual_item_uom_id: resolved.actual_item_uom_id,
      actual_uom_name_snapshot: resolved.actual_uom_name_snapshot,
      actual_ratio_to_base_snapshot: resolved.actual_ratio_to_base_snapshot,
      qty_inbound: incrementQtyText(current.qty_inbound),
    };
    return rows;
  }

  rows.push({
    ...createEmptyReceivingEntryDraft(),
    barcode_input: resolved.barcode,
    actual_item_uom_id: resolved.actual_item_uom_id,
    actual_uom_name_snapshot: resolved.actual_uom_name_snapshot,
    actual_ratio_to_base_snapshot: resolved.actual_ratio_to_base_snapshot,
    qty_inbound: "1",
  });
  return rows;
}
