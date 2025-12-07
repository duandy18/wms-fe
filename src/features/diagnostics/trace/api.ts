// src/features/diagnostics/trace/api.ts
import { apiGet } from "../../../lib/api";
import type { TraceResponse } from "./types";

/**
 * 调用 /debug/trace/{trace_id}
 * @param traceId trace 唯一标识（在 Scan / 订单流程里通常就是 trace_id / scan_ref）
 * @param warehouseId 可选：指定仓后，只保留该仓 + 无仓事件
 */
export async function fetchTrace(
  traceId: string,
  warehouseId?: number,
): Promise<TraceResponse> {
  const params = new URLSearchParams();
  if (warehouseId != null && Number.isFinite(warehouseId)) {
    params.set("warehouse_id", String(warehouseId));
  }
  const qs = params.toString();
  const url = qs
    ? `/debug/trace/${encodeURIComponent(traceId)}?${qs}`
    : `/debug/trace/${encodeURIComponent(traceId)}`;
  return apiGet<TraceResponse>(url);
}
