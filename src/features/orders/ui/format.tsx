// src/features/orders/ui/format.tsx
import React from "react";

export const formatTs = (ts: string | null | undefined) => (ts ? ts.replace("T", " ").replace("Z", "") : "-");

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
 * - 仍可能作为筛选条件保留；列表展示优先展示“发货状态”（fulfillment_status 的 UI 映射）。
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
 * Phase 5.x：发货状态（UI 口径，人话）
 *
 * 后端 fulfillment_status → UI 发货状态：
 * - SERVICE_ASSIGNED   → 待指定仓库
 * - READY_TO_FULFILL   → 可发货
 * - MANUALLY_ASSIGNED  → 已指定仓库
 * - SHIPPED            → 已发货
 * - FULFILLMENT_BLOCKED→ 待处理（受阻）
 *
 * 说明：
 * - UI 绝不暴露 SERVICE_ASSIGNED / READY_TO_FULFILL 等工程枚举
 * - 兜底仍保留原值展示，避免未来新增状态导致空白
 */
export function renderFulfillmentStatus(status?: string | null) {
  if (!status) return badgeBase("bg-slate-100 text-slate-600 border-slate-200", "-");

  const s = status.toUpperCase();

  if (s === "SERVICE_ASSIGNED") return badgeBase("bg-sky-50 text-sky-700 border-sky-200", "待指定仓库");
  if (s === "READY_TO_FULFILL") return badgeBase("bg-emerald-50 text-emerald-700 border-emerald-200", "可发货");
  if (s === "MANUALLY_ASSIGNED") return badgeBase("bg-violet-50 text-violet-700 border-violet-200", "已指定仓库");
  if (s === "SHIPPED") return badgeBase("bg-indigo-50 text-indigo-700 border-indigo-200", "已发货");
  if (s === "FULFILLMENT_BLOCKED") return badgeBase("bg-red-50 text-red-700 border-red-200", "待处理（受阻）");

  // 兜底：展示原值（避免后端未来加新状态导致 UI 空白）
  return badgeBase("bg-slate-50 text-slate-700 border-slate-200", status);
}
