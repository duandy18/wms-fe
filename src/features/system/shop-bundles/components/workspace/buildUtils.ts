// src/features/system/shop-bundles/components/build/buildUtils.ts
import type { FskuComponent } from "../../types";

export function toIntOrNull(s: string): number | null {
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  const i = Math.trunc(n);
  if (i <= 0) return null;
  return i;
}

export function buildComponents(rows: Array<{ item_id: number | null; qty: number | null }>): FskuComponent[] {
  const out: FskuComponent[] = [];
  for (const r of rows) {
    const itemId = r.item_id;
    const qty = r.qty;
    if (itemId == null || qty == null) continue;
    out.push({ item_id: itemId, qty, role: "primary" });
  }
  return out;
}

export function fmt(v: string | null): string {
  const s = (v ?? "").trim();
  return s ? s : "—";
}
