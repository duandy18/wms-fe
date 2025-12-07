// src/features/inventory/outbound-metrics/types.ts

export interface OutboundWarehouseMetric {
  warehouse_id: number;
  orders_created: number;
  ship_commits: number;
  pick_qty: number;
}

export interface OutboundMetricsResponse {
  day: string; // YYYY-MM-DD
  platform: string;
  warehouses: OutboundWarehouseMetric[];
}
