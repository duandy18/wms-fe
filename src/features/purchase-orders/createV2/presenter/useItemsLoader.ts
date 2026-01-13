// src/features/purchase-orders/createV2/presenter/useItemsLoader.ts

import { useEffect, useState } from "react";
import { fetchItemsBasic, type ItemBasic } from "../../../../master-data/itemsApi";
import { getErrorMessage } from "../utils";

export function useItemsLoader(): {
  itemOptions: ItemBasic[];
  itemsLoading: boolean;
  itemsError: string | null;
} {
  const [itemOptions, setItemOptions] = useState<ItemBasic[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      setItemsLoading(true);
      setItemsError(null);

      try {
        const data = await fetchItemsBasic();
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
  }, []);

  return { itemOptions, itemsLoading, itemsError };
}
