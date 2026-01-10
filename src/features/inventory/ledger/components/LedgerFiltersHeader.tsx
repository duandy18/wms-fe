// src/features/inventory/ledger/components/LedgerFiltersHeader.tsx
import React from "react";

type Props = {
  summary: string;
  loading: boolean;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onQuery: () => void;
  onClear: () => void;
};

export const LedgerFiltersHeader: React.FC<Props> = ({
  summary,
  loading,
  collapsed,
  onToggleCollapsed,
  onQuery,
  onClear,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
      <div className="text-xs text-slate-600">{summary}</div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={onQuery}
          className="inline-flex h-8 items-center rounded-full bg-slate-900 px-4 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? "查询中…" : "查询"}
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={onClear}
          className="inline-flex h-8 items-center rounded-full border border-slate-300 bg-white px-4 text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-60"
        >
          清空
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={onToggleCollapsed}
          className="inline-flex h-8 items-center rounded-full border border-slate-300 bg-white px-4 text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-60"
        >
          {collapsed ? "展开筛选" : "收起筛选"}
        </button>
      </div>
    </div>
  );
};
