// src/features/operations/inbound/ReceiveTaskContextPanel.tsx

import React from "react";
import type { InboundCockpitController } from "./types";

type InboundMode = "PO" | "ORDER";

function formatSourceType(t?: string | null) {
  if (t === "ORDER") return "订单退货";
  if (t === "PO") return "采购收货";
  if (!t) return "未知";
  return t;
}

export function ReceiveTaskContextPanel(props: {
  c: InboundCockpitController;
  mode: InboundMode;
  po: InboundCockpitController["currentPo"];
  task: InboundCockpitController["currentTask"];
}) {
  const { c, mode, po, task } = props;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-600">收货任务</span>
        <div className="flex items-center gap-2">
          {mode === "PO" && (
            <button
              type="button"
              onClick={c.createTaskFromPo}
              disabled={c.creatingTask || !po}
              className="inline-flex items-center rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-medium text-white shadow-sm disabled:opacity-60"
            >
              {c.creatingTask ? "创建中…" : "从采购单创建"}
            </button>
          )}
          <button
            type="button"
            onClick={c.bindTaskById}
            disabled={c.loadingTask}
            className="inline-flex items-center rounded-md border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {c.loadingTask ? "绑定中…" : "按ID绑定"}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-500">任务ID：</span>
        <input
          className="w-28 rounded-md border border-slate-300 px-2 py-1 text-xs"
          placeholder="ID"
          value={c.taskIdInput}
          onChange={(e) => c.setTaskIdInput(e.target.value)}
        />
      </div>

      {task ? (
        <div className="mt-2 space-y-1 text-xs text-slate-700">
          <div>
            <span className="font-mono">#{task.id}</span>
            {task.po_id != null && (
              <span className="ml-1 text-slate-500">(采购单#{task.po_id})</span>
            )}
          </div>

          <div className="text-slate-500">
            仓库：{task.warehouse_id} · 状态：
            <span className="font-medium">{task.status}</span> · 行数：
            {task.lines.length}
          </div>

          <div className="text-slate-500">
            来源：<span className="font-medium">{formatSourceType(task.source_type)}</span>
            {task.source_type === "ORDER" && task.source_id && (
              <span className="ml-1">
                （订单ID：<span className="font-mono">{task.source_id}</span>）
              </span>
            )}
          </div>

          <div className="text-slate-500">
            应收：{c.varianceSummary.totalExpected}，实收：{c.varianceSummary.totalScanned}
            ，差异：
            <span
              className={
                c.varianceSummary.totalVariance === 0
                  ? "text-emerald-700"
                  : c.varianceSummary.totalVariance > 0
                  ? "text-amber-700"
                  : "text-rose-700"
              }
            >
              {c.varianceSummary.totalVariance}
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-1 text-xs text-slate-500">未绑定收货任务</div>
      )}
    </div>
  );
}
