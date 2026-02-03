// src/features/dev/pick-tasks/DevPickTasksCommitCard.tsx

import React from "react";
import type { CommitFormState } from "./types";

interface Props {
  commitForm: CommitFormState;
  commitLoading: boolean;
  commitSuccess: boolean;
  hasTask: boolean;
  hasTrace: boolean;
  onChangeCommitForm: (patch: Partial<CommitFormState>) => void;
  onSubmitCommit: (e: React.FormEvent) => void;
  onJumpTrace: () => void;
}

export const DevPickTasksCommitCard: React.FC<Props> = ({
  commitForm,
  commitLoading,
  commitSuccess,
  hasTask,
  hasTrace,
  onChangeCommitForm,
  onSubmitCommit,
  onJumpTrace,
}) => {
  return (
    <form onSubmit={onSubmitCommit} className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
      <h3 className="text-xs font-semibold text-slate-700">commit 出库（扣库存 + outbound）</h3>
      <div className="grid gap-2 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-[11px] text-slate-600">platform</label>
          <input
            className="w-full rounded border border-slate-300 px-2 py-1 text-xs font-mono"
            value={commitForm.platform}
            onChange={(e) => onChangeCommitForm({ platform: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] text-slate-600">shop_id</label>
          <input
            className="w-full rounded border border-slate-300 px-2 py-1 text-xs font-mono"
            value={commitForm.shopId}
            onChange={(e) => onChangeCommitForm({ shopId: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-[11px] text-slate-600">trace_id（可选，不填则后端用 ref）</label>
        <input
          className="w-full rounded border border-slate-300 px-2 py-1 text-[11px] font-mono"
          value={commitForm.traceId}
          onChange={(e) => onChangeCommitForm({ traceId: e.target.value })}
          placeholder="默认使用订单 trace_id，留空则后端用 ref 兜底"
        />
      </div>
      <label className="inline-flex items-center gap-2 text-[11px] text-slate-700">
        <input
          type="checkbox"
          checked={commitForm.allowDiff}
          onChange={(e) => onChangeCommitForm({ allowDiff: e.target.checked })}
        />
        允许存在 OVER/UNDER 仍然 commit（allow_diff=true）
      </label>

      <div className="mt-2 flex items-center gap-2">
        <button
          type="submit"
          disabled={commitLoading || !hasTask}
          className="inline-flex items-center rounded bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
        >
          {commitLoading ? "提交中…" : "commit 出库（扣库存）"}
        </button>
        <button
          type="button"
          onClick={onJumpTrace}
          disabled={!hasTrace}
          className="inline-flex items-center rounded border border-slate-400 px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40"
        >
          打开 Trace 链路
        </button>
      </div>

      {commitLoading && <div className="mt-1 text-[11px] text-slate-500">提交中…</div>}
      {!commitLoading && commitSuccess && <div className="mt-1 text-[11px] text-emerald-700">最近一次 commit 出库成功。</div>}
    </form>
  );
};
