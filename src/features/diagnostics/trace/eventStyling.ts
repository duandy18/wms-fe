// src/features/diagnostics/trace/eventStyling.ts
import type { TraceEvent } from "./types";

/**
 * 根据事件来源 / 种类，返回 badge 样式（颜色 + icon + label）。
 */
export function styleTraceEvent(ev: TraceEvent) {
  const source = (ev.source || "").toLowerCase();
  const kind = (ev.kind || "").toUpperCase();
  const reason = (ev.raw?.reason as string | undefined) || "";
  const eventName = (ev.raw?.event as string | undefined) || "";

  // 默认样式
  let badgeClassName =
    "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]";
  let icon = "•";
  let label = `${source}:${kind}`;

  // 订单相关
  if (source === "order") {
    badgeClassName =
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px]";
    icon = "📦";
    label = "订单";
  }

  // 预占
  if (source === "reservation") {
    badgeClassName =
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[11px]";
    icon = "📌";
    label = "预占";
  }

  if (source === "reservation_consumed") {
    badgeClassName =
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[11px]";
    icon = "✅";
    label = "预占消耗";
  }

  // 出库
  if (source === "outbound") {
    badgeClassName =
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px]";
    icon = "📤";
    label = "出库提交";
  }

  // Ledger：用 reason 决定颜色
  if (source === "ledger") {
    const r = reason.toUpperCase();
    if (r.includes("SHIP")) {
      badgeClassName =
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-50 text-green-700 text-[11px]";
      icon = "🚚";
      label = "发货记账";
    } else if (r.startsWith("RETURN") || r === "RECEIPT") {
      badgeClassName =
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[11px]";
      icon = "↩️";
      label = "退货/入库";
    } else if (r === "ADJUSTMENT" || r === "COUNT") {
      badgeClassName =
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 text-[11px]";
      icon = "🧮";
      label = "盘点/调整";
    } else {
      badgeClassName =
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 text-[11px]";
      icon = "📊";
      label = "台账";
    }
  }

  // 审计事件
  if (source === "audit") {
    if (eventName === "WAREHOUSE_ROUTED") {
      // 仓库路由审计：单独高亮
      badgeClassName =
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px]";
      icon = "🧭";
      label = "仓库路由";
    } else {
      badgeClassName =
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 text-[11px]";
      icon = "📝";
      label = "审计";
    }
  }

  // event_store
  if (source === "event_store") {
    badgeClassName =
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 text-[11px]";
    icon = "📨";
    label = "事件总线";
  }

  return { badgeClassName, icon, label };
}

/**
 * 把 TraceEvent 的 summary 翻译成更“业务向”的一句话。
 */
export function explainTraceEvent(ev: TraceEvent): string {
  const source = (ev.source || "").toLowerCase();
  const reason = (ev.raw?.reason as string | undefined) || "";
  const r = reason.toUpperCase();
  const base = ev.summary || "";
  const eventName = (ev.raw?.event as string | undefined) || "";

  const wh =
    (ev.raw?.warehouse_id as number | undefined) ??
    (ev.warehouse_id as number | undefined) ??
    null;
  const routeMode =
    (ev.raw?.route_mode as string | undefined) || "";
  const considered =
    (ev.raw?.considered as number[] | undefined) || [];

  if (source === "order") {
    return base || "订单事件";
  }
  if (source === "reservation") {
    return base || "预占创建 / 更新";
  }
  if (source === "reservation_consumed") {
    return base || "预占被出库消耗";
  }
  if (source === "outbound") {
    return base || "出库提交 / 出库状态变化";
  }
  if (source === "ledger") {
    if (r.includes("SHIP")) {
      return base || "发货导致库存减少（SHIPMENT）";
    }
    if (r.startsWith("RETURN") || r === "RECEIPT") {
      return base || "退货相关入库 / 调整";
    }
    if (r === "COUNT" || r === "ADJUSTMENT") {
      return base || "盘点 / 手工调整库存";
    }
    return base || "库存台账变动";
  }
  if (source === "audit") {
    if (eventName === "WAREHOUSE_ROUTED") {
      const whText = wh != null ? String(wh) : "?";
      const mode = routeMode || "FALLBACK";
      const consideredText = considered.length
        ? considered.join(",")
        : "无";

      return (
        base ||
        `仓库路由决策：WH=${whText} · 模式=${mode.toUpperCase()} · 尝试仓=[${consideredText}]`
      );
    }
    return base || "审计记录（重要流程打点）";
  }
  if (source === "event_store") {
    return base || "事件总线中的事件记录";
  }

  return base || `${source} 事件`;
}
