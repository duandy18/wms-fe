// 拆分说明：从报表页控制器中抽出 API 访问与 query 组装，避免 model 层继续承载接口路径细节。路径：src/features/purchase-orders/reports/api/reportsApi.ts

import { apiGet } from "../../../../lib/api";
import type {
  DailyPurchaseReportItem,
  ItemPurchaseReportItem,
  SummaryPurchaseReportItem,
  SupplierPurchaseReportItem,
  TimeMode,
  WarehouseListOut,
} from "../types";

export type ItemPurchaseReportLineItem = {
  po_id: number;
  po_no: string;
  po_line_id: number;
  line_no: number;
  warehouse_id: number;
  supplier_id: number;
  supplier_name: string;
  purchase_time: string;
  purchase_uom_name_snapshot: string;
  qty_ordered_input: number;
  qty_ordered_base: number;
  supply_price_snapshot: string | null;
  discount_amount_snapshot: string;
  planned_line_amount: string;
  line_completion_status: string;
  last_received_at: string | null;
};

export type ReportFilters = {
  dateFrom: string;
  dateTo: string;
  warehouseId: string;
  supplierId: string;
  itemId: string;
};

function appendCommonFilters(qs: URLSearchParams, filters: ReportFilters): void {
  if (filters.dateFrom) qs.set("date_from", filters.dateFrom);
  if (filters.dateTo) qs.set("date_to", filters.dateTo);
  if (filters.warehouseId.trim()) qs.set("warehouse_id", filters.warehouseId.trim());
  if (filters.supplierId.trim()) qs.set("supplier_id", filters.supplierId.trim());
  if (filters.itemId.trim()) qs.set("item_id", filters.itemId.trim());
}

function buildQuery(filters: ReportFilters, timeMode?: TimeMode): string {
  const qs = new URLSearchParams();
  appendCommonFilters(qs, filters);
  if (timeMode) qs.set("time_mode", timeMode);
  return qs.toString();
}

export async function fetchReportSummary(
  filters: ReportFilters,
  options: { tab: "items" | "suppliers" | "daily"; timeMode: TimeMode }
): Promise<SummaryPurchaseReportItem> {
  const summaryTimeMode = options.tab === "daily" ? "last_received" : options.timeMode;
  const q = buildQuery(filters, summaryTimeMode);
  return apiGet<SummaryPurchaseReportItem>(
    q ? `/purchase-reports/summary?${q}` : "/purchase-reports/summary"
  );
}

export async function fetchItemReports(
  filters: ReportFilters,
  timeMode: TimeMode
): Promise<ItemPurchaseReportItem[]> {
  const q = buildQuery(filters, timeMode);
  return apiGet<ItemPurchaseReportItem[]>(
    q ? `/purchase-reports/items?${q}` : "/purchase-reports/items"
  );
}

export async function fetchItemReportLines(
  itemId: number,
  filters: ReportFilters,
  timeMode: TimeMode
): Promise<ItemPurchaseReportLineItem[]> {
  const q = buildQuery(
    {
      ...filters,
      itemId: "",
    },
    timeMode
  );
  return apiGet<ItemPurchaseReportLineItem[]>(
    q ? `/purchase-reports/items/${itemId}/lines?${q}` : `/purchase-reports/items/${itemId}/lines`
  );
}

export async function fetchSupplierReports(
  filters: ReportFilters,
  timeMode: TimeMode
): Promise<SupplierPurchaseReportItem[]> {
  const q = buildQuery(filters, timeMode);
  return apiGet<SupplierPurchaseReportItem[]>(
    q ? `/purchase-reports/suppliers?${q}` : "/purchase-reports/suppliers"
  );
}

export async function fetchDailyReports(filters: ReportFilters): Promise<DailyPurchaseReportItem[]> {
  const q = buildQuery(filters);
  return apiGet<DailyPurchaseReportItem[]>(
    q ? `/purchase-reports/daily?${q}` : "/purchase-reports/daily"
  );
}

export async function fetchWarehouses(): Promise<WarehouseListOut> {
  return apiGet<WarehouseListOut>("/warehouses?active=true");
}
