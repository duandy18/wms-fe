// src/features/tms/shipment/cockpit/controller/context.ts
//
// 分拆说明：
// - 本文件负责路由上下文解析。
// - 维护约束：
//   - 只处理 route state -> order context 的收口
//   - 不掺杂页面 state 和接口调用

import type {
  ShipmentDispatchRouteState,
  ShipmentOrderContext,
} from "./types";

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function buildOrderContext(
  state: ShipmentDispatchRouteState | null | undefined,
): ShipmentOrderContext | null {
  const platform = normalizeText(state?.platform);
  const shop_id = normalizeText(state?.shop_id);
  const ext_order_no = normalizeText(state?.ext_order_no);

  if (!platform || !shop_id || !ext_order_no) {
    return null;
  }

  return {
    platform,
    shop_id,
    ext_order_no,
  };
}

export function normalizeRouteText(value: unknown): string {
  return normalizeText(value);
}
