// src/features/inventory/snapshot/useSnapshotPageController.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchInventorySnapshot,
  fetchItemDetail,
  type InventoryRow,
  type ItemDetailResponse,
} from "./api";
import { sortSnapshotRows, type SortDir, type SortKey } from "./snapshotSort";

type ApiErrorShape = { message?: string };

const PAGE_SIZE = 20;

export function useSnapshotPageController() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 后端搜索关键字（真正参与请求）
  const [q, setQ] = useState("");
  // 输入框里的即时内容
  const [searchInput, setSearchInput] = useState("");

  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerItem, setDrawerItem] = useState<ItemDetailResponse | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerItemId, setDrawerItemId] = useState<number | null>(null);

  const [nearOnly, setNearOnly] = useState(false);

  const [sortKey, setSortKey] = useState<SortKey>("item_name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // 用一个 token 统一触发“事实刷新”（列表）
  const [refreshToken, setRefreshToken] = useState(0);
  const triggerRefresh = useCallback(() => setRefreshToken((x) => x + 1), []);

  // 加载库存快照（事实：只信后端返回）
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchInventorySnapshot(q, offset, PAGE_SIZE);
        if (cancelled) return;
        setRows(res.rows);
        setTotal(res.total);
      } catch (err) {
        if (cancelled) return;
        const e = err as ApiErrorShape;
         
        console.error("Failed to fetch snapshot:", err);
        setError(e?.message || "加载库存快照失败");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [q, offset, refreshToken]);

  // “commit 后立刻可见”的最小实现：窗口聚焦/可见时刷新一次
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

  // 先应用“只看临期”过滤（展示层）
  const filteredRows = useMemo(
    () => (nearOnly ? rows.filter((r) => r.near_expiry) : rows),
    [rows, nearOnly],
  );

  // 排序（展示层）
  const sortedRows = useMemo(
    () => sortSnapshotRows(filteredRows, sortKey, sortDir),
    [filteredRows, sortKey, sortDir],
  );

  const canPrev = offset > 0;
  const canNext = offset + PAGE_SIZE < total;

  const loadItemDetail = useCallback(async (itemId: number) => {
    setDrawerLoading(true);
    setDrawerItem(null);
    try {
      const data = await fetchItemDetail(itemId);
      setDrawerItem(data);
    } catch (err) {
       
      console.error("Failed to fetch item detail:", err);
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
    setSortKey((prevKey) => {
      if (prevKey === key) {
        setSortDir((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
        return prevKey;
      }
      setSortDir(key === "total_qty" || key === "top_qty" ? "desc" : "asc");
      return key;
    });
  }, []);

  const submitSearch = useCallback(() => {
    setOffset(0);
    setQ(searchInput.trim());
  }, [searchInput]);

  return {
    // list
    rows: sortedRows,
    loading,
    error,

    // search/filter
    searchInput,
    setSearchInput,
    nearOnly,
    setNearOnly,
    submitSearch,

    // paging
    total,
    offset,
    pageSize: PAGE_SIZE,
    canPrev,
    canNext,
    prevPage: () => canPrev && setOffset((x) => Math.max(0, x - PAGE_SIZE)),
    nextPage: () => canNext && setOffset((x) => x + PAGE_SIZE),

    // sorting
    sortKey,
    sortDir,
    changeSort,

    // refresh
    triggerRefresh,

    // drawer
    drawerOpen,
    drawerItem,
    drawerLoading,
    openItemDetail,
    closeDrawer,
    refreshDrawer,
  };
}
