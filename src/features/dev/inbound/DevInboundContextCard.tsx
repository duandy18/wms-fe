// src/features/dev/inbound/DevInboundContextCard.tsx
// 采购单 + 收货任务 上下文卡片（含 Demo 场景按钮）

import React from "react";
import type { DevInboundController } from "./types";

interface Props {
  c: DevInboundController;
}

export const DevInboundContextCard: React.FC<Props> = ({ c }) => {
  const po = c.currentPo;
  const task = c.currentTask;

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">
          上下文：采购单 / 收货任务
        </h2>
        <div className="text-right space-y-1">
          {c.poError && (
            <div className="text-xs text-red-600">{c.poError}</div>
          )}
          {c.taskError && (
            <div className="text-xs text-red-600">{c.taskError}</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-4 text-sm">
        {/* 左：采购单 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600">
              采购单（PurchaseOrder）
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={c.loadPoById}
                disabled={c.loadingPo}
                className="inline-flex items-center rounded-md border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {c.loadingPo ? "加载中…" : "加载采购单"}
              </button>
              <button
                type="button"
                onClick={c.createDemoPoAndTask}
                disabled={c.creatingTask}
                className="inline-flex items-center rounded-md bg-indigo-600 px-2 py-1 text-[11px] font-medium text-white shadow-sm disabled:opacity-60"
              >
                一键 Demo 采购单 + 任务
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">PO ID：</span>
            <input
              className="w-28 rounded-md border border-slate-300 px-2 py-1 text-xs"
              placeholder="例如 1"
              value={c.poIdInput}
              onChange={(e) => c.setPoIdInput(e.target.value)}
            />
          </div>

          {po ? (
            <div className="mt-2 space-y-1 text-xs text-slate-700">
              <div>
                <span className="font-mono">#{po.id}</span> ·{" "}
                <span>{po.supplier_name ?? po.supplier}</span>
              </div>
              <div className="text-slate-500">
                仓库：{po.warehouse_id} · 状态：{po.status} · 行数：
                {po.lines.length}
              </div>
            </div>
          ) : (
            <div className="mt-1 text-xs text-slate-500">
              尚未加载采购单。可输入 PO ID 并点击“加载采购单”，或直接点击“一键 Demo 采购单 + 任务”。
            </div>
          )}
        </div>

        {/* 右：收货任务 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600">
              收货任务（ReceiveTask）
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={c.createTaskFromPo}
                disabled={c.creatingTask || !po}
                className="inline-flex items-center rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-medium text-white shadow-sm disabled:opacity-60"
              >
                {c.creatingTask ? "创建中…" : "从当前 PO 创建任务"}
              </button>
              <button
                type="button"
                onClick={c.bindTaskById}
                disabled={c.loadingTask}
                className="inline-flex items-center rounded-md border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {c.loadingTask ? "绑定中…" : "按任务 ID 绑定"}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">任务 ID：</span>
            <input
              className="w-28 rounded-md border border-slate-300 px-2 py-1 text-xs"
              placeholder="例如 101"
              value={c.taskIdInput}
              onChange={(e) => c.setTaskIdInput(e.target.value)}
            />
          </div>

          {/* Demo 场景按钮 */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] mt-1">
            <span className="text-slate-500">快速生成 Demo 任务：</span>
            <button
              type="button"
              disabled={c.creatingTask || !po}
              onClick={() => c.createDemoTask("normal")}
              className="rounded-md border border-slate-300 px-2 py-1 hover:bg-slate-50 disabled:opacity-60"
            >
              应收 = 实收
            </button>
            <button
              type="button"
              disabled={c.creatingTask || !po}
              onClick={() => c.createDemoTask("under")}
              className="rounded-md border border-slate-300 px-2 py-1 hover:bg-slate-50 disabled:opacity-60"
            >
              少收场景
            </button>
            <button
              type="button"
              disabled={c.creatingTask || !po}
              onClick={() => c.createDemoTask("over")}
              className="rounded-md border border-slate-300 px-2 py-1 hover:bg-slate-50 disabled:opacity-60"
            >
              超收场景
            </button>
          </div>

          {task ? (
            <div className="mt-2 space-y-1 text-xs text-slate-700">
              <div>
                <span className="font-mono">#{task.id}</span>
                {task.po_id != null && (
                  <span className="ml-1 text-slate-500">
                    (PO-{task.po_id})
                  </span>
                )}
              </div>
              <div className="text-slate-500">
                仓库：{task.warehouse_id} · 状态：
                <span className="font-medium">{task.status}</span> · 行数：
                {task.lines.length}
              </div>
              <div className="text-slate-500">
                应收合计：{c.varianceSummary.totalExpected}，实收合计：
                {c.varianceSummary.totalScanned}，差异：
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
            <div className="mt-1 text-xs text-slate-500">
              尚未绑定收货任务。你可以：
              <br />
              ① 点击“一键 Demo 采购单 + 任务”；<br />
              ② 或先加载一张采购单，再用“从当前 PO 创建任务 / Demo 场景”。
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
