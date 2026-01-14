// src/features/inventory/ledger/components/filters/selectorUtils.ts
import { useMemo } from "react";
import type { ItemOut, WarehouseOut } from "./api";

function safeNumPrefix(s: string): number | null {
  const m = String(s ?? "").trim().match(/^(\d+)/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function useWarehouseDisplayValue(warehouseId: string, warehouses: WarehouseOut[]): string {
  return useMemo(() => {
    const wid = safeNumPrefix(warehouseId);
    if (!wid) return warehouseId;
    const found = warehouses.find((x) => x.id === wid);
    if (!found) return String(wid);
    const nm = (found.name ?? found.code ?? "").trim();
    return nm ? `${wid} | ${nm}` : String(wid);
  }, [warehouseId, warehouses]);
}

export function useItemDisplayValue(itemId: string, items: ItemOut[]): string {
  return useMemo(() => {
    const iid = safeNumPrefix(itemId);
    if (!iid) return itemId;
    const found = items.find((x) => x.id === iid);
    if (!found) return String(iid);
    const nm = (found.name ?? found.sku ?? "").trim();
    return nm ? `${iid} | ${nm}` : String(iid);
  }, [itemId, items]);
}

export function applyIdFromInput(raw: string, setId: (id: string) => void): number | null {
  const id = safeNumPrefix(raw);
  setId(id ? String(id) : raw.trim());
  return id;
}
