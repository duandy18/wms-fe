import { apiGet } from "../../lib/api";

// 按供应商聚合报表
export interface SupplierReportRow {
  supplier_id: number | null;
  supplier_name: string;
  order_count: number;
  total_qty_cases: number;
  total_units: number;
  total_amount: string;      // 后端 decimal 用 string
  avg_unit_price: string | null;
}

// 按商品聚合报表
export interface ItemReportRow {
  item_id: number;
  item_sku: string | null;
  item_name: string | null;
  spec_text: string | null;
  supplier_id: number | null;
  supplier_name: string | null;
  order_count: number;
  total_qty_cases: number;
  total_units: number;
  total_amount: string;
  avg_unit_price: string | null;
}

// 按天聚合报表
export interface DailyReportRow {
  day: string;               // YYYY-MM-DD
  order_count: number;
  total_qty_cases: number;
  total_units: number;
  total_amount: string;
}

export interface PurchaseReportFilters {
  dateFrom?: string;      // YYYY-MM-DD
  dateTo?: string;        // YYYY-MM-DD
  warehouseId?: number | null;
  supplierId?: number | null;
  status?: string;
}

function buildQuery(params: PurchaseReportFilters): string {
  const qs = new URLSearchParams();
  if (params.dateFrom) qs.set("date_from", params.dateFrom);
  if (params.dateTo) qs.set("date_to", params.dateTo);
  if (params.warehouseId != null) {
    qs.set("warehouse_id", String(params.warehouseId));
  }
  if (params.supplierId != null) {
    qs.set("supplier_id", String(params.supplierId));
  }
  if (params.status) {
    qs.set("status", params.status);
  }
  const query = qs.toString();
  return query ? `?${query}` : "";
}

export async function fetchSupplierReport(
  filters: PurchaseReportFilters,
): Promise<SupplierReportRow[]> {
  const q = buildQuery(filters);
  return apiGet<SupplierReportRow[]>(`/purchase-reports/suppliers${q}`);
}

export async function fetchItemReport(
  filters: PurchaseReportFilters,
): Promise<ItemReportRow[]> {
  const q = buildQuery(filters);
  return apiGet<ItemReportRow[]>(`/purchase-reports/items${q}`);
}

export async function fetchDailyReport(
  filters: PurchaseReportFilters,
): Promise<DailyReportRow[]> {
  const q = buildQuery(filters);
  return apiGet<DailyReportRow[]>(`/purchase-reports/daily${q}`);
}
