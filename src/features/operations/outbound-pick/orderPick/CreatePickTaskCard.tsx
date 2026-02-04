// src/features/operations/outbound-pick/orderPick/CreatePickTaskCard.tsx
import React from "react";

import type { OrderSummary } from "../../../orders/api";
import type { PickTask } from "../pickTasksApi";

type Props = {
  pickedOrder: OrderSummary | null;

  creatingTask: boolean;
  createTaskError: string | null;
  createdTask: PickTask | null;

  canCreateTask: boolean;
  onCreate: () => void;
};

export const CreatePickTaskCard: React.FC<Props> = ({
  pickedOrder,
  creatingTask,
  createTaskError,
  createdTask,
  canCreateTask,
  onCreate,
}) => {
  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">创建拣货任务</h2>
        <div className="text-[11px] text-slate-500">订单 → 拣货任务 → 出库</div>
      </div>

      {!pickedOrder ? (
        <div className="text-xs text-slate-500">请先在上方列表中选择一张「CREATED」订单。</div>
      ) : (
        <div className="space-y-2 text-[11px] text-slate-700">
          <div>
            已选订单：
            <span className="ml-1 font-mono">
              {pickedOrder.platform}/{pickedOrder.shop_id}/{pickedOrder.ext_order_no}
            </span>
          </div>

          <div className="text-[11px] text-slate-600">
            方案 1：不再手工选择仓库。后端会基于订单/店铺绑定/路由事实解析执行仓；若解析失败会明确报错并引导配置。
          </div>

          <button
            type="button"
            onClick={onCreate}
            disabled={!canCreateTask}
            className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white disabled:opacity-60"
          >
            {creatingTask ? "创建中…" : "创建拣货任务"}
          </button>

          {!canCreateTask ? <div className="text-[11px] text-slate-500">说明：需先选择订单。</div> : null}

          {createTaskError ? <div className="text-[11px] text-red-600">{createTaskError}</div> : null}

          {createdTask ? (
            <div className="text-[11px] text-emerald-700">
              已创建任务：<span className="font-mono">#{createdTask.id}</span>（已自动切换到任务作业区）
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
};
