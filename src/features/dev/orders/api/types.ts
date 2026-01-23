// src/features/dev/orders/api/types.ts

// ---------------------------------------------------------------------------
// 订单基础类型（DevConsole /dev/orders/* 返回）
// ---------------------------------------------------------------------------

export interface DevOrderInfo {
  id: number;
  platform: string;
  shop_id: string;
  ext_order_no: string;

  status?: string | null;
  trace_id?: string | null;

  created_at: string;
  updated_at?: string | null;

  // 执行仓（可能为空）
  warehouse_id?: number | null;

  // Phase 5：服务归属仓 + 履约状态（后端已补齐）
  service_warehouse_id?: number | null;
  fulfillment_status?: string | null;

  // Phase 5.2：执行仓来源（后端派生字段）
  warehouse_assign_mode?: string | null;

  order_amount?: number | null;
  pay_amount?: number | null;
}

export interface DevOrderView {
  order: DevOrderInfo;
  trace_id?: string | null;
}

// ---------------------------------------------------------------------------
// Trace 类型
// ---------------------------------------------------------------------------

export interface TraceEvent {
  ts: string | null;
  source: string;
  kind: string;
  ref?: string | null;
  summary: string;
  raw: Record<string, unknown>;
}

export interface TraceResponse {
  trace_id: string;
  warehouse_id?: number | null;
  events: TraceEvent[];
}

// ---------------------------------------------------------------------------
// 生命周期 v2（基于 trace_id）
// ---------------------------------------------------------------------------

export type OrderLifecycleSlaBucket = "ok" | "warn" | "breach";
export type OrderLifecycleHealth = "OK" | "WARN" | "BAD";

export interface OrderLifecycleStageV2 {
  key: string;
  label: string;
  ts: string | null;
  present: boolean;
  description: string;
  source?: string | null;
  ref?: string | null;
  sla_bucket?: OrderLifecycleSlaBucket | null;
  evidence_type?: string | null;
  evidence?: Record<string, unknown> | null;
}

export interface OrderLifecycleSummaryV2 {
  health: OrderLifecycleHealth;
  issues: string[];
}

export interface OrderLifecycleV2Response {
  ok: boolean;
  trace_id: string;
  stages: OrderLifecycleStageV2[];
  summary: OrderLifecycleSummaryV2;
}

// ---------------------------------------------------------------------------
// 订单事实层（/dev/orders/{plat}/{shop}/{ext}/facts）
// ---------------------------------------------------------------------------

export interface DevOrderItemFact {
  item_id: number;
  sku_id?: string | null;
  title?: string | null;

  qty_ordered: number;
  qty_shipped: number;
  qty_returned: number;
  qty_remaining_refundable: number;
}

export interface DevOrderFacts {
  order: DevOrderInfo;
  items: DevOrderItemFact[];
}

// ---------------------------------------------------------------------------
// 对账结果（/dev/orders/by-id/{id}/reconcile）
// ---------------------------------------------------------------------------

export interface DevOrderReconcileLine {
  item_id: number;
  sku_id?: string | null;
  title?: string | null;
  qty_ordered: number;
  qty_shipped: number;
  qty_returned: number;
  remaining_refundable: number;
}

export interface DevOrderReconcileResult {
  order_id: number;
  platform: string;
  shop_id: string;
  ext_order_no: string;
  issues: string[];
  lines: DevOrderReconcileLine[];
}

// ---------------------------------------------------------------------------
// summary 列表 & 范围修账（/dev/orders, /dev/orders/reconcile-range）
// ---------------------------------------------------------------------------

export interface DevOrderSummary {
  id: number;
  platform: string;
  shop_id: string;
  ext_order_no: string;

  status?: string | null;
  created_at: string;
  updated_at?: string | null;

  warehouse_id?: number | null;

  service_warehouse_id?: number | null;
  fulfillment_status?: string | null;
  warehouse_assign_mode?: string | null;

  order_amount?: number | null;
  pay_amount?: number | null;
}

export interface DevReconcileRangeResult {
  count: number;
  order_ids: number[];
}

// demo ingest 返回
export interface DevDemoOrderOut {
  order_id: number;
  platform: string;
  shop_id: string;
  ext_order_no: string;
  trace_id?: string | null;
}

// ensure-warehouse 返回（dev-only）
export interface DevEnsureWarehouseResult {
  ok: boolean;
  order_id: number;
  platform: string;
  shop_id: string;
  ext_order_no: string;
  store_id: number | null;
  warehouse_id: number | null;
  source: string;
  message?: string | null;
}
