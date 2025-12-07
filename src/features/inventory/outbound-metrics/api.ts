// src/features/inventory/outbound-metrics/api.ts
import { apiGet } from "../../../lib/api";
import type { OutboundMetricsResponse } from "./types";

/**
 * 今天的出库指标：GET /metrics/outbound/today?platform=...
 */
export async function fetchOutboundMetricsToday(
  platform: string,
): Promise<OutboundMetricsResponse> {
  const url = `/metrics/outbound/today?platform=${encodeURIComponent(
    platform,
  )}`;
  return apiGet<OutboundMetricsResponse>(url);
}

/**
 * 指定日期的出库指标：GET /metrics/outbound/{day}?platform=...
 * day 需为 YYYY-MM-DD
 */
export async function fetchOutboundMetricsByDay(
  day: string,
  platform: string,
): Promise<OutboundMetricsResponse> {
  const url = `/metrics/outbound/${encodeURIComponent(
    day,
  )}?platform=${encodeURIComponent(platform)}`;
  return apiGet<OutboundMetricsResponse>(url);
}
