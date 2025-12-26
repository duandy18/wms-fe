// src/features/orders/page/utils.ts
//
// OrdersPage 纯工具函数（无 React）

export const formatTs = (ts: string | null | undefined) => (ts ? ts.replace("T", " ").replace("Z", "") : "-");

export function statusPillClass(status?: string | null): string {
  if (!status) return "inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600";

  const s = status.toUpperCase();
  let cls = "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ";

  if (s === "CREATED" || s === "PAID" || s === "RESERVED") {
    cls += "bg-sky-50 text-sky-700 border border-sky-200";
  } else if (s === "SHIPPED") {
    cls += "bg-indigo-50 text-indigo-700 border border-indigo-200";
  } else if (s === "PARTIALLY_RETURNED") {
    cls += "bg-amber-50 text-amber-700 border border-amber-200";
  } else if (s === "RETURNED") {
    cls += "bg-emerald-50 text-emerald-700 border border-emerald-200";
  } else if (s === "CANCELED") {
    cls += "bg-slate-100 text-slate-600 border border-slate-200";
  } else {
    cls += "bg-slate-50 text-slate-700 border border-slate-200";
  }

  return cls;
}

export function buildListParams(filters: {
  platform: string;
  shopId: string;
  status: string;
  timeFrom: string;
  timeTo: string;
  limit: number;
}) {
  const { platform, shopId, status, timeFrom, timeTo, limit } = filters;
  const params: Record<string, unknown> = { limit };

  if (platform.trim()) params.platform = platform.trim();
  if (shopId.trim()) params.shopId = shopId.trim();
  if (status.trim()) params.status = status.trim();
  if (timeFrom.trim()) params.time_from = `${timeFrom.trim()}T00:00:00Z`;
  if (timeTo.trim()) params.time_to = `${timeTo.trim()}T23:59:59Z`;

  return params;
}

export function buildDevConsoleHref(detailOrder: { platform: string; shop_id: string; ext_order_no: string } | null) {
  if (!detailOrder) return "/dev";
  const qs = new URLSearchParams();
  qs.set("platform", detailOrder.platform);
  qs.set("shop_id", detailOrder.shop_id);
  qs.set("ext_order_no", detailOrder.ext_order_no);
  return `/dev?${qs.toString()}`;
}
