// src/features/admin/stores/components/order-sim/execute/utils.ts

import type { ExpandedItem } from "../../../api_order_ingest";

export function buildIdempotencyKey(prefix: string): string {
  const ts = Date.now();
  const rand = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${prefix}-${ts}-${rand}`;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

export function asObj(x: unknown): Record<string, unknown> | null {
  return x && typeof x === "object" ? (x as Record<string, unknown>) : null;
}

export function asStr(x: unknown): string {
  if (x == null) return "";
  return String(x);
}

export function summarizeExpandedItems(items: ExpandedItem[] | null): string {
  if (!items || items.length === 0) return "—";
  // 简单汇总：item_id×need_qty（后续后端补 item_name 后可升级）
  return items.map((it) => `#${it.item_id}×${it.need_qty}`).join(" + ");
}
