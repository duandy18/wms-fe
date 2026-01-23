// src/features/orders/api/client.ts
import { apiGet, apiPost } from "../../../lib/api";

import type { DevOrderView, DevOrderFacts } from "../../dev/orders/api/index";
import { fetchDevOrderView, fetchDevOrderFacts } from "../../dev/orders/api/index";

import type { OrderFacts, OrderView, OrdersSummaryResponse, OrderSummary } from "./types";

export async function fetchOrdersSummary(
  params: {
    platform?: string;
    shopId?: string;
    status?: string;
    time_from?: string;
    time_to?: string;
    limit?: number;
  } = {},
): Promise<OrdersSummaryResponse> {
  const qs = new URLSearchParams();

  if (params.platform) qs.set("platform", params.platform);
  if (params.shopId) qs.set("shop_id", params.shopId);
  if (params.status) qs.set("status", params.status);
  if (params.time_from) qs.set("time_from", params.time_from);
  if (params.time_to) qs.set("time_to", params.time_to);
  if (params.limit != null) qs.set("limit", String(params.limit));

  const query = qs.toString();
  const path = query ? `/orders/summary?${query}` : `/orders/summary`;

  const resp = await apiGet<OrdersSummaryResponse>(path);
  if (!resp || typeof resp !== "object") return { ok: false, data: [], warehouses: [] };
  if (resp.ok !== true) return { ok: false, data: [], warehouses: [] };
  return {
    ok: true,
    data: Array.isArray(resp.data) ? resp.data : [],
    warehouses: Array.isArray(resp.warehouses) ? resp.warehouses : [],
  };
}

// 兼容旧调用：只要 rows
export async function fetchOrdersList(
  params: {
    platform?: string;
    shopId?: string;
    status?: string;
    time_from?: string;
    time_to?: string;
    limit?: number;
  } = {},
): Promise<OrderSummary[]> {
  const r = await fetchOrdersSummary(params);
  return r.data;
}

// 详情/事实暂复用 DevConsole
export async function fetchOrderView(params: { platform: string; shopId: string; extOrderNo: string }): Promise<OrderView> {
  return fetchDevOrderView(params) as Promise<(DevOrderView & OrderView)>;
}

export async function fetchOrderFacts(params: { platform: string; shopId: string; extOrderNo: string }): Promise<OrderFacts> {
  return fetchDevOrderFacts(params) as Promise<DevOrderFacts>;
}

export async function manualAssignFulfillmentWarehouse(args: {
  platform: string;
  shop_id: string;
  ext_order_no: string;
  warehouse_id: number;
  reason: string;
  note?: string | null;
}): Promise<{ ok: boolean }> {
  const path = `/orders/${encodeURIComponent(args.platform)}/${encodeURIComponent(args.shop_id)}/${encodeURIComponent(
    args.ext_order_no,
  )}/fulfillment/manual-assign`;

  await apiPost(path, {
    warehouse_id: args.warehouse_id,
    reason: args.reason,
    note: args.note ?? null,
  });

  return { ok: true };
}
