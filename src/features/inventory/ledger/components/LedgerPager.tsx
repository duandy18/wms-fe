// src/features/inventory/ledger/components/LedgerPager.tsx
import React from "react";

type Props = {
  loading: boolean;
  rowsLen: number;
  total: number;
  pageSize: number;
  offset: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export const LedgerPager: React.FC<Props> = ({
  loading,
  rowsLen,
  total,
  pageSize,
  offset,
  canPrev,
  canNext,
  onPrev,
  onNext,
}) => {
  return (
    <div className="flex items-center justify-between px-3 py-2 text-xs text-slate-500 rounded-xl border border-slate-200 bg-white">
      <div>
        显示 {rowsLen} 条 / 共 {total} 条；每页 {pageSize}；当前页 {Math.floor(offset / pageSize) + 1}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!canPrev || loading}
          onClick={onPrev}
          className={`inline-flex h-8 items-center rounded-full px-3 ${
            canPrev && !loading
              ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
              : "cursor-not-allowed bg-slate-50 text-slate-300"
          }`}
        >
          上一页
        </button>

        <button
          type="button"
          disabled={!canNext || loading}
          onClick={onNext}
          className={`inline-flex h-8 items-center rounded-full px-3 ${
            canNext && !loading
              ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
              : "cursor-not-allowed bg-slate-50 text-slate-300"
          }`}
        >
          下一页
        </button>
      </div>
    </div>
  );
};
