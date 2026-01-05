// src/features/operations/outbound-pick/cockpit/useCockpitItemMeta.tsx

import { useEffect, useState } from "react";
import { fetchItemsBasic, type ItemBasic } from "../../../../master-data/itemsApi";

export function useCockpitItemMeta() {
  const [itemMetaMap, setItemMetaMap] = useState<Record<number, ItemBasic>>({});

  // ---------------- 一次性加载 items 主数据 ----------------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const items = await fetchItemsBasic();
        if (cancelled) return;
        const map: Record<number, ItemBasic> = {};
        for (const it of items) {
          map[it.id] = it;
        }
        setItemMetaMap(map);
      } catch (err) {
        console.error("fetchItemsBasic failed:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { itemMetaMap };
}
