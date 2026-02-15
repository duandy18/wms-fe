// src/features/orders/api/types.ts

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

  // ✅ 内部店铺主键（stores.id）：用于治理/解析卡 replay 入参（前端不得推导）
  store_id?: number | null;

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
// Platform Order Mirror（只读）
// ------------------------------

export type PlatformOrderAddress = {
  receiver_name?: string | null;
  receiver_phone?: string | null;
  province?: string | null;
  city?: string | null;
  district?: string | null;
  detail?: string | null;
  zipcode?: string | null;
};

export type PlatformOrderLine = {
  sku?: string | null;
  title?: string | null;
  qty: number;
  item_id?: number | null;
  spec?: string | null;

  // ✅ 镜像展示用（不参与作业逻辑）
  price?: number | null;
  discount?: number | null;
  amount?: number | null;

  // 平台原始扩展字段（JSONB）
  extras?: Record<string, unknown> | null;
};

export type PlatformOrder = {
  id: number;
  platform: string;
  shop_id: string;
  ext_order_no: string;

  status?: string | null;
  created_at: string; // ISO
  updated_at?: string | null;

  order_amount?: number | null;
  pay_amount?: number | null;

  buyer_name?: string | null;
  buyer_phone?: string | null;

  address?: PlatformOrderAddress | null;
  items: PlatformOrderLine[];

  // ✅ 后端 /orders/.../view 返回：orders/order_items/order_address 的 json-friendly bundle
  raw?: Record<string, unknown> | null;
};

export type OrderView = {
  ok: boolean;
  order: PlatformOrder;
};

export type OrderFactItem = {
  item_id: number;
  sku_id?: string | null;
  title?: string | null;

  qty_ordered: number;
  qty_shipped: number;
  qty_returned: number;
  qty_remaining_refundable: number;
};

export type OrderFacts = {
  ok: boolean;
  items: OrderFactItem[];
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
