// src/features/orders/api/stats.ts
import { apiGet } from "../../../lib/api";

// ================================
// 订单统计（/orders/stats/*）
// ================================

export interface OrdersDailyStats {
  date: string; // YYYY-MM-DD
  platform?: string | null;
  shop_id?: string | null;
  orders_created: number;
  orders_shipped: number;
  orders_returned: number;
}

export interface OrdersTrendItem {
  date: string;
  orders_created: number;
  orders_shipped: number;
  orders_returned: number;
  return_rate: number; // 0 ~ 1
}

export interface OrdersTrendResponse {
  days: OrdersTrendItem[];
}

export async function fetchOrdersDailyStats(
  params: {
    date?: string; // YYYY-MM-DD
    platform?: string;
    shopId?: string;
  } = {},
): Promise<OrdersDailyStats> {
  const qs = new URLSearchParams();
  if (params.date) qs.set("date", params.date);
  if (params.platform) qs.set("platform", params.platform);
  if (params.shopId) qs.set("shop_id", params.shopId);

  const query = qs.toString();
  const path = query ? `/orders/stats/daily?${query}` : `/orders/stats/daily`;
  return apiGet<OrdersDailyStats>(path);
}

export async function fetchOrdersLast7Trend(
  params: {
    platform?: string;
    shopId?: string;
  } = {},
): Promise<OrdersTrendResponse> {
  const qs = new URLSearchParams();
  if (params.platform) qs.set("platform", params.platform);
  if (params.shopId) qs.set("shop_id", params.shopId);

  const query = qs.toString();
  const path = query ? `/orders/stats/last7?${query}` : `/orders/stats/last7`;
  return apiGet<OrdersTrendResponse>(path);
}

// ================================
// SLA 统计（发货耗时 / 准时率）
// ================================

export interface OrdersSlaStats {
  total_orders: number;
  avg_ship_hours: number | null;
  p95_ship_hours: number | null;
  on_time_orders: number;
  on_time_rate: number; // 0~1
}

export async function fetchOrdersSlaStats(
  params: {
    time_from?: string; // ISO
    time_to?: string; // ISO
    platform?: string;
    shopId?: string;
    sla_hours?: number; // 默认 24
  } = {},
): Promise<OrdersSlaStats> {
  const qs = new URLSearchParams();

  if (params.time_from) qs.set("time_from", params.time_from);
  if (params.time_to) qs.set("time_to", params.time_to);
  if (params.platform) qs.set("platform", params.platform);
  if (params.shopId) qs.set("shop_id", params.shopId);
  if (params.sla_hours != null) qs.set("sla_hours", String(params.sla_hours));

  const query = qs.toString();
  const path = query ? `/orders/stats/sla?${query}` : `/orders/stats/sla`;
  return apiGet<OrdersSlaStats>(path);
}
