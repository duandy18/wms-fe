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

type ListLineQty = {
  qty_ordered?: number | null; // 采购单位
  qty_received?: number | null; // 最小单位（base）
  units_per_case?: number | null;
};

function safeInt(v: unknown, fallback: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.trunc(n);
}

function lineUnitsPerCase(line: ListLineQty): number {
  const n = safeInt(line.units_per_case ?? 1, 1);
  return n > 0 ? n : 1;
}

export function calcPoProgress(
  po: PurchaseOrderListItem | null | undefined,
): {
  ordered: number; // 最小单位
  received: number; // 最小单位
  pct: number;
} {
  if (!po || !po.lines) return { ordered: 0, received: 0, pct: 0 };

  const lines = (po.lines ?? []) as unknown as ListLineQty[];

  // ✅ 订购：采购单位 * upc → base
  const ordered = lines.reduce((sum: number, l) => {
    const upc = lineUnitsPerCase(l);
    return sum + safeInt(l.qty_ordered ?? 0, 0) * upc;
  }, 0);

  // ✅ 已收：qty_received 已经是 base（不要再乘 upc）
  const received = lines.reduce((sum: number, l) => {
    return sum + safeInt(l.qty_received ?? 0, 0);
  }, 0);

  const pct =
    ordered > 0 ? Math.min(100, Math.round((received / ordered) * 100)) : 0;

  return { ordered, received, pct };
}
