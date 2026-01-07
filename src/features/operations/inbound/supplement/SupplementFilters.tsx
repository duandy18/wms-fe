// src/features/operations/inbound/supplement/SupplementFilters.tsx

import React from "react";
import type { SupplementSourceType, ViewStatus } from "./types";
import { SOURCE_LABEL, STATUS_LABEL } from "./types";

export const SupplementFilters: React.FC<{
  sourceType: SupplementSourceType;
  status: ViewStatus;
  keyword: string;

  loading: boolean;
  loadErr: string | null;
  count: number;

  taskId?: number | null; // ✅ 作业入口：本次任务口径（可选，仅用于文案展示）

  onChangeSourceType: (v: SupplementSourceType) => void;
  onChangeStatus: (v: ViewStatus) => void;
  onChangeKeyword: (v: string) => void;
}> = ({
  sourceType,
  status,
  keyword,
  loading,
  loadErr,
  count,
  taskId,
  onChangeSourceType,
  onChangeStatus,
  onChangeKeyword,
}) => {
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-600">来源类型</label>
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={sourceType}
            onChange={(e) => onChangeSourceType(e.target.value as SupplementSourceType)}
          >
            {Object.entries(SOURCE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-600">处理范围</label>
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={status}
            onChange={(e) => onChangeStatus(e.target.value as ViewStatus)}
          >
            {/* ✅ 对操作员隐藏“已补录（暂不支持）” */}
            <option value="MISSING">{STATUS_LABEL.MISSING}</option>
            <option value="ALL">{STATUS_LABEL.ALL}</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[240px]">
          <label className="text-xs text-slate-600">搜索</label>
          <input
            className="border rounded-md px-3 py-2 text-sm"
            value={keyword}
            onChange={(e) => onChangeKeyword(e.target.value)}
            placeholder="商品名 / 任务号 / 批次"
          />
        </div>

        <div className="text-xs text-slate-500 ml-auto">
          {taskId ? (
            <>
              本次任务 #{taskId} · {SOURCE_LABEL[sourceType]} · {STATUS_LABEL[status]} · {count} 行
            </>
          ) : (
            <>
              当前：{SOURCE_LABEL[sourceType]} · {STATUS_LABEL[status]} · {count} 行
            </>
          )}
        </div>
      </div>

      {loading ? <div className="text-sm text-slate-500">加载中…</div> : null}
      {loadErr ? <div className="text-sm text-red-600">{loadErr}</div> : null}

      {/* ✅ 作业提示：只讲行动，不讲实现 */}
      <div className="text-[11px] text-slate-500">
        提示：优先处理「必须补录」，否则提交入库会被阻断。
      </div>
    </section>
  );
};
