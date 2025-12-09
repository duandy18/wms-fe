// src/features/inventory/snapshot/SnapshotPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import PageTitle from "../../../components/ui/PageTitle";
import InventoryDrawer from "../../../components/snapshot/InventoryDrawer";
import SnapshotTable from "./SnapshotTable";
import { SnapshotFilters } from "./SnapshotFilters";
import {
  fetchInventorySnapshot,
  fetchItemDetail,
  type InventoryRow,
  type ItemDetailResponse,
} from "./api";

const PAGE_SIZE = 20;

// 表格支持的排序字段
export type SortKey =
  | "item_name"
  | "total_qty"
  | "earliest_expiry"
  | "near_expiry"
  | "top_qty";

type ApiErrorShape = {
  message?: string;
};

const SnapshotPage: React.FC = () => {
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

  const [nearOnly, setNearOnly] = useState(false);

  const [sortKey, setSortKey] = useState<SortKey>("item_name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // 加载库存快照
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
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [q, offset]);

  // 先应用“只看临期”过滤
  const filteredRows = useMemo(
    () => (nearOnly ? rows.filter((r) => r.near_expiry) : rows),
    [rows, nearOnly],
  );

  // 排序逻辑
  const sortedRows = useMemo(() => {
    const arr = [...filteredRows];

    const parseDate = (s: string | null) => (s ? new Date(s) : undefined);

    arr.sort((a, b) => {
      let cmp = 0;

      if (sortKey === "item_name") {
        cmp = a.item_name.localeCompare(b.item_name, "zh-CN");
      } else if (sortKey === "total_qty") {
        cmp = a.total_qty - b.total_qty;
      } else if (sortKey === "earliest_expiry") {
        const da = parseDate(a.earliest_expiry);
        const db = parseDate(b.earliest_expiry);
        if (da && db) {
          cmp = da.getTime() - db.getTime();
        } else if (da && !db) {
          cmp = -1;
        } else if (!da && db) {
          cmp = 1;
        } else {
          cmp = 0;
        }
      } else if (sortKey === "near_expiry") {
        const av = a.near_expiry ? 1 : 0;
        const bv = b.near_expiry ? 1 : 0;
        cmp = av - bv;
      } else if (sortKey === "top_qty") {
        const aTop = a.top2_locations[0]?.qty ?? 0;
        const bTop = b.top2_locations[0]?.qty ?? 0;
        cmp = aTop - bTop;
      }

      if (cmp === 0) {
        cmp = a.item_id - b.item_id;
      }

      return sortDir === "asc" ? cmp : -cmp;
    });

    return arr;
  }, [filteredRows, sortKey, sortDir]);

  const canPrev = offset > 0;
  const canNext = offset + PAGE_SIZE < total;

  const openItemDetail = async (row: InventoryRow) => {
    setDrawerOpen(true);
    setDrawerLoading(true);
    setDrawerItem(null);
    try {
      const data = await fetchItemDetail(row.item_id);
      setDrawerItem(data);
    } catch (err) {
      console.error("Failed to fetch item detail:", err);
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  const handleChangeSort = (key: SortKey) => {
    setSortKey((prevKey) => {
      if (prevKey === key) {
        setSortDir((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
        return prevKey;
      }
      setSortDir(key === "total_qty" || key === "top_qty" ? "desc" : "asc");
      return key;
    });
  };

  return (
    <div className="space-y-4">
      <PageTitle
        title="即时库存 / FEFO 风险"
        description="基于实时 stocks + batches 的库存视图，仅展示当前有库存的商品。支持按名称、库存、到期日、临期状态和 TOP 批次排序。"
      />

      {/* 搜索 + 过滤 */}
      <SnapshotFilters
        searchInput={searchInput}
        nearOnly={nearOnly}
        loading={loading}
        onChangeSearchInput={setSearchInput}
        onChangeNearOnly={setNearOnly}
        onSubmit={() => {
          setOffset(0);
          setQ(searchInput.trim());
        }}
      />

      {/* 主体内容：只有表格 */}
      <div className="mt-2">
        {loading && (
          <div className="py-6 text-sm text-slate-500">
            正在加载库存快照…
          </div>
        )}
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && sortedRows.length === 0 && (
          <div className="py-6 text-sm text-slate-500">
            当前条件下没有库存记录。
          </div>
        )}

        {!loading && !error && sortedRows.length > 0 && (
          <SnapshotTable
            items={sortedRows}
            loading={loading}
            onRowClick={openItemDetail}
            sortKey={sortKey}
            sortDir={sortDir}
            onChangeSort={handleChangeSort}
          />
        )}
      </div>

      {/* 分页控制 */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <div>
          共 {total} 条记录；每页 {PAGE_SIZE} 条；当前页{" "}
          {Math.floor(offset / PAGE_SIZE) + 1}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!canPrev}
            onClick={() =>
              canPrev && setOffset(Math.max(0, offset - PAGE_SIZE))
            }
            className={`inline-flex h-8 items-center rounded-full px-3 ${
              canPrev
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                : "cursor-not-allowed bg-slate-50 text-slate-300"
            }`}
          >
            上一页
          </button>
          <button
            type="button"
            disabled={!canNext}
            onClick={() => canNext && setOffset(offset + PAGE_SIZE)}
            className={`inline-flex h-8 items-center rounded-full px-3 ${
              canNext
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                : "cursor-not-allowed bg-slate-50 text-slate-300"
            }`}
          >
            下一页
          </button>
        </div>
      </div>

      {/* 抽屉：单品明细 */}
      <InventoryDrawer
        open={drawerOpen}
        item={drawerItem}
        loading={drawerLoading}
        onClose={handleCloseDrawer}
      />
    </div>
  );
};

export default SnapshotPage;
