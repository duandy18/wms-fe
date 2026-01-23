// src/features/orders/api/types.ts

import type { DevOrderView, DevOrderFacts } from "../../dev/orders/api/index";

export type WarehouseOption = {
  id: number;
  code: string | null;
  name: string | null;
  active: boolean | null;
};

export type OrderSummary = {
  id: number;
  platform: string;
  shop_id: string;
  ext_order_no: string;

  status?: string | null;
  created_at: string; // ISO
  updated_at?: string | null;

  warehouse_id?: number | null;
  service_warehouse_id?: number | null;
  fulfillment_status?: string | null;

  warehouse_assign_mode?: string | null;

  // ✅ 后端对齐（前端不得推导）
  can_manual_assign_execution_warehouse?: boolean;
  manual_assign_hint?: string | null;

  order_amount?: number | null;
  pay_amount?: number | null;
};

export type OrdersSummaryResponse = {
  ok: boolean;
  data: OrderSummary[];
  warehouses: WarehouseOption[];
};

// ------------------------------
// Phase 5.3 Explain（只读对齐）
// ------------------------------

export type WarehouseBrief = {
  id: number;
  code: string | null;
  name: string | null;
};

export type OrderWarehouseAvailabilityLine = {
  item_id: number;
  req_qty: number;
  sku_id: string | null;
  title: string | null;
};

export type OrderWarehouseAvailabilityCell = {
  warehouse_id: number;
  item_id: number;
  available: number;
  shortage: number;
  status: "ENOUGH" | "SHORTAGE" | string;
};

export type OrderWarehouseAvailabilityResponse = {
  ok: boolean;
  order_id: number;
  scope: "DEFAULT_SERVICE_EXECUTION" | "EXPLICIT_WAREHOUSE_IDS" | string;
  warehouses: WarehouseBrief[];
  lines: OrderWarehouseAvailabilityLine[];
  matrix: OrderWarehouseAvailabilityCell[];
};

// 详情/事实暂复用 DevConsole
export type OrderView = DevOrderView;
export type OrderFacts = DevOrderFacts;
