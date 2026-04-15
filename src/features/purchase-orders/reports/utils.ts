// 拆分说明：从 PurchaseReportsPage.tsx 抽出纯函数工具，避免页面层继续承载格式化与 query 拼装逻辑。路径：src/features/purchase-orders/reports/utils.ts

import type { TimeMode } from "./types";

export function fmtMoney(v: string | number | null | undefined): string {
  if (v == null) return "—";
  const n = typeof v === "number" ? v : Number(String(v).trim());
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(2);
}

export function fmtText(v: string | null | undefined): string {
  const s = String(v ?? "").trim();
  return s || "—";
}

export function getTimeModeLabel(timeMode: TimeMode): string {
  switch (timeMode) {
    case "purchase_time":
      return "按采购时间";
    case "last_received":
      return "按最后收货时间";
    default:
      return timeMode;
  }
}

export function appendCommonFilters(
  qs: URLSearchParams,
  options: {
    dateFrom: string;
    dateTo: string;
    warehouseId: string;
    supplierId: string;
    itemId: string;
  }
): void {
  if (options.dateFrom) qs.set("date_from", options.dateFrom);
  if (options.dateTo) qs.set("date_to", options.dateTo);
  if (options.warehouseId.trim()) qs.set("warehouse_id", options.warehouseId.trim());
  if (options.supplierId.trim()) qs.set("supplier_id", options.supplierId.trim());
  if (options.itemId.trim()) qs.set("item_id", options.itemId.trim());
}
