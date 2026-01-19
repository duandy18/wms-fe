// src/features/operations/outbound-pick/orderPick/useActiveWarehouses.ts
import { useCallback, useEffect, useState } from "react";

import { fetchActiveWarehouses } from "../../../admin/warehouses/api";
import type { WarehouseListItem } from "../../../admin/warehouses/types";

export function useActiveWarehouses(args?: { preferredId?: number }) {
  const preferredId = args?.preferredId ?? 1;

  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([]);
  const [loadingWh, setLoadingWh] = useState(false);
  const [whError, setWhError] = useState<string | null>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(
    null,
  );

  const loadWarehouses = useCallback(async () => {
    setLoadingWh(true);
    setWhError(null);
    try {
      const list = await fetchActiveWarehouses();
      setWarehouses(list);

      if (list.length > 0) {
        const preferred = list.find((w) => w.id === preferredId) ?? list[0];
        setSelectedWarehouseId(preferred.id);
      } else {
        setSelectedWarehouseId(null);
      }
    } catch (err: unknown) {
      console.error("fetchActiveWarehouses failed", err);
      const msg = err instanceof Error ? err.message : "加载仓库列表失败";
      setWhError(msg);
      setWarehouses([]);
      setSelectedWarehouseId(null);
    } finally {
      setLoadingWh(false);
    }
  }, [preferredId]);

  useEffect(() => {
    void loadWarehouses();
  }, [loadWarehouses]);

  return {
    warehouses,
    loadingWh,
    whError,
    selectedWarehouseId,
    setSelectedWarehouseId,
    reloadWarehouses: loadWarehouses,
  };
}
