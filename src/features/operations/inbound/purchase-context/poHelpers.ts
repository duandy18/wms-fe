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

type ListLineQtyV2 = {
  qty_ordered_base?: number | null;
  qty_received_base?: number | null;
};

function safeInt(v: unknown, fallback: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.trunc(n);
}

function lineOrderedBase(line: ListLineQtyV2): number {
  const qob = line.qty_ordered_base;
  return qob != null ? Math.max(safeInt(qob, 0), 0) : 0;
}

function lineReceivedBase(line: ListLineQtyV2): number {
  const qrb = line.qty_received_base;
  return qrb != null ? Math.max(safeInt(qrb, 0), 0) : 0;
}

export function calcPoProgress(
  po: PurchaseOrderListItem | null | undefined,
): {
  ordered: number; // 最小单位
  received: number; // 最小单位（CONFIRMED）
  pct: number;
} {
  if (!po || !po.lines) return { ordered: 0, received: 0, pct: 0 };

  const lines = (po.lines ?? []) as unknown as ListLineQtyV2[];

  const ordered = lines.reduce((sum: number, l) => sum + lineOrderedBase(l), 0);
  const received = lines.reduce((sum: number, l) => sum + lineReceivedBase(l), 0);

  const pct = ordered > 0 ? Math.min(100, Math.round((received / ordered) * 100)) : 0;

  return { ordered, received, pct };
}
