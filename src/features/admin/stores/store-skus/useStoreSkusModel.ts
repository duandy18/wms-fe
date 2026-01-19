import { useEffect, useMemo, useRef, useState } from "react";
import { addStoreSku, fetchStoreSkus, removeStoreSku } from "../api";
import type { StoreSkuListItem } from "../types";
import { fetchItemsBasic, type ItemBasic } from "../../../../master-data/itemsApi";
import { errMsg, isNotImplemented } from "./errors";

type Args = {
  storeId: number;
  canWrite: boolean;
};

export function useStoreSkusModel({ storeId, canWrite }: Args) {
  // ---------------- store_items（店铺卖哪些 SKU） ----------------
  const [rows, setRows] = useState<StoreSkuListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [apiMissing, setApiMissing] = useState(false);

  const displayRows = useMemo(() => {
    return [...rows].sort((a, b) => a.item_id - b.item_id);
  }, [rows]);

  async function reloadStoreSkus() {
    if (!storeId) return;
    setLoading(true);
    setErr(null);
    setApiMissing(false);

    try {
      const resp = await fetchStoreSkus(storeId);
      if (resp && resp.ok) setRows(resp.data ?? []);
      else {
        setRows([]);
        setErr("后端合同不一致：GET /stores/{store_id}/items 应返回 { ok, data }");
      }
    } catch (e) {
      if (isNotImplemented(e)) {
        setApiMissing(true);
        setRows([]);
        setErr(null);
      } else {
        setRows([]);
        setErr(errMsg(e, "加载商铺 SKU 失败"));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reloadStoreSkus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  // ---------------- items 搜索（后端搜索） ----------------
  const [kw, setKw] = useState("");
  const [cands, setCands] = useState<ItemBasic[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | "">("");
  const [searchTick, setSearchTick] = useState(0);
  function triggerSearch() {
    // 立即给出反馈：进入“搜索中…”状态（不等 debounce）
    setItemsLoading(true);
    setItemsError(null);
    setSearchTick((x) => x + 1);
  }

  const prevKwRef = useRef<string>("");
  const prevTickRef = useRef<number>(0);
  const lastReqId = useRef(0);

  useEffect(() => {
    const q = kw.trim();
    const tickChanged = searchTick !== prevTickRef.current;
    prevTickRef.current = searchTick;
    prevKwRef.current = kw;
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
        // ✅ 后端搜索（主商品数据 items）
        // 注意：这里直接按你现阶段“能用”为目标：keyword + enabledOnly + limit
        // 若 itemsApi.ts 参数名不同，TS 会报错，你再贴 itemsApi.ts 的 params 定义我来对齐
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

  async function addSelectedSku() {
    if (!canWrite) return;
    const iid = selectedItemId === "" ? null : Number(selectedItemId);
    if (!iid || iid <= 0) {
      setErr("请选择要加入的商品（SKU）");
      return;
    }

    setLoading(true);
    setErr(null);
    try {
      await addStoreSku(storeId, { item_id: iid });
      setSelectedItemId("");
      await reloadStoreSkus();
    } catch (e) {
      if (isNotImplemented(e)) {
        setApiMissing(true);
        setErr(null);
      } else {
        setErr(errMsg(e, "加入 SKU 失败"));
      }
    } finally {
      setLoading(false);
    }
  }

  async function removeSku(itemId: number) {
    if (!canWrite) return;
    const ok = window.confirm(`确认从该商铺移除 SKU（item_id=${itemId}）？`);
    if (!ok) return;

    setLoading(true);
    setErr(null);
    try {
      await removeStoreSku(storeId, itemId);
      await reloadStoreSkus();
    } catch (e) {
      if (isNotImplemented(e)) {
        setApiMissing(true);
        setErr(null);
      } else {
        setErr(errMsg(e, "移除 SKU 失败"));
      }
    } finally {
      setLoading(false);
    }
  }

  return {
    // store sku
    rows: displayRows,
    loading,
    err,
    apiMissing,
    reloadStoreSkus,

    // items search
    kw,
    setKw,
    cands,
    itemsLoading,
    itemsError,
    selectedItemId,
    setSelectedItemId,

    // actions
    addSelectedSku,
    removeSku,
    triggerSearch,
  };
}
