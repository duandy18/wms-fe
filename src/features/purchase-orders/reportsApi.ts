import { apiGet } from "../../lib/api";

// 按供应商聚合报表
export interface SupplierReportRow {
  supplier_id: number | null;
  supplier_name: string;
  order_count: number;
  total_qty_cases: number;
  total_units: number;
  total_amount: string; // 后端 decimal 用 string
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
  day: string; // YYYY-MM-DD
  order_count: number;
  total_qty_cases: number;
  total_units: number;
  total_amount: string;
}

export type PurchaseReportsMode = "fact" | "plan";

export interface PurchaseReportFilters {
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
  warehouseId?: number | null;
  supplierId?: number | null;
  status?: string;

  // ✅ 口径：fact=收货事实；plan=下单计划
  mode?: PurchaseReportsMode;

  // ✅ 商品筛选：优先走 itemId（审计锚点）；兼容 itemKeyword（模糊匹配）
  itemId?: number | null;
  itemKeyword?: string;
}

function buildQuery(
  params: PurchaseReportFilters,
  opts?: { includeItemKeyword?: boolean; includeItemId?: boolean },
): string {
  const qs = new URLSearchParams();

  // ✅ 口径默认 fact（不撒谎：默认展示事实）
  qs.set("mode", params.mode ?? "fact");

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

  // ✅ items 视图：优先用 item_id，其次 item_keyword
  if (opts?.includeItemId) {
    if (params.itemId != null) {
      qs.set("item_id", String(params.itemId));
    }
  }

  // ✅ 默认不带 item_keyword，只有“按商品”才带，避免污染其他视图
  if (opts?.includeItemKeyword) {
    if (params.itemKeyword && params.itemKeyword.trim()) {
      qs.set("item_keyword", params.itemKeyword.trim());
    }
  }

  const query = qs.toString();
  return query ? `?${query}` : "";
}

export async function fetchSupplierReport(
  filters: PurchaseReportFilters,
): Promise<SupplierReportRow[]> {
  // suppliers：不带 item 相关参数
  const q = buildQuery(filters, { includeItemKeyword: false, includeItemId: false });
  return apiGet<SupplierReportRow[]>(`/purchase-reports/suppliers${q}`);
}

export async function fetchItemReport(
  filters: PurchaseReportFilters,
): Promise<ItemReportRow[]> {
  // items：带 item_id / item_keyword（优先 item_id）
  const q = buildQuery(filters, { includeItemKeyword: true, includeItemId: true });
  return apiGet<ItemReportRow[]>(`/purchase-reports/items${q}`);
}

export async function fetchDailyReport(
  filters: PurchaseReportFilters,
): Promise<DailyReportRow[]> {
  // daily：不带 item 相关参数
  const q = buildQuery(filters, { includeItemKeyword: false, includeItemId: false });
  return apiGet<DailyReportRow[]>(`/purchase-reports/daily${q}`);
}
