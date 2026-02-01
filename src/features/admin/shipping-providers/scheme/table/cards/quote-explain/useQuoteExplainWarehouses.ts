// src/features/admin/shipping-providers/scheme/table/cards/quote-explain/useQuoteExplainWarehouses.ts

import { useEffect, useMemo, useState } from "react";
import { fetchActiveWarehouses } from "../../../../../warehouses/api";
import type { WarehouseListItem } from "../../../../../warehouses/types";

function toHumanError(e: unknown, fallback: string): string {
  if (!e) return fallback;
  if (typeof e === "string") return e;
  if (e instanceof Error && e.message) return e.message;
  const r = e as Record<string, unknown>;
  if (typeof r?.message === "string") return r.message;
  return fallback;
}

function warehouseLabel(w: WarehouseListItem): string {
  const code = w.code ? String(w.code).trim() : "";
  const name = w.name ? String(w.name).trim() : "";
  return code || name || `WH-${w.id}`;
}

export type WarehouseOption = { id: number; label: string };

export function useQuoteExplainWarehouses(args: { onError: (msg: string) => void }) {
  const { onError } = args;

  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([]);
  const [whLoading, setWhLoading] = useState(false);
  const [whError, setWhError] = useState<string | null>(null);
  const [warehouseId, setWarehouseId] = useState<string>("");

  async function reload() {
    setWhLoading(true);
    setWhError(null);
    try {
      const list = await fetchActiveWarehouses();
      setWarehouses(list ?? []);
    } catch (e) {
      const msg = toHumanError(e, "加载起运仓失败");
      setWhError(msg);
      setWarehouses([]);
      onError(msg);
    } finally {
      setWhLoading(false);
    }
  }

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!warehouseId) return;
    const wid = Number(warehouseId);
    if (!Number.isFinite(wid) || wid <= 0) return;
    const ok = warehouses.some((w) => w.id === wid);
    if (!ok) setWarehouseId("");
  }, [warehouses, warehouseId]);

  const warehouseOptions: WarehouseOption[] = useMemo(() => {
    const arr = [...warehouses];
    arr.sort((a, b) => warehouseLabel(a).localeCompare(warehouseLabel(b), "zh"));
    return arr.map((w) => ({ id: w.id, label: warehouseLabel(w) }));
  }, [warehouses]);

  const parsedWarehouseId = useMemo(() => {
    const n = Number(warehouseId);
    return Number.isFinite(n) ? n : NaN;
  }, [warehouseId]);

  return {
    warehouses,
    whLoading,
    whError,
    warehouseId,
    setWarehouseId,
    warehouseOptions,
    parsedWarehouseId,
    reload,
  };
}
