// src/features/inventory/ledger/components/LedgerRangeBar.tsx
import React from "react";

type Props = {
  loading: boolean;
  pageSize: number;
  onPick: (range: "7d" | "30d" | "90d") => void;
};

export const LedgerRangeBar: React.FC<Props> = ({ loading, onPick }) => {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button
        type="button"
        disabled={loading}
        onClick={() => void onPick("7d")}
        className="inline-flex h-8 items-center rounded-full border border-slate-300 bg-white px-3 text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-60"
      >
        最近7天
      </button>

      <button
        type="button"
        disabled={loading}
        onClick={() => void onPick("30d")}
        className="inline-flex h-8 items-center rounded-full border border-slate-300 bg-white px-3 text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-60"
      >
        最近30天
      </button>

      <button
        type="button"
        disabled={loading}
        onClick={() => void onPick("90d")}
        className="inline-flex h-8 items-center rounded-full border border-slate-300 bg-white px-3 text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-60"
        title="后端最大允许范围"
      >
        最近90天
      </button>
    </div>
  );
};
