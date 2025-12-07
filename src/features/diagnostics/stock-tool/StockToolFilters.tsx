// src/features/diagnostics/stock-tool/StockToolFilters.tsx
import React from "react";
import { SectionCard } from "../../../components/wmsdu/SectionCard";

type StockToolFiltersProps = {
  itemId: string;
  warehouseId: string;
  batchCodeCtx: string;
  loading: boolean;
  onChangeItemId: (value: string) => void;
  onChangeWarehouseId: (value: string) => void;
  onChangeBatchCodeCtx: (value: string) => void;
  onSubmit: () => void;
};

export const StockToolFilters: React.FC<StockToolFiltersProps> = ({
  itemId,
  warehouseId,
  batchCodeCtx,
  loading,
  onChangeItemId,
  onChangeWarehouseId,
  onChangeBatchCodeCtx,
  onSubmit,
}) => {
  return (
    <SectionCard
      title="库存工具（StockTool）"
      description="按 item + 仓库 维度查看批次分布与 FEFO 相关信息，是当前蓝图下“库存显微镜”视图。"
      className="rounded-none p-6 md:p-7 space-y-4"
      headerRight={
        <button
          onClick={onSubmit}
          disabled={loading}
          className="inline-flex items-center rounded-md bg-slate-900 px-6 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {loading ? "查询中..." : "查询"}
        </button>
      }
    >
      <div className="grid gap-4 text-sm md:grid-cols-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-700">
            Item ID（必填）
          </span>
          <input
            className="h-11 w-full rounded border border-slate-300 px-3 text-sm"
            placeholder="如 1001，可从 Trace / Items 复制"
            value={itemId}
            onChange={(e) => onChangeItemId(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-700">
            仓库 ID（可选）
          </span>
          <input
            className="h-11 w-full rounded border border-slate-300 px-3 text-sm"
            placeholder="如 1（留空 = 所有仓）"
            value={warehouseId}
            onChange={(e) => onChangeWarehouseId(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">
            批次编码（上下文，不参与过滤）
          </span>
          <input
            className="h-11 w-full rounded border border-slate-300 px-3 text-sm"
            placeholder="可从 Ledger / Trace 带入，用于人工对照 & 高亮"
            value={batchCodeCtx}
            onChange={(e) => onChangeBatchCodeCtx(e.target.value)}
          />
        </div>
      </div>
    </SectionCard>
  );
};
