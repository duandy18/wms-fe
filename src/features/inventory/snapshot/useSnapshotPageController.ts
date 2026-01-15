// src/features/inventory/snapshot/useSnapshotPageController.ts
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import {
  fetchInventorySnapshot,
  fetchItemDetail,
  type InventoryRow,
  type ItemDetailResponse,
} from "./api";
import { sortSnapshotRows, type SortDir, type SortKey } from "./snapshotSort";

type ApiErrorShape = { message?: string };

const PAGE_SIZE = 20;

type SortState = {
  key: SortKey;
  dir: SortDir;
};

type SortAction =
  | { type: "CHANGE_SORT"; key: SortKey }
  | { type: "RESET"; key?: SortKey; dir?: SortDir };

function defaultSortDir(key: SortKey): SortDir {
  // ✅ 规则：库存数量类默认 desc，其它默认 asc
  return key === "total_qty" ? "desc" : "asc";
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
      // ✅ 同列：稳定翻转 asc/desc
      return { key: state.key, dir: state.dir === "asc" ? "desc" : "asc" };
    }
    // ✅ 换列：按规则给默认方向（原子更新，不交叉 setState）
    return { key, dir: defaultSortDir(key) };
  }

  return state;
}

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

  // ✅ 排序状态机（原子更新）
  const [sortState, dispatchSort] = useReducer(sortReducer, {
    key: "item_name",
    dir: "asc",
  });

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
    () => sortSnapshotRows(filteredRows, sortState.key, sortState.dir),
    [filteredRows, sortState.key, sortState.dir],
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

  // ✅ 排序切换：只 dispatch（不会出现交叉 setState）
  const changeSort = useCallback((key: SortKey) => {
    dispatchSort({ type: "CHANGE_SORT", key });
  }, []);

  const submitSearch = useCallback(() => {
    setOffset(0);
    const next = searchInput.trim();
    setQ(next); // next 为空 => 回到全量
  }, [searchInput]);

  const clearSearch = useCallback(() => {
    // ✅ 原子化清空：输入框 + 后端 q + 分页 + 临期过滤 一起归零
    setSearchInput("");
    setQ("");
    setNearOnly(false);
    setOffset(0);
    triggerRefresh();
  }, [triggerRefresh]);

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
    clearSearch,

    // paging
    total,
    offset,
    pageSize: PAGE_SIZE,
    canPrev,
    canNext,
    prevPage: () => canPrev && setOffset((x) => Math.max(0, x - PAGE_SIZE)),
    nextPage: () => canNext && setOffset((x) => x + PAGE_SIZE),

    // sorting
    sortKey: sortState.key,
    sortDir: sortState.dir,
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
