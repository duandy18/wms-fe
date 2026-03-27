// src/features/admin/stores/components/order-sim/utils.ts

import type { MerchantOrderLineInput } from "../StoreOrderMerchantInputsCard";
import type { OrderSimCartRow, OrderSimMerchantLineRow } from "../../api";
import type { StoreOrderSimCartSeed } from "../useStoreOrderIngestSimulator";

export function makeEmptyMerchantRows(): MerchantOrderLineInput[] {
  return new Array(6).fill(null).map(() => ({
    filled_code: "",
    title: "",
    spec: "",
  }));
}

export function normalizeRowText(s: string): string {
  return (s ?? "").trim();
}

export function rowsFromApi(items: OrderSimMerchantLineRow[]): MerchantOrderLineInput[] {
  const byNo = new Map<number, OrderSimMerchantLineRow>();
  for (const it of items) byNo.set(Number(it.row_no), it);

  const out: MerchantOrderLineInput[] = [];
  for (let rn = 1; rn <= 6; rn += 1) {
    const r = byNo.get(rn);
    out.push({
      filled_code: r?.filled_code ?? "",
      title: r?.title ?? "",
      spec: r?.spec ?? "",
    });
  }
  return out;
}

export function versionsFromApi(items: OrderSimMerchantLineRow[]): number[] {
  const byNo = new Map<number, number>();
  for (const it of items) byNo.set(Number(it.row_no), Number(it.version ?? 0));

  const out: number[] = [];
  for (let rn = 1; rn <= 6; rn += 1) out.push(byNo.get(rn) ?? 0);
  return out;
}

export function cartVersionsFromApi(items: OrderSimCartRow[]): number[] {
  const byNo = new Map<number, number>();
  for (const it of items) byNo.set(Number(it.row_no), Number(it.version ?? 0));

  const out: number[] = [];
  for (let rn = 1; rn <= 6; rn += 1) out.push(byNo.get(rn) ?? 0);
  return out;
}

export function cartSeedFromApi(province: string | null, city: string | null, items: OrderSimCartRow[]): StoreOrderSimCartSeed {
  const byNo = new Map<number, OrderSimCartRow>();
  for (const it of items) byNo.set(Number(it.row_no), it);

  const seedItems: Array<{ idx: number; checked: boolean; qtyText: string }> = [];
  for (let rn = 1; rn <= 6; rn += 1) {
    const r = byNo.get(rn);
    seedItems.push({
      idx: rn - 1,
      checked: Boolean(r?.checked ?? false),
      qtyText: String(r?.qty ?? 0),
    });
  }

  return {
    province: province ?? "河北省",
    city: city ?? "廊坊市",
    items: seedItems,
  };
}

export function parsePositiveInt(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  if (!Number.isInteger(n)) return null;
  if (n <= 0) return null;
  return n;
}

export function parseNonNegativeIntOrZero(s: string): number {
  const t = s.trim();
  if (!t) return 0;
  const n = Number(t);
  if (!Number.isFinite(n)) return 0;
  if (!Number.isInteger(n)) return 0;
  if (n < 0) return 0;
  return n;
}
