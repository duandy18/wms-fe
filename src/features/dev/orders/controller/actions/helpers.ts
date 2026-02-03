// src/features/dev/orders/controller/actions/helpers.ts
import type { LinesPayload } from "./types";

export function buildLinesFromFacts(
  orderFacts: Array<{ item_id: number; qty_ordered?: number | null }> | null,
): LinesPayload {
  return (
    orderFacts?.map((f) => ({
      item_id: f.item_id,
      qty: Math.max(1, f.qty_ordered || 1),
    })) ?? []
  );
}

export function buildSingleLineFallback(
  orderFacts: Array<{ item_id: number }> | null,
): LinesPayload {
  const itemId = orderFacts?.[0]?.item_id ?? 1;
  return [{ item_id: itemId, qty: 1 }];
}
