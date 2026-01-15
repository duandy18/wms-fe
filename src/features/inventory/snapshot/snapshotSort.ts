// src/features/inventory/snapshot/snapshotSort.ts
import type { InventoryRow } from "./api";

export type SortKey =
  | "item_code"
  | "item_name"
  | "total_qty" // 兼容名：映射到切片 qty
  | "warehouse_id" // ✅ 新增：按仓库聚合（排序）
  | "batch_code" // ✅ 新增：按批次聚合（排序）
  | "expiry_date" // ✅ 切片级到期日
  | "near_expiry";

export type SortDir = "asc" | "desc";

function normText(v: string | null | undefined): string {
  return (v ?? "").trim();
}

function parseDate(s: string | null | undefined): Date | undefined {
  return s ? new Date(s) : undefined;
}

function normBatch(v: string | null | undefined): string {
  const t = (v ?? "").trim();
  return t || "NO-BATCH";
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
      // 兼容名：批次库存 qty（base）
      cmp = (a.qty ?? 0) - (b.qty ?? 0);
    } else if (sortKey === "warehouse_id") {
      cmp = (a.warehouse_id ?? 0) - (b.warehouse_id ?? 0);
    } else if (sortKey === "batch_code") {
      cmp = normBatch(a.batch_code).localeCompare(normBatch(b.batch_code), "zh-CN");
    } else if (sortKey === "expiry_date") {
      const da = parseDate(a.expiry_date);
      const db = parseDate(b.expiry_date);
      if (da && db) cmp = da.getTime() - db.getTime();
      else if (da && !db) cmp = -1;
      else if (!da && db) cmp = 1;
      else cmp = 0;
    } else if (sortKey === "near_expiry") {
      const av = a.near_expiry ? 1 : 0;
      const bv = b.near_expiry ? 1 : 0;
      cmp = av - bv;
    }

    // 稳定排序，避免同 key 下抖动（全部是“事实切片”维度）
    if (cmp === 0) cmp = a.item_id - b.item_id;
    if (cmp === 0) cmp = (a.warehouse_id ?? 0) - (b.warehouse_id ?? 0);
    if (cmp === 0) cmp = normBatch(a.batch_code).localeCompare(normBatch(b.batch_code), "zh-CN");

    return sortDir === "asc" ? cmp : -cmp;
  });

  return arr;
}
