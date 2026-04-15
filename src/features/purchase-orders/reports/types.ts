// 拆分说明：从 PurchaseReportsPage.tsx 抽出报表页类型定义，避免页面文件继续承载合同与本地状态类型。路径：src/features/purchase-orders/reports/types.ts

export type ReportTab = "items" | "suppliers" | "daily";
export type TimeMode = "purchase_time" | "last_received";

export interface ItemPurchaseReportItem {
  item_id: number;
  item_sku: string | null;
  item_name: string | null;
  barcode: string | null;
  brand: string | null;
  category: string | null;
  spec_text: string | null;
  supplier_id: number | null;
  supplier_name: string | null;
  order_count: number;
  total_qty_cases: number;
  total_units: number;
  total_amount: string | null;
  avg_unit_price: string | null;
}

export interface SupplierPurchaseReportItem {
  supplier_id: number | null;
  supplier_name: string;
  order_count: number;
  total_qty_cases: number;
  total_units: number;
  total_amount: string | null;
  avg_unit_price: string | null;
}

export interface DailyPurchaseReportItem {
  day: string;
  order_count: number;
  total_qty_cases: number;
  total_units: number;
  total_amount: string | null;
}

export interface SummaryPurchaseReportItem {
  order_count: number;
  supplier_count: number;
  item_count: number;
  total_qty_cases: number;
  total_units: number;
  total_amount: string;
  avg_unit_price: string | null;
}

export type WarehouseOut = {
  id: number;
  name: string;
  active?: boolean;
};

export type WarehouseListOut = {
  ok: boolean;
  data: WarehouseOut[];
};

export type SupplierOption = {
  id: number;
  code?: string | null;
  name: string;
};

export type ItemOption = {
  id: number;
  name?: string | null;
  sku?: string | null;
};
