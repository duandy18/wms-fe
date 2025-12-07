// src/features/dev/orders/api.ts
import { apiGet, apiPost } from "../../../lib/api";

// ---------------------------------------------------------------------------
// 订单基础类型
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
  warehouse_id?: number | null;
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
  key: string; // created / reserved / reserved_consumed / outbound / shipped / returned
  label: string; // 中文标签
  ts: string | null; // ISO 时间字符串或 null
  present: boolean; // 该阶段是否存在
  description: string; // 解释说明（含 fallback 说明）
  source?: string | null; // 事件来源（ledger / reservation / outbound / audit / order / reservation_consumed）
  ref?: string | null; // 业务 ref（一般是订单 ref）
  sla_bucket?: OrderLifecycleSlaBucket | null;
  evidence_type?: string | null; // 证据类型（explicit / fallback_first_negative_ledger 等）
  evidence?: Record<string, unknown> | null; // 裁剪后的 raw 字段（方便 Tooltip 展示）
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

/**
 * 基于 trace_id 拉取订单生命周期 v2（后端官方推断）。
 */
export async function fetchOrderLifecycleV2(
  traceId: string,
): Promise<OrderLifecycleV2Response> {
  const path = `/diagnostics/lifecycle/order-v2?trace_id=${encodeURIComponent(
    traceId,
  )}`;
  return apiGet<OrderLifecycleV2Response>(path);
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

// ensure-warehouse 返回
export interface DevEnsureWarehouseResult {
  ok: boolean;
  order_id: number;
  platform: string;
  shop_id: string;
  ext_order_no: string;
  store_id: number | null;
  warehouse_id: number | null;
  source: string; // "order" | "store_binding" | 其他
  message?: string | null;
}

// ---------------------------------------------------------------------------
/* DevConsole 查询订单 + Trace */
// ---------------------------------------------------------------------------

export async function fetchDevOrderView(params: {
  platform: string;
  shopId: string;
  extOrderNo: string;
}): Promise<DevOrderView> {
  const { platform, shopId, extOrderNo } = params;
  return apiGet(
    `/dev/orders/${encodeURIComponent(platform)}/${encodeURIComponent(
      shopId,
    )}/${encodeURIComponent(extOrderNo)}`,
  );
}

export async function fetchTraceById(
  traceId: string,
): Promise<TraceResponse> {
  return apiGet(`/debug/trace/${encodeURIComponent(traceId)}`);
}

// ---------------------------------------------------------------------------
// DevConsole：订单事实层 & 对账 & 列表
// ---------------------------------------------------------------------------

export async function fetchDevOrderFacts(params: {
  platform: string;
  shopId: string;
  extOrderNo: string;
}): Promise<DevOrderFacts> {
  const { platform, shopId, extOrderNo } = params;
  return apiGet(
    `/dev/orders/${encodeURIComponent(platform)}/${encodeURIComponent(
      shopId,
    )}/${encodeURIComponent(extOrderNo)}/facts`,
  );
}

/** 单订单对账（不回写，只返回 issues + 行事实） */
export async function reconcileOrderById(
  orderId: number,
): Promise<DevOrderReconcileResult> {
  return apiGet(`/dev/orders/by-id/${orderId}/reconcile`);
}

/** 订单 summary 列表（轻量头信息） */
export async function listDevOrdersSummary(params: {
  platform?: string;
  shopId?: string;
  status?: string;
  time_from?: string;
  time_to?: string;
  limit?: number;
} = {}): Promise<DevOrderSummary[]> {
  const qs = new URLSearchParams();
  if (params.platform) qs.set("platform", params.platform);
  if (params.shopId) qs.set("shop_id", params.shopId);
  if (params.status) qs.set("status", params.status);
  if (params.time_from) qs.set("time_from", params.time_from);
  if (params.time_to) qs.set("time_to", params.time_to);
  if (params.limit != null) qs.set("limit", String(params.limit));

  const query = qs.toString();
  const path = query ? `/dev/orders?${query}` : "/dev/orders";
  return apiGet<DevOrderSummary[]>(path);
}

/** 按时间窗口批量修账（apply_counters） */
export async function reconcileOrdersRange(payload: {
  time_from: string;
  time_to: string;
  limit?: number;
}): Promise<DevReconcileRangeResult> {
  return apiPost<DevReconcileRangeResult>(
    "/dev/orders/reconcile-range",
    payload,
  );
}

// ---------------------------------------------------------------------------
// V2 履约动作：reserve / pick / ship
// 对应后端 orders_fulfillment_v2.py
// ---------------------------------------------------------------------------

// ---- reserve ----

export async function reserveOrder(params: {
  platform: string;
  shopId: string;
  extOrderNo: string;
  lines: { item_id: number; qty: number }[];
}) {
  const { platform, shopId, extOrderNo, lines } = params;
  return apiPost(`/orders/${platform}/${shopId}/${extOrderNo}/reserve`, {
    lines,
  });
}

// ---- pick ----

export async function pickOrder(params: {
  platform: string;
  shopId: string;
  extOrderNo: string;
  warehouse_id: number;
  batch_code: string;
  lines: { item_id: number; qty: number }[];
}) {
  const { platform, shopId, extOrderNo, ...body } = params;
  return apiPost(`/orders/${platform}/${shopId}/${extOrderNo}/pick`, body);
}

// ---- ship ----

export async function shipOrder(params: {
  platform: string;
  shopId: string;
  extOrderNo: string;
  warehouse_id: number;
  lines: { item_id: number; qty: number }[];
}) {
  const { platform, shopId, extOrderNo, ...body } = params;
  return apiPost(`/orders/${platform}/${shopId}/${extOrderNo}/ship`, body);
}

// ⭐ 新增：DevConsole 调用 /ship/confirm，写发货事件 + shipping_records
export async function confirmShipViaDev(params: {
  platform: string;
  shopId: string;
  extOrderNo: string;
  carrier?: string;
  traceId?: string | null;
}) {
  const { platform, shopId, extOrderNo, carrier, traceId } = params;
  const plat = platform.toUpperCase();
  const ref = `ORD:${plat}:${shopId}:${extOrderNo}`;
  return apiPost("/ship/confirm", {
    ref,
    platform: plat,
    shop_id: shopId,
    carrier,
    trace_id: traceId ?? undefined,
  });
}

// ---------------------------------------------------------------------------
// Demo ingest：生成一条测试订单
// ---------------------------------------------------------------------------

export async function ingestDemoOrder(params: {
  platform?: string;
  shopId?: string;
} = {}): Promise<DevDemoOrderOut> {
  const qs = new URLSearchParams();
  if (params.platform) qs.set("platform", params.platform);
  if (params.shopId) qs.set("shop_id", params.shopId);
  const query = qs.toString();
  const path = query ? `/dev/orders/demo?${query}` : "/dev/orders/demo";
  return apiPost<DevDemoOrderOut>(path, {});
}

// ---------------------------------------------------------------------------
// Dev-only：确保订单已有仓库（按店铺绑定解析并写回）
// ---------------------------------------------------------------------------

export async function ensureOrderWarehouse(input: {
  platform: string;
  shopId: string;
  extOrderNo: string;
}): Promise<DevEnsureWarehouseResult> {
  const { platform, shopId, extOrderNo } = input;
  const path = `/dev/orders/${encodeURIComponent(
    platform,
  )}/${encodeURIComponent(shopId)}/${encodeURIComponent(
    extOrderNo,
  )}/ensure-warehouse`;
  return apiPost<DevEnsureWarehouseResult>(path, {});
}
