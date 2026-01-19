// src/features/operations/outbound-pick/orderPick/CreatePickTaskCard.tsx
import React from "react";

import type { OrderSummary } from "../../../orders/api";
import type { WarehouseListItem } from "../../../admin/warehouses/types";
import type { PickTask } from "../pickTasksApi";

type Props = {
  pickedOrder: OrderSummary | null;

  warehouses: WarehouseListItem[];
  loadingWh: boolean;
  whError: string | null;
  selectedWarehouseId: number | null;
  setSelectedWarehouseId: (v: number | null) => void;

  creatingTask: boolean;
  createTaskError: string | null;
  createdTask: PickTask | null;
  canCreateTask: boolean;

  onCreate: () => void;
};

export const CreatePickTaskCard: React.FC<Props> = ({
  pickedOrder,
  warehouses,
  loadingWh,
  whError,
  selectedWarehouseId,
  setSelectedWarehouseId,
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
        <div className="text-xs text-slate-500">
          请先在左侧选择一张「CREATED」订单。
        </div>
      ) : (
        <div className="space-y-2 text-[11px] text-slate-700">
          <div>
            已选订单：
            <span className="ml-1 font-mono">
              {pickedOrder.platform}/{pickedOrder.shop_id}/{pickedOrder.ext_order_no}
            </span>
          </div>

          {/* 仓库下拉：必选 */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-[11px] text-slate-500">选择仓库：</div>

            <select
              className="h-9 rounded border border-slate-300 bg-white px-2 text-[12px] disabled:opacity-60"
              value={selectedWarehouseId ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setSelectedWarehouseId(v ? Number(v) : null);
              }}
              disabled={loadingWh || warehouses.length === 0}
            >
              <option value="">请选择仓库</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}（#{w.id}
                  {w.code ? ` · ${w.code}` : ""}）
                </option>
              ))}
            </select>

            {loadingWh ? (
              <span className="text-[11px] text-slate-500">仓库加载中…</span>
            ) : null}
          </div>

          {whError ? <div className="text-[11px] text-red-600">{whError}</div> : null}

          {!whError && !loadingWh && warehouses.length === 0 ? (
            <div className="text-[11px] text-red-600">
              当前没有可用仓库（active=true）。请先在「仓库管理」中创建/启用仓库。
            </div>
          ) : null}

          <button
            type="button"
            onClick={onCreate}
            disabled={!canCreateTask}
            className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white disabled:opacity-60"
          >
            {creatingTask ? "创建中…" : "创建拣货任务"}
          </button>

          {!canCreateTask ? (
            <div className="text-[11px] text-slate-500">说明：创建拣货任务前必须选择仓库。</div>
          ) : null}

          {createTaskError ? (
            <div className="text-[11px] text-red-600">{createTaskError}</div>
          ) : null}

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
