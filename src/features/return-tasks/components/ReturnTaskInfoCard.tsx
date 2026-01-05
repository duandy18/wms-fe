// src/features/return-tasks/components/ReturnTaskInfoCard.tsx

import React from "react";
import type { ReturnTask } from "../api";
import { formatTs } from "../utils";

export type ReturnVarianceSummary = {
  totalExpected: number;
  totalPicked: number;
  totalVariance: number;
};

export const ReturnTaskInfoCard: React.FC<{
  task: ReturnTask;
  varianceSummary: ReturnVarianceSummary;
}> = ({ task, varianceSummary }) => {
  return (
    <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">基本信息</h2>
        <span className="text-xs text-slate-500">
          创建时间：{formatTs(task.created_at)}，状态：
          <span className="font-medium">{task.status}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-2 md:grid-cols-3">
        <div>
          <div className="text-[11px] text-slate-500">退货任务 ID</div>
          <div className="font-mono text-[13px]">
            {task.id}
            {task.po_id != null && (
              <span className="ml-2 text-xs text-slate-600">(PO-{task.po_id})</span>
            )}
          </div>
        </div>

        <div>
          <div className="text-[11px] text-slate-500">供应商</div>
          <div>
            {task.supplier_name ??
              (task.supplier_id != null ? `ID=${task.supplier_id}` : "-")}
          </div>
        </div>

        <div>
          <div className="text-[11px] text-slate-500">仓库 ID</div>
          <div>{task.warehouse_id}</div>
        </div>

        <div>
          <div className="text-[11px] text-slate-500">计划退货 vs 已拣选</div>
          <div>
            计划：{varianceSummary.totalExpected}，已拣：{varianceSummary.totalPicked}
            ，差异：
            <span
              className={
                varianceSummary.totalVariance === 0
                  ? "text-emerald-700"
                  : varianceSummary.totalVariance > 0
                  ? "text-amber-700"
                  : "text-rose-700"
              }
            >
              {varianceSummary.totalVariance}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
