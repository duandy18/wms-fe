// src/features/purchase-orders/createV2/presenter/useItemsLoader.ts

import { useEffect, useState } from "react";
import {
  fetchItemsBasic,
  type ItemBasic,
} from "../../../../master-data/itemsApi";
import { getErrorMessage } from "../utils";

export function useItemsLoader(args: {
  supplierId: number | null;
}): {
  itemOptions: ItemBasic[];
  itemsLoading: boolean;
  itemsError: string | null;
} {
  const { supplierId } = args;

  const [itemOptions, setItemOptions] = useState<ItemBasic[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      // ✅ 未选择供应商：不加载商品，直接清空（避免“全量商品”暗示）
      if (supplierId == null) {
        setItemOptions([]);
        setItemsLoading(false);
        setItemsError(null);
        return;
      }

      setItemsLoading(true);
      setItemsError(null);

      try {
        const data = await fetchItemsBasic({ supplierId, enabledOnly: true });
        if (alive) setItemOptions(data);
      } catch (err) {
        console.error("fetchItemsBasic failed", err);
        if (alive) setItemsError(getErrorMessage(err, "加载商品列表失败"));
      }

      if (alive) setItemsLoading(false);
    }

    void load();
    return () => {
      alive = false;
    };
  }, [supplierId]);

  return { itemOptions, itemsLoading, itemsError };
}
