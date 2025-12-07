// src/features/dev/pick-tasks/DevPickTasksErrorAndResult.tsx

import React from "react";
import type { PickTaskCommitResult } from "../../operations/outbound-pick/pickTasksApi";

interface Props {
  error: string | null;
  result: PickTaskCommitResult | null;
}

export const DevPickTasksErrorAndResult: React.FC<Props> = ({
  error,
  result,
}) => {
  return (
    <>
      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <div className="text-xs font-semibold text-slate-700">
          commit 出库结果（原始 JSON）
        </div>
        <pre className="max-h-64 overflow-auto rounded-lg border bg-slate-50 p-3 text-[11px]">
          {result ? JSON.stringify(result, null, 2) : "尚未执行 commit。"}
        </pre>
      </div>
    </>
  );
};
