import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  fetchInventoryItemDetail,
  fetchInventoryPage,
} from "@/features/wms/inventory/api/inventory";
import type {
  InventoryDetailResponse,
  InventoryRow,
} from "@/features/wms/inventory/api/contracts";
import { sortInventoryRows, type SortDir, type SortKey } from "./inventorySort";

type ApiErrorShape = { message?: string };

const PAGE_SIZE = 20;

type SortState = {
  key: SortKey;
  dir: SortDir;
};

type SortAction =
  | { type: "CHANGE_SORT"; key: SortKey }
  | { type: "RESET"; key?: SortKey; dir?: SortDir };

function parsePositiveInt(v: string | null): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function defaultSortDir(key: SortKey): SortDir {
  return key === "qty" ? "desc" : "asc";
}

function sortReducer(state: SortState, action: SortAction): SortState {
  if (action.type === "RESET") {
    const nextKey = action.key ?? state.key;
    const nextDir = action.dir ?? defaultSortDir(nextKey);
    return { key: nextKey, dir: nextDir };
  }

  if (action.type === "CHANGE_SORT") {
    const key = action.key;
    if (state.key === key) {
      return { key: state.key, dir: state.dir === "asc" ? "desc" : "asc" };
    }
    return { key, dir: defaultSortDir(key) };
  }

  return state;
}

export function useInventoryPageModel() {
  const [sp, setSp] = useSearchParams();

  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [itemIdFilter, setItemIdFilter] = useState<number | null>(null);
  const [warehouseIdFilter, setWarehouseIdFilter] = useState<number | null>(null);
  const [lotCodeFilter, setLotCodeFilter] = useState<string>("");

  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerItem, setDrawerItem] = useState<InventoryDetailResponse | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerItemId, setDrawerItemId] = useState<number | null>(null);

  const [nearOnly, setNearOnly] = useState(false);

  const [sortState, dispatchSort] = useReducer(sortReducer, {
    key: "item_name",
    dir: "asc",
  });

  const [refreshToken, setRefreshToken] = useState(0);
  const triggerRefresh = useCallback(() => setRefreshToken((x) => x + 1), []);

  useEffect(() => {
    const nextQ = (sp.get("q") ?? "").trim();
    const nextItemId = parsePositiveInt(sp.get("item_id"));
    const nextWarehouseId = parsePositiveInt(sp.get("warehouse_id"));
    const nextLotCode = (sp.get("lot_code") ?? "").trim();
    const nextNear = (sp.get("near_expiry") ?? "").trim() === "true";

    setQ(nextQ);
    setSearchInput(nextQ);
    setItemIdFilter(nextItemId);
    setWarehouseIdFilter(nextWarehouseId);
    setLotCodeFilter(nextLotCode);
    setNearOnly(nextNear);
    setOffset(0);
  }, [sp]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchInventoryPage({
          q: q || undefined,
          item_id: itemIdFilter ?? undefined,
          warehouse_id: warehouseIdFilter ?? undefined,
          lot_code: lotCodeFilter || undefined,
          near_expiry: nearOnly || undefined,
          offset,
          limit: PAGE_SIZE,
        });
        if (cancelled) return;
        setRows(res.rows);
        setTotal(res.total);
      } catch (err) {
        if (cancelled) return;
        const e = err as ApiErrorShape;
        console.error("Failed to fetch inventory:", err);
        setError(e?.message || "加载库存失败");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [q, itemIdFilter, warehouseIdFilter, lotCodeFilter, nearOnly, offset, refreshToken]);

  useEffect(() => {
    const onFocus = () => triggerRefresh();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") triggerRefresh();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [triggerRefresh]);

  const sortedRows = useMemo(
    () => sortInventoryRows(rows, sortState.key, sortState.dir),
    [rows, sortState.key, sortState.dir],
  );

  const canPrev = offset > 0;
  const canNext = offset + PAGE_SIZE < total;

  const loadItemDetail = useCallback(async (itemId: number) => {
    setDrawerLoading(true);
    setDrawerItem(null);
    try {
      const data = await fetchInventoryItemDetail(itemId);
      setDrawerItem(data);
    } catch (err) {
      console.error("Failed to fetch inventory item detail:", err);
    } finally {
      setDrawerLoading(false);
    }
  }, []);

  const openItemDetail = useCallback(
    async (row: InventoryRow) => {
      setDrawerOpen(true);
      setDrawerItemId(row.item_id);
      await loadItemDetail(row.item_id);
    },
    [loadItemDetail],
  );

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const refreshDrawer = useCallback(async () => {
    if (!drawerItemId) return;
    await loadItemDetail(drawerItemId);
    triggerRefresh();
  }, [drawerItemId, loadItemDetail, triggerRefresh]);

  const changeSort = useCallback((key: SortKey) => {
    dispatchSort({ type: "CHANGE_SORT", key });
  }, []);

  const submitSearch = useCallback(() => {
    const next = new URLSearchParams();
    const nextQ = searchInput.trim();
    if (nextQ) next.set("q", nextQ);
    if (nearOnly) next.set("near_expiry", "true");
    setSp(next);
  }, [searchInput, nearOnly, setSp]);

  const clearSearch = useCallback(() => {
    setSp(new URLSearchParams());
    triggerRefresh();
  }, [setSp, triggerRefresh]);

  return {
    rows: sortedRows,
    loading,
    error,

    searchInput,
    setSearchInput,
    nearOnly,
    setNearOnly,
    submitSearch,
    clearSearch,

    total,
    offset,
    pageSize: PAGE_SIZE,
    canPrev,
    canNext,
    prevPage: () => canPrev && setOffset((x) => Math.max(0, x - PAGE_SIZE)),
    nextPage: () => canNext && setOffset((x) => x + PAGE_SIZE),

    sortKey: sortState.key,
    sortDir: sortState.dir,
    changeSort,

    triggerRefresh,

    drawerOpen,
    drawerItem,
    drawerLoading,
    openItemDetail,
    closeDrawer,
    refreshDrawer,
  };
}
