// src/features/admin/stores/store-skus/useStoreSkusModel.ts

import { useEffect, useMemo, useState } from "react";
import { addStoreSku, fetchStoreSkus, removeStoreSku } from "../api";
import type { StoreSkuListItem, StoreBinding } from "../types";
import { errMsg, isNotImplemented } from "./errors";
import { useItemSearch } from "./useItemSearch";
import { useGlobalInventoryBatch } from "./useGlobalInventoryBatch";

type Args = {
  storeId: number;
  canWrite: boolean;
  platform: string;
  shopId: string;
  bindings: StoreBinding[];
};

export type WarehouseOption = {
  warehouse_id: number;
  code: string; // 列头使用
  label?: string; // tooltip/辅助
  active?: boolean;
};

export function useStoreSkusModel({ storeId, canWrite, platform, shopId, bindings }: Args) {
  // ---------------- store_items（售卖清单：事实绑定） ----------------
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
      setRows(resp?.data ?? []);
    } catch (e) {
      if (isNotImplemented(e)) {
        setApiMissing(true);
        setRows([]);
        setErr(null);
      } else {
        setRows([]);
        setErr(errMsg(e, "加载商铺商品失败"));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reloadStoreSkus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  // ---------------- 商品搜索（主数据） ----------------
  const search = useItemSearch();

  // ---------------- 仓库列元信息（来自 bindings） ----------------
  const warehouseOptions: WarehouseOption[] = useMemo(() => {
    const list = (bindings ?? []).map((b) => {
      const name = (b.warehouse_name ?? "").trim();
      const rawCode = (b.warehouse_code ?? "").trim();

      // code：用于列头，必须稳定且短
      const code = rawCode || `wh-${b.warehouse_id}`;

      // label：用于 tooltip，允许更长更全
      const label = name ? (rawCode ? `${name}（${rawCode}）` : name) : code;

      return {
        warehouse_id: b.warehouse_id,
        code,
        label,
        active: b.warehouse_active,
      };
    });

    return list.sort((a, b) => a.warehouse_id - b.warehouse_id);
  }, [bindings]);

  // ---------------- 批量库存（后端口径） ----------------
  const inv = useGlobalInventoryBatch({ platform, shopId, bindings });

  async function reloadAllInventories() {
    const ids = displayRows.map((r) => r.item_id).filter((x) => Number.isFinite(x) && x > 0);
    await inv.reloadAllInventories(ids);
  }

  useEffect(() => {
    if (!platform || !shopId) return;

    if (displayRows.length === 0) {
      inv.setInventoryByItemId({});
      inv.setInvLoadingItemIds({});
      inv.setInvError(null);
      return;
    }

    void reloadAllInventories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, shopId, bindings, displayRows.length]);

  // ---------------- actions：加入/移除 ----------------
  async function addSelectedSku() {
    if (!canWrite) return;

    const iid = search.selectedItemId === "" ? null : Number(search.selectedItemId);
    if (!iid || iid <= 0) {
      setErr("请选择要加入的商品");
      return;
    }

    if (rows.some((x) => x.item_id === iid)) {
      setErr("该商品已在售卖清单中");
      return;
    }

    setLoading(true);
    setErr(null);
    try {
      await addStoreSku(storeId, { item_id: iid });
      search.setSelectedItemId("");
      await reloadStoreSkus();
      void reloadAllInventories();
    } catch (e) {
      if (isNotImplemented(e)) {
        setApiMissing(true);
        setErr(null);
      } else {
        setErr(errMsg(e, "加入商品失败"));
      }
    } finally {
      setLoading(false);
    }
  }

  async function removeSku(itemId: number) {
    if (!canWrite) return;
    const ok = window.confirm(`确认从该商铺移除商品（编号：${itemId}）？`);
    if (!ok) return;

    setLoading(true);
    setErr(null);
    try {
      await removeStoreSku(storeId, itemId);
      await reloadStoreSkus();
      void reloadAllInventories();
    } catch (e) {
      if (isNotImplemented(e)) {
        setApiMissing(true);
        setErr(null);
      } else {
        setErr(errMsg(e, "移除商品失败"));
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
    kw: search.kw,
    setKw: search.setKw,
    cands: search.cands,
    itemsLoading: search.itemsLoading,
    itemsError: search.itemsError,
    selectedItemId: search.selectedItemId,
    setSelectedItemId: search.setSelectedItemId,
    triggerSearch: search.triggerSearch,

    // inventory
    inventoryByItemId: inv.inventoryByItemId,
    invLoadingItemIds: inv.invLoadingItemIds,
    invLoadingAny: inv.invLoadingAny,
    invError: inv.invError,
    reloadAllInventories,

    // warehouses meta
    warehouseOptions,

    // actions
    addSelectedSku,
    removeSku,
  };
}
