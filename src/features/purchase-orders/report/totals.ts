// src/features/purchase-orders/report/totals.ts

import type { PurchaseOrderWithLines } from "../api";

export function parseMoney(v: string | null | undefined): number {
  if (!v) return 0;
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}

export function formatTs(ts: string | null | undefined): string {
  return ts ? ts.replace("T", " ").replace("Z", "") : "-";
}

export function calcTotals(po: PurchaseOrderWithLines): {
  totalAmount: number;
  lineCount: number;
  totalQtyCases: number;
  totalUnits: number;
} {
  const totalAmount = parseMoney(po.total_amount);
  const lineCount = po.lines.length;

  const totalQtyCases = po.lines.reduce(
    (sum, l) => sum + (l.qty_cases ?? l.qty_ordered ?? 0),
    0,
  );

  const totalUnits = po.lines.reduce(
    (sum, l) => sum + (l.qty_cases ?? l.qty_ordered ?? 0) * (l.units_per_case ?? 1),
    0,
  );

  return { totalAmount, lineCount, totalQtyCases, totalUnits };
}
