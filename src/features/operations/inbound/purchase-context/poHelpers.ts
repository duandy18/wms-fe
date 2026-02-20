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
  // 采购单位（仅用于兼容旧数据；主线优先使用 *_base）
  qty_ordered?: number | null;
  units_per_case?: number | null;

  // ✅ 新主线：base 口径（后端已提供）
  qty_ordered_base?: number | null;
  qty_received_base?: number | null;
  qty_remaining_base?: number | null;

  // 兼容：老字段（有的系统会把 qty_received 当 base）
  qty_received?: number | null;
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

function lineOrderedBase(line: ListLineQty): number {
  // ✅ 主线：后端已提供 qty_ordered_base（合同事实）
  const qob = line.qty_ordered_base;
  if (qob != null) return Math.max(safeInt(qob, 0), 0);

  // 兼容：旧数据无 qty_ordered_base，退回到“采购口径×upc”推导
  const upc = lineUnitsPerCase(line);
  const orderedPurchase = safeInt(line.qty_ordered ?? 0, 0);
  return Math.max(orderedPurchase * upc, 0);
}

function lineReceivedBase(line: ListLineQty): number {
  // ✅ 主线：后端已提供 qty_received_base（Receipt CONFIRMED 聚合）
  const qrb = line.qty_received_base;
  if (qrb != null) return Math.max(safeInt(qrb, 0), 0);

  // 兼容：旧字段 qty_received（若存在则按 base 处理）
  const legacy = line.qty_received;
  if (legacy != null) return Math.max(safeInt(legacy, 0), 0);

  return 0;
}

export function calcPoProgress(
  po: PurchaseOrderListItem | null | undefined,
): {
  ordered: number; // 最小单位
  received: number; // 最小单位（CONFIRMED）
  pct: number;
} {
  if (!po || !po.lines) return { ordered: 0, received: 0, pct: 0 };

  const lines = (po.lines ?? []) as unknown as ListLineQty[];

  const ordered = lines.reduce((sum: number, l) => sum + lineOrderedBase(l), 0);
  const received = lines.reduce((sum: number, l) => sum + lineReceivedBase(l), 0);

  const pct = ordered > 0 ? Math.min(100, Math.round((received / ordered) * 100)) : 0;

  return { ordered, received, pct };
}
