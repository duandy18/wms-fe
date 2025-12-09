// src/features/inventory/outbound-metrics/types.ts

export interface OutboundMetrics {
  day: string; // YYYY-MM-DD
  platform: string;
  total_orders: number;
  success_orders: number;
  success_rate: number; // %
  fallback_times: number;
  fallback_rate: number; // %
  fefo_hit_rate: number; // %
}

export interface OutboundWarehouseMetric {
  warehouse_id: number;
  orders_created: number;
  ship_commits: number;
  pick_qty: number;
}

export interface OutboundMetricsResponse {
  day: string;
  platform: string;
  warehouses: OutboundWarehouseMetric[];
}
