// src/features/diagnostics/trace/TraceFilters.tsx
//
// Trace 事件视图顶部的过滤区：
// - trace_id 输入
// - warehouse_id 过滤
// - 视图模式：timeline / grouped
// - 查询按钮 + 简要 meta

import React from "react";

export type ViewMode = "timeline" | "grouped";

type Props = {
  traceId: string;
  warehouseId: string;
  viewMode: ViewMode;
  loading: boolean;
  error: string | null;
  metaText: string | null;
  onChangeTraceId: (v: string) => void;
  onChangeWarehouseId: (v: string) => void;
  onChangeViewMode: (m: ViewMode) => void;
  onSubmit: () => void;
};

export const TraceFilters: React.FC<Props> = ({
  traceId,
  warehouseId,
  viewMode,
  loading,
  error,
  metaText,
  onChangeTraceId,
  onChangeWarehouseId,
  onChangeViewMode,
  onSubmit,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs">
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-end gap-3"
      >
        {/* trace_id 输入 */}
        <div className="flex flex-col">
          <label className="text-[11px] text-slate-600">
            trace_id
          </label>
          <input
            className="mt-1 h-8 w-64 rounded border border-slate-300 px-2 text-xs font-mono"
            placeholder="例如 demo:order:PDD:1:DEMO-..."
            value={traceId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onChangeTraceId(e.target.value)
            }
          />
        </div>

        {/* 仓库过滤 */}
        <div className="flex flex-col">
          <label className="text-[11px] text-slate-600">
            warehouse_id（可选）
          </label>
          <input
            className="mt-1 h-8 w-28 rounded border border-slate-300 px-2 text-xs font-mono"
            placeholder="如 1"
            value={warehouseId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onChangeWarehouseId(e.target.value)
            }
          />
        </div>

        {/* 视图模式切换 */}
        <div className="flex flex-col">
          <span className="text-[11px] text-slate-600 mb-1">
            视图模式
          </span>
          <div className="inline-flex rounded-full bg-slate-900/5 p-0.5">
            <button
              type="button"
              className={
                "px-3 py-1 rounded-full text-[11px] " +
                (viewMode === "timeline"
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-900/10")
              }
              onClick={() => onChangeViewMode("timeline")}
            >
              时间线视图
            </button>
            <button
              type="button"
              className={
                "px-3 py-1 rounded-full text-[11px] " +
                (viewMode === "grouped"
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-900/10")
              }
              onClick={() => onChangeViewMode("grouped")}
            >
              按 ref 分组
            </button>
          </div>
        </div>

        {/* 查询按钮 */}
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={loading || !traceId.trim()}
            className="h-8 rounded-md bg-slate-900 px-4 text-[11px] font-medium text-white disabled:opacity-60"
          >
            {loading ? "查询中…" : "查询 Trace"}
          </button>
          {error && (
            <span className="text-[11px] text-red-600 max-w-xs">
              {error}
            </span>
          )}
        </div>
      </form>

      {/* meta 信息 */}
      {metaText && !error && (
        <div className="mt-2 text-[11px] text-slate-500">
          {metaText}
        </div>
      )}
    </section>
  );
};
