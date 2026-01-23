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

// 详情/事实暂复用 DevConsole
export type OrderView = DevOrderView;
export type OrderFacts = DevOrderFacts;
