// src/features/operations/inbound/lines/InboundLinesHeader.tsx

import React from "react";

export type ViewFilter = "all" | "mismatch" | "unreceived";

export const InboundLinesHeader: React.FC<{
  hasTask: boolean;
  onReloadTask: () => void;

  viewFilter: ViewFilter;
  onChangeViewFilter: (v: ViewFilter) => void;
}> = ({ hasTask, onReloadTask, viewFilter, onChangeViewFilter }) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          收货明细（商品 / 单位 / 批次 / 日期 / 差异）
        </h2>
        <div className="mt-1 text-base text-slate-600">
          提示：有保质期商品提交时会强制要求批次 +（生产/到期日期至少一项）；
          无保质期商品允许日期为空，批次可留空（系统将自动使用 NOEXP）。
        </div>
      </div>

      <div className="flex items-center gap-3 text-base">
        {hasTask && (
          <button
            type="button"
            onClick={onReloadTask}
            className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-base text-slate-800 hover:bg-slate-50"
          >
            刷新任务
          </button>
        )}

        <div className="flex items-center gap-2">
          <span className="text-slate-600">视图：</span>

          <button
            type="button"
            className={
              "px-3 py-1.5 rounded-full border text-base " +
              (viewFilter === "all"
                ? "border-slate-900 text-slate-900"
                : "border-slate-300 text-slate-600")
            }
            onClick={() => onChangeViewFilter("all")}
          >
            全部
          </button>

          <button
            type="button"
            className={
              "px-3 py-1.5 rounded-full border text-base " +
              (viewFilter === "mismatch"
                ? "border-amber-500 text-amber-700"
                : "border-slate-300 text-slate-600")
            }
            onClick={() => onChangeViewFilter("mismatch")}
          >
            仅有差异
          </button>

          <button
            type="button"
            className={
              "px-3 py-1.5 rounded-full border text-base " +
              (viewFilter === "unreceived"
                ? "border-sky-500 text-sky-700"
                : "border-slate-300 text-slate-600")
            }
            onClick={() => onChangeViewFilter("unreceived")}
          >
            仅未收完
          </button>
        </div>
      </div>
    </div>
  );
};
