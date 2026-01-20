// src/features/admin/stores/store-skus/useItemSearch.ts

import { useEffect, useRef, useState } from "react";
import { fetchItemsBasic, type ItemBasic } from "../../../../master-data/itemsApi";
import { errMsg } from "./errors";

export function useItemSearch() {
  const [kw, setKw] = useState("");
  const [cands, setCands] = useState<ItemBasic[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | "">("");
  const [searchTick, setSearchTick] = useState(0);

  function triggerSearch() {
    setItemsLoading(true);
    setItemsError(null);
    setSearchTick((x) => x + 1);
  }

  const prevTickRef = useRef<number>(0);
  const lastReqId = useRef(0);

  useEffect(() => {
    const q = kw.trim();
    const tickChanged = searchTick !== prevTickRef.current;
    prevTickRef.current = searchTick;
    const delay = tickChanged ? 0 : 250;

    if (!q) {
      const t0 = window.setTimeout(async () => {
        const reqId0 = ++lastReqId.current;
        setItemsLoading(true);
        setItemsError(null);
        try {
          const list0 = await fetchItemsBasic({ enabledOnly: true, limit: 50 });
          if (reqId0 === lastReqId.current) {
            const data = list0 ?? [];
            setCands(data);
            if (data.length === 1) setSelectedItemId(data[0].id);
          }
        } catch (e) {
          if (reqId0 === lastReqId.current) {
            setCands([]);
            setItemsError(errMsg(e, "加载商品失败"));
          }
        } finally {
          if (reqId0 === lastReqId.current) setItemsLoading(false);
        }
      }, 0);

      return () => window.clearTimeout(t0);
    }

    const t = window.setTimeout(async () => {
      const reqId = ++lastReqId.current;
      setItemsLoading(true);
      setItemsError(null);

      try {
        const list = await fetchItemsBasic({
          keyword: q,
          enabledOnly: true,
          limit: 50,
        });

        if (reqId === lastReqId.current) {
          const data = list ?? [];
          setCands(data);
          if (data.length === 1) setSelectedItemId(data[0].id);
        }
      } catch (e) {
        if (reqId === lastReqId.current) {
          setCands([]);
          setItemsError(errMsg(e, "搜索商品失败"));
        }
      } finally {
        if (reqId === lastReqId.current) setItemsLoading(false);
      }
    }, delay);

    return () => window.clearTimeout(t);
  }, [kw, searchTick]);

  return {
    kw,
    setKw,
    cands,
    itemsLoading,
    itemsError,
    selectedItemId,
    setSelectedItemId,
    triggerSearch,
  };
}
