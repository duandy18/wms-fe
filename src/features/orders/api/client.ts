// src/features/orders/api/client.ts
import { apiGet, apiPost } from "../../../lib/api";

import type { DevOrderSummary, DevOrderView, DevOrderFacts } from "../../dev/orders/api/index";
import { listDevOrdersSummary, fetchDevOrderView, fetchDevOrderFacts } from "../../dev/orders/api/index";

import type { OrderFacts, OrderSummary, OrderView, WarehouseOption } from "./types";

// -------------------- small utils --------------------

function notNull<T>(x: T | null | undefined): x is T {
  return x != null;
}

// ================================
// 订单列表 & 详情（复用 DevConsole）
// ================================

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
  return listDevOrdersSummary(params) as Promise<(DevOrderSummary & OrderSummary)[]>;
}

export async function fetchOrderView(params: {
  platform: string;
  shopId: string;
  extOrderNo: string;
}): Promise<OrderView> {
  return fetchDevOrderView(params) as Promise<(DevOrderView & OrderView)>;
}

export async function fetchOrderFacts(params: {
  platform: string;
  shopId: string;
  extOrderNo: string;
}): Promise<OrderFacts> {
  return fetchDevOrderFacts(params) as Promise<DevOrderFacts>;
}

// ================================
// Phase 5.2：仓库下拉 + manual-assign
// ================================

export async function fetchWarehousesForSelect(): Promise<WarehouseOption[]> {
  const rows = await apiGet<unknown>("/warehouses");
  if (!Array.isArray(rows)) return [];

  return rows
    .map((r: unknown) => {
      if (r == null || typeof r !== "object") return null;
      const obj = r as Record<string, unknown>;

      const rawId = obj.id ?? obj.warehouse_id;
      const id = typeof rawId === "number" ? rawId : Number(rawId);
      if (!Number.isFinite(id)) return null;

      const codeRaw = obj.code ?? obj.warehouse_code;
      const nameRaw = obj.name ?? obj.warehouse_name;

      const code = typeof codeRaw === "string" ? codeRaw : null;
      const name = typeof nameRaw === "string" ? nameRaw : null;

      const activeRaw = obj.active ?? obj.warehouse_active;
      const active =
        typeof activeRaw === "boolean" ? activeRaw : activeRaw == null ? null : Boolean(activeRaw);

      return { id, code, name, active } satisfies WarehouseOption;
    })
    .filter(notNull);
}

export async function manualAssignFulfillmentWarehouse(args: {
  platform: string;
  shop_id: string;
  ext_order_no: string;
  warehouse_id: number;
  reason: string;
  note?: string | null;
}): Promise<{ ok: boolean }> {
  const path = `/orders/${encodeURIComponent(args.platform)}/${encodeURIComponent(
    args.shop_id,
  )}/${encodeURIComponent(args.ext_order_no)}/fulfillment/manual-assign`;

  await apiPost(path, {
    warehouse_id: args.warehouse_id,
    reason: args.reason,
    note: args.note ?? null,
  });

  return { ok: true };
}
