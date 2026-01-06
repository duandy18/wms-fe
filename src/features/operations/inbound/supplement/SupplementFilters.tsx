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
          <label className="text-xs text-slate-600">显示范围</label>
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={status}
            onChange={(e) => onChangeStatus(e.target.value as ViewStatus)}
          >
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
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
          当前：{SOURCE_LABEL[sourceType]} · {STATUS_LABEL[status]} · {count} 行
        </div>
      </div>

      {loading ? <div className="text-sm text-slate-500">加载中…</div> : null}
      {loadErr ? <div className="text-sm text-red-600">{loadErr}</div> : null}

      {status !== "MISSING" ? (
        <div className="text-[11px] text-slate-500">
          提示：当前后端接口仅返回“会阻断提交入库”的缺失项（未提供“已补录历史清单”）。
        </div>
      ) : null}
    </section>
  );
};
