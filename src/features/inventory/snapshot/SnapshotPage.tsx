// src/features/inventory/snapshot/SnapshotPage.tsx
import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import PageTitle from "../../../components/ui/PageTitle";
import InventoryDrawer from "../../../components/snapshot/InventoryDrawer";
import SnapshotTable from "./SnapshotTable";
import { SnapshotFilters } from "./SnapshotFilters";
import { useSnapshotPageController } from "./useSnapshotPageController";
import type { SortKey } from "./snapshotSort";

// 继续对外导出 SortKey，避免别处 import 路径变化（SnapshotTable 仍从 SnapshotPage 引用）
export type { SortKey };

function parseBool(v: string | null): boolean {
  const x = String(v ?? "").trim().toLowerCase();
  return x === "1" || x === "true" || x === "yes" || x === "on";
}

function parsePositiveInt(v: string | null): number | null {
  if (!v) return null;
  const n = Number(String(v).trim());
  if (!Number.isFinite(n)) return null;
  const x = Math.floor(n);
  return x > 0 ? x : null;
}

const SnapshotPage: React.FC = () => {
  const c = useSnapshotPageController();
  const [sp, setSp] = useSearchParams();

  // ---------- URL 参数（来自入库/回仓 commit 跳转） ----------
  const urlTaskId = useMemo(() => parsePositiveInt(sp.get("task_id")), [sp]);
  const urlTraceId = useMemo(() => (sp.get("trace_id") ?? "").trim(), [sp]);
  const urlQ = useMemo(() => (sp.get("q") ?? "").trim(), [sp]);
  const urlNearOnly = useMemo(() => parseBool(sp.get("near_only")), [sp]);

  const hasJumpHint = Boolean(urlTaskId || urlTraceId || urlQ || urlNearOnly);

  const applyUrlFilters = () => {
    // ✅ 只回填 + 手动提交（不自动）
    if (urlQ) c.setSearchInput(urlQ);
    if (urlNearOnly) c.setNearOnly(true);
    c.submitSearch();
  };

  const clearUrlFilters = () => {
    const next = new URLSearchParams(sp);
    next.delete("task_id");
    next.delete("trace_id");
    next.delete("q");
    next.delete("near_only");
    setSp(next);
  };

  return (
    <div className="space-y-4">
      <PageTitle
        title="即时库存 / FEFO 风险"
        description="基于实时 stocks + batches 的库存视图，仅展示当前有库存的商品。支持按名称、库存、到期日、临期状态和 TOP 批次排序。"
      />

      {/* 来自作业跳转的提示条：只提示 + 给按钮；不自动提交，不自动刷新 */}
      {hasJumpHint ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-2 text-slate-700">
            <span className="font-medium">已收到定位条件：</span>
            {urlTaskId ? (
              <span className="rounded-full bg-white px-2 py-0.5 border border-slate-200">
                task_id={urlTaskId}
              </span>
            ) : null}
            {urlTraceId ? (
              <span className="rounded-full bg-white px-2 py-0.5 border border-slate-200">
                trace_id={urlTraceId}
              </span>
            ) : null}
            {urlQ ? (
              <span className="rounded-full bg-white px-2 py-0.5 border border-slate-200">
                q={urlQ}
              </span>
            ) : null}
            {urlNearOnly ? (
              <span className="rounded-full bg-white px-2 py-0.5 border border-slate-200">
                near_only=true
              </span>
            ) : null}
            <span className="text-slate-500">（不会自动搜索）</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={applyUrlFilters}
              className="inline-flex h-7 items-center rounded-full bg-slate-900 px-3 text-[12px] font-medium text-white hover:bg-slate-800"
            >
              应用筛选
            </button>
            <button
              type="button"
              onClick={clearUrlFilters}
              className="inline-flex h-7 items-center rounded-full border border-slate-300 bg-white px-3 text-[12px] text-slate-700 hover:bg-slate-100"
            >
              清空定位
            </button>
          </div>
        </div>
      ) : null}

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
        {c.loading && <div className="py-6 text-sm text-slate-500">正在加载库存快照…</div>}
        {c.error && <div className="rounded-md bg-red-50 p-3 text-xs text-red-700">{c.error}</div>}

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
          共 {c.total} 条记录；每页 {c.pageSize} 条；当前页 {Math.floor(c.offset / c.pageSize) + 1}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!c.canPrev}
            onClick={c.prevPage}
            className={`inline-flex h-8 items-center rounded-full px-3 ${
              c.canPrev ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "cursor-not-allowed bg-slate-50 text-slate-300"
            }`}
          >
            上一页
          </button>
          <button
            type="button"
            disabled={!c.canNext}
            onClick={c.nextPage}
            className={`inline-flex h-8 items-center rounded-full px-3 ${
              c.canNext ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "cursor-not-allowed bg-slate-50 text-slate-300"
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
