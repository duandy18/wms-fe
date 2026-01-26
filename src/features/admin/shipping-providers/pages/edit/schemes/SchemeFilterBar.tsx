// src/features/admin/shipping-providers/pages/edit/schemes/SchemeFilterBar.tsx
import React from "react";
import { UI } from "../../../ui";
import type { ViewMode } from "./types";

export const SchemeFilterBar: React.FC<{
  q: string;
  viewMode: ViewMode;
  hideTests: boolean;
  showArchived: boolean;

  disabled: boolean;
  count: number;

  onChangeQ: (v: string) => void;
  onChangeViewMode: (v: ViewMode) => void;
  onChangeHideTests: (v: boolean) => void;
  onChangeShowArchived: (v: boolean) => void;

  batchBusy: boolean;
  canWrite: boolean;
  activeCount: number;
  inactiveCount: number;
  archivedCount: number;

  onBatchDeactivate: () => void | Promise<void>;
  onBatchArchiveInactive: () => void | Promise<void>;
}> = ({
  q,
  viewMode,
  hideTests,
  showArchived,
  disabled,
  count,
  onChangeQ,
  onChangeViewMode,
  onChangeHideTests,
  onChangeShowArchived,
  batchBusy,
  canWrite,
  activeCount,
  inactiveCount,
  archivedCount,
  onBatchDeactivate,
  onBatchArchiveInactive,
}) => {
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-6">
      <div className="md:col-span-3">
        <label className={UI.label}>筛选</label>
        <input
          className={UI.input}
          value={q}
          disabled={disabled}
          placeholder="按 ID / 名称 / 币种 搜索"
          onChange={(e) => onChangeQ(e.target.value)}
        />
      </div>

      <div className="md:col-span-3 flex flex-wrap items-end gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <span className="text-slate-700">显示：</span>
          <select className={UI.select} value={viewMode} disabled={disabled} onChange={(e) => onChangeViewMode(e.target.value as ViewMode)}>
            <option value="all">全部</option>
            <option value="active">只看启用</option>
            <option value="inactive">只看停用</option>
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={hideTests} disabled={disabled} onChange={(e) => onChangeHideTests(e.target.checked)} />
          隐藏测试数据（TEST/DEV/COPY/临时）
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={showArchived} disabled={disabled} onChange={(e) => onChangeShowArchived(e.target.checked)} />
          显示已归档（{archivedCount}）
        </label>

        <div className="text-sm text-slate-500">
          当前显示 <span className="font-semibold text-slate-700">{count}</span> 条
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={UI.btnSecondary}
            disabled={!canWrite || batchBusy || disabled || activeCount === 0}
            onClick={() => void onBatchDeactivate()}
            title="将当前筛选结果中的启用项全部停用"
          >
            {batchBusy ? "处理中…" : `批量停用（${activeCount}）`}
          </button>

          <button
            type="button"
            className={UI.btnSecondary}
            disabled={!canWrite || batchBusy || disabled || inactiveCount === 0}
            onClick={() => void onBatchArchiveInactive()}
            title="归档当前筛选结果中的停用项（归档后默认隐藏，可取消归档）"
          >
            {batchBusy ? "处理中…" : `批量归档停用项（${inactiveCount}）`}
          </button>
        </div>
      </div>
    </div>
  );
};
