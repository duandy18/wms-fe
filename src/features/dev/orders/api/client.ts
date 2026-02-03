// src/features/dev/orders/api/client.ts
import { apiGet, apiPost } from "../../../../lib/api";
import type {
  DevOrderFacts,
  DevOrderReconcileResult,
  DevOrderSummary,
  DevReconcileRangeResult,
  DevDemoOrderOut,
  DevEnsureWarehouseResult,
  DevOrderView,
  OrderLifecycleV2Response,
  TraceResponse,
} from "./types";

// 生命周期 v2（基于 trace_id）
export async function fetchOrderLifecycleV2(traceId: string): Promise<OrderLifecycleV2Response> {
  const path = `/diagnostics/lifecycle/order-v2?trace_id=${encodeURIComponent(traceId)}`;
  return apiGet<OrderLifecycleV2Response>(path);
}

// 订单头
export async function fetchDevOrderView(params: {
  platform: string;
  shopId: string;
  extOrderNo: string;
}): Promise<DevOrderView> {
  const { platform, shopId, extOrderNo } = params;
  return apiGet<DevOrderView>(
    `/dev/orders/${encodeURIComponent(platform)}/${encodeURIComponent(shopId)}/${encodeURIComponent(extOrderNo)}`,
  );
}

// Trace
export async function fetchTraceById(traceId: string): Promise<TraceResponse> {
  return apiGet<TraceResponse>(`/debug/trace/${encodeURIComponent(traceId)}`);
}

// facts
export async function fetchDevOrderFacts(params: {
  platform: string;
  shopId: string;
  extOrderNo: string;
}): Promise<DevOrderFacts> {
  const { platform, shopId, extOrderNo } = params;
  return apiGet<DevOrderFacts>(
    `/dev/orders/${encodeURIComponent(platform)}/${encodeURIComponent(shopId)}/${encodeURIComponent(extOrderNo)}/facts`,
  );
}

// reconcile
export async function reconcileOrderById(orderId: number): Promise<DevOrderReconcileResult> {
  return apiGet<DevOrderReconcileResult>(`/dev/orders/by-id/${orderId}/reconcile`);
}

// summary list
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

// reconcile range
export async function reconcileOrdersRange(payload: {
  time_from: string;
  time_to: string;
  limit?: number;
}): Promise<DevReconcileRangeResult> {
  return apiPost<DevReconcileRangeResult>("/dev/orders/reconcile-range", payload);
}

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

// ship confirm（dev）
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

// demo ingest
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

// ensure-warehouse（dev-only）
export async function ensureOrderWarehouse(input: {
  platform: string;
  shopId: string;
  extOrderNo: string;
}): Promise<DevEnsureWarehouseResult> {
  const { platform, shopId, extOrderNo } = input;
  const path = `/dev/orders/${encodeURIComponent(platform)}/${encodeURIComponent(shopId)}/${encodeURIComponent(
    extOrderNo,
  )}/ensure-warehouse`;
  return apiPost<DevEnsureWarehouseResult>(path, {});
}
