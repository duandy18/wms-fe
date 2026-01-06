// src/features/operations/inbound/ReceiveTaskContextPanel.tsx

import React, { useMemo, useState } from "react";
import type { InboundCockpitController } from "./types";
import { SupplementLink } from "./SupplementLink";

type InboundMode = "PO" | "ORDER";

function formatSourceType(t?: string | null) {
  if (t === "ORDER") return "订单退货";
  if (t === "PO") return "采购收货";
  if (!t) return "未知";
  return "其他";
}

function statusLabel(raw: string | null | undefined): string {
  const s = (raw ?? "").trim().toUpperCase();
  if (!s) return "未知";
  if (s === "DRAFT") return "待提交";
  if (s === "CREATED") return "已创建";
  if (s === "COMMITTED") return "已入库";
  return "进行中";
}

export function ReceiveTaskContextPanel(props: {
  c: InboundCockpitController;
  mode: InboundMode;
  po: InboundCockpitController["currentPo"];
  task: InboundCockpitController["currentTask"];
}) {
  const { c, mode, po, task } = props;

  const [showAdvanced, setShowAdvanced] = useState(false);

  const canCreateFromPo = mode === "PO" && !!po && !c.creatingTask;

  const summary = useMemo(() => {
    if (!task) return null;
    return {
      id: task.id,
      status: statusLabel(task.status),
      lines: task.lines.length,
      warehouseId: task.warehouse_id,
      source: formatSourceType(task.source_type),
      variance: c.varianceSummary.totalVariance,
      expected: c.varianceSummary.totalExpected,
      scanned: c.varianceSummary.totalScanned,
    };
  }, [task, c.varianceSummary]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-600">收货任务</span>
          <span className="text-[11px] text-slate-500">
            创建/绑定任务后，才能开始扫码或手工记录“本次收货”。
          </span>
        </div>

        {mode === "PO" ? (
          <button
            type="button"
            onClick={c.createTaskFromPo}
            disabled={!canCreateFromPo}
            className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-[12px] font-medium text-white shadow-sm disabled:opacity-60"
          >
            {c.creatingTask ? "创建中…" : "从采购单创建任务"}
          </button>
        ) : null}
      </div>

      {!po && mode === "PO" ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          请先在上方选择一张采购单。
        </div>
      ) : null}

      {summary ? (
        <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700 space-y-1">
          <div className="font-medium text-slate-900">
            当前任务：#{summary.id} · {summary.status}
          </div>

          <div className="text-slate-600">
            仓库：{summary.warehouseId} · 行数：{summary.lines} · 来源：{summary.source}
          </div>

          <div className="text-slate-600">
            应收：{summary.expected}，实收：{summary.scanned}，差异：
            <span
              className={
                summary.variance === 0
                  ? "text-emerald-700"
                  : summary.variance > 0
                  ? "text-amber-700"
                  : "text-rose-700"
              }
            >
              {summary.variance}
            </span>
          </div>

          <div className="text-[11px] text-slate-500">
            需要补录批次/日期？{" "}
            <SupplementLink source="purchase">去补录</SupplementLink>
          </div>
        </div>
      ) : (
        <div className="text-xs text-slate-500">未绑定收货任务</div>
      )}

      {/* 高级入口：按ID绑定（折叠） */}
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="text-[11px] text-slate-700 hover:text-slate-900"
        >
          {showAdvanced ? "收起高级入口" : "按ID绑定任务（高级）"}
        </button>

        {showAdvanced ? (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">任务编号：</span>
              <input
                className="w-28 rounded-md border border-slate-300 px-2 py-1 text-xs"
                placeholder="例如 136"
                value={c.taskIdInput}
                onChange={(e) => c.setTaskIdInput(e.target.value)}
              />
              <button
                type="button"
                onClick={c.bindTaskById}
                disabled={c.loadingTask}
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {c.loadingTask ? "绑定中…" : "绑定"}
              </button>
            </div>

            <div className="text-[11px] text-slate-500">
              高级入口用于直接定位已有任务（例如复盘/续收/异常处理）。
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
