// src/features/orders/ui/format.tsx
import React from "react";

export const formatTs = (ts: string | null | undefined) =>
  ts ? ts.replace("T", " ").replace("Z", "") : "-";

function badgeBase(cls: string, text: string) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${cls}`}>
      {text}
    </span>
  );
}

/**
 * 订单“业务流程状态”（旧口径）
 * - 如 CREATED/PAID/RESERVED/SHIPPED/RETURNED...
 * - Phase 5.2 仍可能作为筛选条件保留，但列表展示应优先展示 fulfillment_status。
 */
export function renderStatus(status?: string | null) {
  if (!status) return badgeBase("bg-slate-100 text-slate-600 border-slate-200", "-");

  const s = status.toUpperCase();
  if (s === "CREATED" || s === "PAID" || s === "RESERVED") {
    return badgeBase("bg-sky-50 text-sky-700 border-sky-200", status);
  }
  if (s === "SHIPPED") return badgeBase("bg-indigo-50 text-indigo-700 border-indigo-200", status);
  if (s === "PARTIALLY_RETURNED") return badgeBase("bg-amber-50 text-amber-700 border-amber-200", status);
  if (s === "RETURNED") return badgeBase("bg-emerald-50 text-emerald-700 border-emerald-200", status);
  if (s === "CANCELED") return badgeBase("bg-slate-100 text-slate-600 border-slate-200", status);
  return badgeBase("bg-slate-50 text-slate-700 border-slate-200", status);
}

/**
 * Phase 5.2：履约状态（新口径）
 * - SERVICE_ASSIGNED：只写 service_warehouse_id，warehouse_id 仍为空
 * - MANUALLY_ASSIGNED：人工指定 warehouse_id 成功
 * - READY_TO_FULFILL：可进入 reserve/pick/ship
 * - FULFILLMENT_BLOCKED：缺省/缺市/未配置服务范围等显式阻断
 */
export function renderFulfillmentStatus(status?: string | null) {
  if (!status) return badgeBase("bg-slate-100 text-slate-600 border-slate-200", "-");

  const s = status.toUpperCase();

  if (s === "SERVICE_ASSIGNED") return badgeBase("bg-sky-50 text-sky-700 border-sky-200", "待指定执行仓");
  if (s === "MANUALLY_ASSIGNED") return badgeBase("bg-violet-50 text-violet-700 border-violet-200", "已人工指定");
  if (s === "READY_TO_FULFILL") return badgeBase("bg-emerald-50 text-emerald-700 border-emerald-200", "可履约");
  if (s === "FULFILLMENT_BLOCKED") return badgeBase("bg-red-50 text-red-700 border-red-200", "履约受阻");

  // 兜底：展示原值（避免后端未来加新状态导致 UI 空白）
  return badgeBase("bg-slate-50 text-slate-700 border-slate-200", status);
}
