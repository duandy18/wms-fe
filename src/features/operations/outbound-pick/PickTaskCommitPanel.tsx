// src/features/operations/outbound-pick/PickTaskCommitPanel.tsx
//
// 提交出库 Panel（内容模块）：
// - 显示平台/店铺
// - allow_diff 开关
// - Phase 2：删除订单确认码（handoff_code），直接提交 commit（以 diff+后端裁决为准）

import React from "react";
import type { PickTask } from "./pickTasksApi";

type Props = {
  task: PickTask | null;
  allowDiff: boolean;
  onChangeAllowDiff: (v: boolean) => void;
  committing: boolean;
  commitError: string | null;
  platform: string;
  shopId: string;
  onCommit: () => void;
};

export const PickTaskCommitPanel: React.FC<Props> = ({
  task,
  allowDiff,
  onChangeAllowDiff,
  committing,
  commitError,
  platform,
  shopId,
  onCommit,
}) => {
  if (!task) {
    return <div className="text-xs text-slate-500">请先选择一条拣货任务。</div>;
  }

  return (
    <div className="space-y-3">
      <div className="text-[11px] text-slate-600 space-y-1">
        <div>
          platform:
          <span className="font-mono ml-1">{platform}</span> · shop:
          <span className="font-mono ml-1">{shopId}</span>
        </div>

        <div>
          allow_diff:
          <label className="inline-flex items-center ml-1 gap-1">
            <input type="checkbox" checked={allowDiff} onChange={(e) => onChangeAllowDiff(e.target.checked)} />
            <span className="text-[11px] text-slate-600">允许存在差异时仍然 commit（谨慎勾选）</span>
          </label>
        </div>
      </div>

      <button
        type="button"
        disabled={committing}
        onClick={onCommit}
        className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white disabled:opacity-60"
      >
        {committing ? "提交中…" : "提交出库（commit）"}
      </button>

      {commitError && <div className="text-[11px] text-red-600 mt-1">{commitError}</div>}

      <div className="text-[11px] text-slate-500">
        Phase 2：不再使用订单确认码；提交是否允许以 <span className="font-mono">diff</span> + 后端裁决为准。
      </div>
    </div>
  );
};
