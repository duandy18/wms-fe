// src/features/inventory/snapshot/SnapshotPage.tsx
import React from "react";
import PageTitle from "../../../components/ui/PageTitle";
import InventoryDrawer from "../../../components/snapshot/InventoryDrawer";
import SnapshotTable from "./SnapshotTable";
import { SnapshotFilters } from "./SnapshotFilters";
import { useSnapshotPageController } from "./useSnapshotPageController";
import type { SortKey } from "./snapshotSort";

// 继续对外导出 SortKey，避免别处 import 路径变化（SnapshotTable 仍从 SnapshotPage 引用）
export type { SortKey };

const SnapshotPage: React.FC = () => {
  const c = useSnapshotPageController();

  return (
    <div className="space-y-4">
      <PageTitle
        title="即时库存 / FEFO 风险"
        description="基于实时 stocks + batches 的库存视图，仅展示当前有库存的商品。支持按名称、库存、到期日、临期状态和 TOP 批次排序。"
      />

      {/* 搜索 + 过滤 */}
      <SnapshotFilters
        searchInput={c.searchInput}
        nearOnly={c.nearOnly}
        loading={c.loading}
        onChangeSearchInput={c.setSearchInput}
        onChangeNearOnly={c.setNearOnly}
        onSubmit={c.submitSearch}
      />

      {/* 操作条：刷新（事实刷新，不猜测） */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500">
          只展示后端事实；回仓/入库/出库 commit 后，切回本页会自动刷新。
        </div>
        <button
          type="button"
          onClick={c.triggerRefresh}
          className="inline-flex h-8 items-center rounded-full bg-slate-100 px-3 text-xs text-slate-700 hover:bg-slate-200"
        >
          刷新库存
        </button>
      </div>

      {/* 主体内容：只有表格 */}
      <div className="mt-2">
        {c.loading && (
          <div className="py-6 text-sm text-slate-500">正在加载库存快照…</div>
        )}
        {c.error && (
          <div className="rounded-md bg-red-50 p-3 text-xs text-red-700">{c.error}</div>
        )}

        {!c.loading && !c.error && c.rows.length === 0 && (
          <div className="py-6 text-sm text-slate-500">当前条件下没有库存记录。</div>
        )}

        {!c.loading && !c.error && c.rows.length > 0 && (
          <SnapshotTable
            items={c.rows}
            loading={c.loading}
            onRowClick={c.openItemDetail}
            sortKey={c.sortKey as SortKey}
            sortDir={c.sortDir}
            onChangeSort={c.changeSort}
          />
        )}
      </div>

      {/* 分页控制 */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <div>
          共 {c.total} 条记录；每页 {c.pageSize} 条；当前页{" "}
          {Math.floor(c.offset / c.pageSize) + 1}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!c.canPrev}
            onClick={c.prevPage}
            className={`inline-flex h-8 items-center rounded-full px-3 ${
              c.canPrev
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                : "cursor-not-allowed bg-slate-50 text-slate-300"
            }`}
          >
            上一页
          </button>
          <button
            type="button"
            disabled={!c.canNext}
            onClick={c.nextPage}
            className={`inline-flex h-8 items-center rounded-full px-3 ${
              c.canNext
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
        open={c.drawerOpen}
        item={c.drawerItem}
        loading={c.drawerLoading}
        onClose={c.closeDrawer}
        onRefresh={c.refreshDrawer}
      />
    </div>
  );
};

export default SnapshotPage;
