// src/features/inventory/outbound-dashboard/types.ts

// ---------- 类型定义（与 v2 API 对齐） ------------

export type DistributionPoint = {
  hour: string;
  orders: number;
  pick_qty: number;
};

export type OutboundToday = {
  day: string;
  platform: string;
  total_orders: number;
  success_orders: number;
  success_rate: number;
  fallback_times: number;
  fallback_rate: number;
  fefo_hit_rate: number;
  distribution: DistributionPoint[];
};

export type RangeDaySummary = {
  day: string;
  total_orders: number;
  success_rate: number;
  fallback_rate: number;
  fefo_hit_rate: number;
};

export type RangeResponse = {
  platform: string;
  days: RangeDaySummary[];
};

export type WarehouseMetric = {
  warehouse_id: number;
  total_orders: number;
  success_orders: number;
  success_rate: number;
  pick_qty: number;
};

export type WarehouseResponse = {
  day: string;
  platform: string;
  warehouses: WarehouseMetric[];
};

export type FailureDetail = {
  ref: string;
  trace_id?: string | null;
  fail_point: string;
  message?: string | null;
};

export type FailuresResponse = {
  day: string;
  platform: string;
  routing_failed: number;
  pick_failed: number;
  ship_failed: number;
  inventory_insufficient: number;
  details: FailureDetail[];
};

export type FefoItemRisk = {
  item_id: number;
  sku: string;
  name: string;
  near_expiry_batches: number;
  fefo_hit_rate_7d: number;
  risk_score: number;
};

export type FefoRiskResponse = {
  as_of: string;
  items: FefoItemRisk[];
};

export type ShopMetric = {
  shop_id: string;
  total_orders: number;
  success_orders: number;
  success_rate: number;
  fallback_times: number;
  fallback_rate: number;
};

export type ShopResponse = {
  day: string;
  platform: string;
  shops: ShopMetric[];
};

// ------------- Tabs 枚举 -----------------------------

export type TabId =
  | "overview"
  | "trends"
  | "hourly"
  | "warehouse"
  | "shop"
  | "failures"
  | "fefo";

export const TAB_LABELS: { id: TabId; label: string }[] = [
  { id: "overview", label: "总览" },
  { id: "trends", label: "出库趋势" },
  { id: "hourly", label: "按小时分布" },
  { id: "warehouse", label: "按仓库拆分" },
  { id: "shop", label: "按店铺拆分" },
  { id: "failures", label: "出库失败诊断" },
  { id: "fefo", label: "FEFO 风险" },
];

export const DEFAULT_RANGE_DAYS = 7;
