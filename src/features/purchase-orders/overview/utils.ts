// src/features/purchase-orders/overview/utils.ts

import type { PurchaseOrderListItem } from "../api";

export type PurchaseKpi = {
  total: number;
  done: number;
  doing: number;
  created: number;
  partial: number;
};

export const parseMoney = (v: string | null | undefined): number => {
  if (!v) return 0;
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
};

export const normStatus = (s: string | null | undefined): string =>
  String(s ?? "").trim().toUpperCase();

export const isDoneStatus = (s: string | null | undefined): boolean => {
  const v = normStatus(s);
  return v === "RECEIVED" || v === "CLOSED";
};

export function calcPurchaseKpi(orders: PurchaseOrderListItem[]): PurchaseKpi {
  const total = orders.length;
  const done = orders.filter((x) => isDoneStatus(x.status)).length;
  const doing = total - done;
  const created = orders.filter((x) => normStatus(x.status) === "CREATED").length;
  const partial = orders.filter((x) => normStatus(x.status) === "PARTIAL").length;
  return { total, done, doing, created, partial };
}
