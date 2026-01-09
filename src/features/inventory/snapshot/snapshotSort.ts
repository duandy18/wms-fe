// src/features/inventory/snapshot/snapshotSort.ts
import type { InventoryRow } from "./api";

export type SortKey =
  | "item_code"
  | "item_name"
  | "total_qty"
  | "earliest_expiry"
  | "near_expiry"
  | "top_qty";

export type SortDir = "asc" | "desc";

function normText(v: string | null | undefined): string {
  return (v ?? "").trim();
}

function parseDate(s: string | null): Date | undefined {
  return s ? new Date(s) : undefined;
}

export function sortSnapshotRows(
  rows: InventoryRow[],
  sortKey: SortKey,
  sortDir: SortDir,
): InventoryRow[] {
  const arr = [...rows];

  arr.sort((a, b) => {
    let cmp = 0;

    if (sortKey === "item_code") {
      cmp = normText(a.item_code).localeCompare(normText(b.item_code), "zh-CN");
    } else if (sortKey === "item_name") {
      cmp = a.item_name.localeCompare(b.item_name, "zh-CN");
    } else if (sortKey === "total_qty") {
      cmp = a.total_qty - b.total_qty;
    } else if (sortKey === "earliest_expiry") {
      const da = parseDate(a.earliest_expiry);
      const db = parseDate(b.earliest_expiry);
      if (da && db) cmp = da.getTime() - db.getTime();
      else if (da && !db) cmp = -1;
      else if (!da && db) cmp = 1;
      else cmp = 0;
    } else if (sortKey === "near_expiry") {
      const av = a.near_expiry ? 1 : 0;
      const bv = b.near_expiry ? 1 : 0;
      cmp = av - bv;
    } else if (sortKey === "top_qty") {
      const aTop = a.top2_locations[0]?.qty ?? 0;
      const bTop = b.top2_locations[0]?.qty ?? 0;
      cmp = aTop - bTop;
    }

    if (cmp === 0) cmp = a.item_id - b.item_id;
    return sortDir === "asc" ? cmp : -cmp;
  });

  return arr;
}
