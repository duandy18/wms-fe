// src/features/dev/pick-tasks/DevPickTasksContextCards.tsx

import React from "react";
import type { DevOrderView } from "../orders/api";
import type { PickTask } from "../../operations/outbound-pick/pickTasksApi";

interface Props {
  orderView: DevOrderView | null;
  task: PickTask | null;
  loadingTask: boolean;
  onReloadTask: () => void;
}

export const DevPickTasksContextCards: React.FC<Props> = ({
  orderView,
  task,
  loadingTask,
  onReloadTask,
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* 订单上下文 */}
      <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
        <div className="text-xs font-semibold text-slate-700">订单上下文</div>
        {orderView ? (
          <ul className="space-y-0.5">
            <li>
              <span className="text-slate-500">platform / shop：</span>
              <span className="font-mono">
                {orderView.order.platform}/{orderView.order.shop_id}
              </span>
            </li>
            <li>
              <span className="text-slate-500">ext_order_no：</span>
              <span className="font-mono">
                {orderView.order.ext_order_no}
              </span>
            </li>
            <li>
              <span className="text-slate-500">warehouse_id：</span>
              <span className="font-mono">
                {orderView.order.warehouse_id ?? "—"}
              </span>
            </li>
            <li>
              <span className="text-slate-500">trace_id：</span>
              <span className="font-mono text-[11px]">
                {orderView.trace_id || "（暂无）"}
              </span>
            </li>
          </ul>
        ) : (
          <p className="text-slate-500">尚未生成 demo 订单。</p>
        )}
      </div>

      {/* 拣货任务上下文 */}
      <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-700">拣货任务</div>
          <button
            type="button"
            onClick={onReloadTask}
            disabled={!task || loadingTask}
            className="rounded border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100 disabled:opacity-40"
          >
            重新加载
          </button>
        </div>
        {task ? (
          <ul className="space-y-0.5">
            <li>
              <span className="text-slate-500">task_id：</span>
              <span className="font-mono">{task.id}</span>
            </li>
            <li>
              <span className="text-slate-500">warehouse_id：</span>
              <span className="font-mono">{task.warehouse_id}</span>
            </li>
            <li>
              <span className="text-slate-500">status：</span>
              <span className="font-mono">{task.status}</span>
            </li>
            <li>
              <span className="text-slate-500">ref：</span>
              <span className="font-mono text-[11px]">
                {task.ref || "—"}
              </span>
            </li>
            <li>
              <span className="text-slate-500">source：</span>
              <span className="font-mono text-[11px]">
                {task.source || "—"}
              </span>
            </li>
          </ul>
        ) : (
          <p className="text-slate-500">
            尚未创建拣货任务。可点击上方按钮生成 demo 订单。
          </p>
        )}
      </div>
    </div>
  );
};
