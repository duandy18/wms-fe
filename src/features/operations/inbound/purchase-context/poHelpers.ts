// src/features/operations/inbound/purchase-context/poHelpers.ts

import type { PurchaseOrderListItem } from "../../../purchase-orders/api";

export function supplierLabel(p: PurchaseOrderListItem): string {
  return p.supplier_name ?? "未知供应商";
}

export function statusLabel(raw: string | null | undefined): string {
  const s = (raw ?? "").trim().toUpperCase();
  if (!s) return "未知";
  if (s === "CREATED") return "待收";
  if (s === "CANCELED") return "已取消";
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

type ListLinePlan = {
  qty_ordered_base?: number | null;
};

function safeInt(v: unknown, fallback: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.trunc(n);
}

function lineOrderedBase(line: ListLinePlan): number {
  const qob = line.qty_ordered_base;
  return qob != null ? Math.max(safeInt(qob, 0), 0) : 0;
}

export function calcPoProgress(
  po: PurchaseOrderListItem | null | undefined,
): {
  ordered: number; // 最小单位
  received: number; // 采购计划列表不再承载完成情况
  pct: number;
} {
  if (!po || !po.lines) return { ordered: 0, received: 0, pct: 0 };

  const lines = (po.lines ?? []) as unknown as ListLinePlan[];
  const ordered = lines.reduce((sum: number, l) => sum + lineOrderedBase(l), 0);

  // 计划列表不再混入完成情况字段，进度统一由 completion 接口承担。
  const received = 0;
  const pct = 0;

  return { ordered, received, pct };
}
