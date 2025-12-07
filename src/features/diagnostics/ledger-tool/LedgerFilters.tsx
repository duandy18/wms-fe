// src/features/diagnostics/ledger-tool/LedgerFilters.tsx
import React from "react";
import { SectionCard } from "../../../components/wmsdu/SectionCard";
import type { LedgerViewMode } from "./LedgerToolPage";

type Props = {
  // 视图模式：明细 / 总账
  viewMode: LedgerViewMode;
  setViewMode: (mode: LedgerViewMode) => void;

  itemKeyword: string;
  setItemKeyword: (v: string) => void;
  warehouseId: string;
  setWarehouseId: (v: string) => void;
  batchCode: string;
  setBatchCode: (v: string) => void;
  reason: string;
  setReason: (v: string) => void;
  ref: string;
  setRef: (v: string) => void;
  traceId: string;
  setTraceId: (v: string) => void;
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  loadingQuery: boolean;
  loadingReconcile: boolean;
  onQuery: () => void;
  onReconcile: () => void;
};

export const LedgerFilters: React.FC<Props> = ({
  viewMode,
  setViewMode,
  itemKeyword,
  setItemKeyword,
  warehouseId,
  setWarehouseId,
  batchCode,
  setBatchCode,
  reason,
  setReason,
  ref,
  setRef,
  traceId,
  setTraceId,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  loadingQuery,
  loadingReconcile,
  onQuery,
  onReconcile,
}) => {
  const isBook = viewMode === "book";

  const desc =
    viewMode === "detail"
      ? "查看 / 查询 / 对账库存台账：按 SKU / 仓库 / 批次 / 原因 / 引用 / 时间窗口过滤。"
      : "台账总账视图：仅按时间窗口 + 仓库过滤，适合通览某段时间内的全部库存变动。";

  return (
    <SectionCard
      title="账本工具（LedgerTool）"
      description={desc}
      className="rounded-none p-6 md:p-7 space-y-4"
      headerRight={
        <div className="flex items-center gap-3">
          {/* 视图模式切换 */}
          <div className="inline-flex rounded-full bg-slate-900/5 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("detail")}
              className={
                "px-3 py-1 rounded-full transition " +
                (viewMode === "detail"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-900/10")
              }
            >
              明细视图
            </button>
            <button
              type="button"
              onClick={() => setViewMode("book")}
              className={
                "px-3 py-1 rounded-full transition " +
                (viewMode === "book"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-900/10")
              }
            >
              总账视图
            </button>
          </div>

          {/* 查询 / 对账按钮 */}
          <div className="flex gap-2">
            <button
              onClick={onQuery}
              disabled={loadingQuery}
              className="inline-flex items-center rounded-md bg-slate-900 px-6 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
            >
              {loadingQuery ? "查询中..." : "查询"}
            </button>
            <button
              onClick={onReconcile}
              disabled={loadingReconcile}
              className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {loadingReconcile ? "对账中..." : "对账"}
            </button>
          </div>
        </div>
      }
    >
      <div className="grid gap-4 text-sm md:grid-cols-3 lg:grid-cols-4">
        {/* 商品关键词（总账模式禁用） */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-700">
            商品关键词
          </span>
          <input
            className="h-11 px-3 border rounded text-sm disabled:bg-slate-100 disabled:text-slate-400"
            placeholder="按名称 / SKU 模糊搜索"
            value={itemKeyword}
            onChange={(e) => setItemKeyword(e.target.value)}
            disabled={isBook}
          />
        </div>

        {/* 仓库 ID（两种模式都可用） */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-700">
            仓库 ID
          </span>
          <input
            className="h-11 px-3 border rounded text-sm"
            placeholder="仓库 ID（如 1）"
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
          />
        </div>

        {/* 批次编码（总账模式禁用） */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-700">
            批次编码 (batch_code)
          </span>
          <input
            className="h-11 px-3 border rounded text-sm disabled:bg-slate-100 disabled:text-slate-400"
            placeholder="批次编码，可从 Trace / StockTool 带入"
            value={batchCode}
            onChange={(e) => setBatchCode(e.target.value)}
            disabled={isBook}
          />
        </div>

        {/* ref（总账模式禁用） */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-700">ref</span>
          <input
            className="h-11 px-3 border rounded text-sm disabled:bg-slate-100 disabled:text-slate-400"
            placeholder="scan_ref / 订单 ref，从 Trace / DevConsole 带入"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            disabled={isBook}
          />
        </div>

        {/* trace_id（总账模式禁用） */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-700">
            trace_id
          </span>
          <input
            className="h-11 px-3 border rounded text-sm disabled:bg-slate-100 disabled:text-slate-400"
            placeholder="从 Trace 页面带入 trace_id"
            value={traceId}
            onChange={(e) => setTraceId(e.target.value)}
            disabled={isBook}
          />
        </div>

        {/* 原因 reason（总账模式禁用） */}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">原因 (reason)</span>
          <input
            className="h-11 px-3 border rounded text-sm disabled:bg-slate-100 disabled:text-slate-400"
            placeholder="如 RECEIPT / COUNT / SHIPMENT"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isBook}
          />
        </div>

        {/* 日期 从 */}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">日期 从</span>
          <input
            type="date"
            className="h-11 px-3 border rounded text-sm"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        {/* 日期 到 */}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">日期 到</span>
          <input
            type="date"
            className="h-11 px-3 border rounded text-sm"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>
    </SectionCard>
  );
};
