// src/features/operations/inbound/purchase-context/poHelpers.ts

import type { PurchaseOrderListItem } from "../../../purchase-orders/api";

export function supplierLabel(p: PurchaseOrderListItem): string {
  return p.supplier_name ?? p.supplier ?? "未知供应商";
}

export function statusLabel(raw: string | null | undefined): string {
  const s = (raw ?? "").trim().toUpperCase();
  if (!s) return "未知";
  if (s === "CREATED") return "待收";
  if (s === "PARTIAL") return "收货中";
  if (s === "RECEIVED") return "已收完";
  if (s === "CLOSED") return "已关闭";
  return s;
}

export function formatTsCompact(ts?: string | null): string {
  const v = String(ts ?? "").trim();
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${mm}-${dd} ${hh}:${mi}`;
}

export function calcPoProgress(po: PurchaseOrderListItem | null | undefined): {
  ordered: number;
  received: number;
  pct: number;
} {
  if (!po || !po.lines) return { ordered: 0, received: 0, pct: 0 };

  const ordered = (po.lines ?? []).reduce(
    (sum: number, l) => sum + (l.qty_ordered ?? 0),
    0,
  );
  const received = (po.lines ?? []).reduce(
    (sum: number, l) => sum + (l.qty_received ?? 0),
    0,
  );
  const pct =
    ordered > 0 ? Math.min(100, Math.round((received / ordered) * 100)) : 0;
  return { ordered, received, pct };
}
