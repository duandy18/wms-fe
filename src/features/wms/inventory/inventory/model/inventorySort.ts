import type { InventoryRow } from "@/features/wms/inventory/api/contracts";

export type SortKey =
  | "item_code"
  | "item_name"
  | "warehouse_id"
  | "lot_code"
  | "qty"
  | "expiry_date"
  | "near_expiry";

export type SortDir = "asc" | "desc";

function normText(v: string | null | undefined): string {
  return (v ?? "").trim();
}

function parseDate(s: string | null | undefined): Date | undefined {
  return s ? new Date(s) : undefined;
}

function normLot(v: string | null | undefined): string {
  const t = (v ?? "").trim();
  return t || "NO-LOT";
}

export function sortInventoryRows(
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
      cmp = normText(a.item_name).localeCompare(normText(b.item_name), "zh-CN");
    } else if (sortKey === "warehouse_id") {
      cmp = (a.warehouse_id ?? 0) - (b.warehouse_id ?? 0);
    } else if (sortKey === "lot_code") {
      cmp = normLot(a.lot_code).localeCompare(normLot(b.lot_code), "zh-CN");
    } else if (sortKey === "qty") {
      cmp = (a.qty ?? 0) - (b.qty ?? 0);
    } else if (sortKey === "expiry_date") {
      const da = parseDate(a.expiry_date);
      const db = parseDate(b.expiry_date);
      if (da && db) cmp = da.getTime() - db.getTime();
      else if (da && !db) cmp = -1;
      else if (!da && db) cmp = 1;
      else cmp = 0;
    } else if (sortKey === "near_expiry") {
      cmp = (a.near_expiry ? 1 : 0) - (b.near_expiry ? 1 : 0);
    }

    if (cmp === 0) cmp = a.item_id - b.item_id;
    if (cmp === 0) cmp = (a.warehouse_id ?? 0) - (b.warehouse_id ?? 0);
    if (cmp === 0) cmp = normLot(a.lot_code).localeCompare(normLot(b.lot_code), "zh-CN");

    return sortDir === "asc" ? cmp : -cmp;
  });

  return arr;
}
