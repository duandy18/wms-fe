// src/features/operations/inbound/commit/CommitActions.tsx

import React from "react";

export const CommitActions: React.FC<{
  isCommitted: boolean;
  committing: boolean;
  canViewTrace: boolean;

  onCommitClick: () => void;
  onViewTrace: () => void;
}> = ({ isCommitted, committing, canViewTrace, onCommitClick, onViewTrace }) => {
  const traceQuery = canViewTrace;

  return (
    <div className="mt-3 flex items-center gap-3">
      <button
        type="button"
        disabled={isCommitted || committing}
        onClick={onCommitClick}
        className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm disabled:opacity-60"
      >
        {isCommitted ? "已确认入库（COMMITTED）" : committing ? "提交中…" : "确认入库（commit）"}
      </button>

      <button
        type="button"
        disabled={!traceQuery}
        onClick={onViewTrace}
        className={
          "inline-flex items-center rounded-md border px-3 py-1 text-[11px] " +
          (traceQuery
            ? "border-slate-300 text-slate-700 hover:bg-slate-50"
            : "border-slate-200 text-slate-300 cursor-not-allowed")
        }
      >
        查看 Trace 页面
      </button>
    </div>
  );
};
