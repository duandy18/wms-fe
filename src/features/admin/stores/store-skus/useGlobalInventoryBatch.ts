// src/features/admin/stores/store-skus/useGlobalInventoryBatch.ts

import { useMemo, useState } from "react";
import type { StoreBinding } from "../types";
import type { GlobalAvailableMulti, WarehouseAvailableModel } from "../../../inventory/global-available/types";
import { errMsg } from "./errors";
import { fetchGlobalInventoryBatch } from "./inventoryBatchApi";

function buildAllowedWarehouseIdSet(bindings: StoreBinding[]) {
  return new Set<number>((bindings ?? []).map((b) => b.warehouse_id));
}

export function useGlobalInventoryBatch(args: {
  platform: string;
  shopId: string;
  bindings: StoreBinding[];
}) {
  const [inventoryByItemId, setInventoryByItemId] = useState<Record<number, WarehouseAvailableModel[]>>(
    {},
  );
  const [invLoadingItemIds, setInvLoadingItemIds] = useState<Record<number, boolean>>({});
  const [invError, setInvError] = useState<string | null>(null);

  const invLoadingAny = useMemo(() => Object.values(invLoadingItemIds).some(Boolean), [invLoadingItemIds]);

  const allowedWarehouseIdSet = useMemo(
    () => buildAllowedWarehouseIdSet(args.bindings ?? []),
    [args.bindings],
  );

  async function reloadAllInventories(itemIds: number[]) {
    const p = (args.platform ?? "").trim().toUpperCase();
    const s = (args.shopId ?? "").trim();
    if (!p || !s) return;

    const ids = (itemIds ?? []).filter((x) => Number.isFinite(x) && x > 0);
    setInvError(null);

    if (ids.length === 0) {
      setInventoryByItemId({});
      setInvLoadingItemIds({});
      return;
    }

    setInvLoadingItemIds(() => {
      const m: Record<number, boolean> = {};
      ids.forEach((id) => (m[id] = true));
      return m;
    });

    try {
      const out: GlobalAvailableMulti[] = await fetchGlobalInventoryBatch({
        platform: p,
        shopId: s,
        itemIds: ids,
      });

      const mapped: Record<number, WarehouseAvailableModel[]> = {};
      for (const multi of out ?? []) {
        const iid = Number(multi.item_id);
        const whs = (multi.warehouses ?? []) as WarehouseAvailableModel[];
        mapped[iid] = whs.filter((w) => allowedWarehouseIdSet.has(w.warehouse_id));
      }

      ids.forEach((iid) => {
        if (!mapped[iid]) mapped[iid] = [];
      });

      setInventoryByItemId(mapped);
    } catch (e) {
      setInventoryByItemId({});
      setInvError(errMsg(e, "获取各仓可售库存失败"));
    } finally {
      setInvLoadingItemIds(() => {
        const m: Record<number, boolean> = {};
        ids.forEach((id) => (m[id] = false));
        return m;
      });
    }
  }

  return {
    inventoryByItemId,
    invLoadingItemIds,
    invLoadingAny,
    invError,
    reloadAllInventories,
    setInvError,
    setInventoryByItemId,
    setInvLoadingItemIds,
  };
}
