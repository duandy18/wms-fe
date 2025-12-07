// src/features/operations/outbound-pick/PickTaskListPanel.tsx
//
// 左侧：拣货任务列表 Panel
// - 支持仓库过滤 / 状态过滤 / 来源过滤（默认只看 source=ORDER）
// - 显示 Req 总 / Picked 总 / Δ 汇总，帮助判断任务整体完成情况

import React from "react";
import type { PickTask } from "./pickTasksApi";

type Props = {
  tasks: PickTask[];
  loading: boolean;
  error: string | null;
  warehouseId: number;
  statusFilter: string;
  sourceFilter: "ORDER" | "ALL";
  onChangeWarehouse: (v: number) => void;
  onChangeStatus: (v: string) => void;
  onChangeSourceFilter: (v: "ORDER" | "ALL") => void;
  selectedTaskId: number | null;
  onSelectTask: (id: number) => void;
  onRefresh: () => void;
};

export const PickTaskListPanel: React.FC<Props> = ({
  tasks,
  loading,
  error,
  warehouseId,
  statusFilter,
  sourceFilter,
  onChangeWarehouse,
  onChangeStatus,
  onChangeSourceFilter,
  selectedTaskId,
  onSelectTask,
  onRefresh,
}) => {
  const statusBadgeClass = (status: string) => {
    if (status === "DONE")
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "PICKING")
      return "bg-sky-50 text-sky-700 border-sky-200";
    if (status === "READY")
      return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  const getTotals = (t: PickTask) => {
    let reqTotal = 0;
    let pickedTotal = 0;

    for (const ln of t.lines ?? []) {
      if (ln.order_id != null) {
        reqTotal += ln.req_qty;
      }
      pickedTotal += ln.picked_qty;
    }

    const delta = pickedTotal - reqTotal;
    let status: "OK" | "UNDER" | "OVER" | "NA" = "NA";
    if (reqTotal === 0 && pickedTotal === 0) {
      status = "NA";
    } else if (delta === 0) {
      status = "OK";
    } else if (delta < 0) {
      status = "UNDER";
    } else {
      status = "OVER";
    }

    return { reqTotal, pickedTotal, delta, status };
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">
          拣货任务列表
        </h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-[11px] px-2 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          {loading ? "刷新中…" : "刷新"}
        </button>
      </div>

      {/* 过滤条件 */}
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <div className="flex items-center gap-1">
          <span className="text-slate-500">仓库:</span>
          <input
            type="number"
            className="w-16 border border-slate-300 rounded px-1 py-0.5"
            value={warehouseId}
            onChange={(e) => onChangeWarehouse(Number(e.target.value) || 0)}
          />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-slate-500">状态:</span>
          <select
            className="border border-slate-300 rounded px-1 py-0.5"
            value={statusFilter}
            onChange={(e) => onChangeStatus(e.target.value)}
          >
            <option value="READY">READY</option>
            <option value="PICKING">PICKING</option>
            <option value="DONE">DONE</option>
            <option value="ALL">全部</option>
          </select>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-slate-500">来源:</span>
          <select
            className="border border-slate-300 rounded px-1 py-0.5"
            value={sourceFilter}
            onChange={(e) =>
              onChangeSourceFilter(e.target.value as "ORDER" | "ALL")
            }
          >
            <option value="ORDER">仅订单任务</option>
            <option value="ALL">全部任务</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="text-[11px] text-red-600">{error}</div>
      )}

      <div className="border border-slate-200 rounded-lg max-h-[480px] overflow-auto text-xs">
        {tasks.length === 0 ? (
          <div className="px-3 py-2 text-slate-500">暂无任务。</div>
        ) : (
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-50 sticky top-0">
              <tr className="text-[11px] text-slate-600">
                <th className="px-2 py-2 text-left">ID</th>
                <th className="px-2 py-2 text-left">Ref</th>
                <th className="px-2 py-2 text-left">来源</th>
                <th className="px-2 py-2 text-left">状态</th>
                <th className="px-2 py-2 text-right">行数</th>
                <th className="px-2 py-2 text-right">Req总</th>
                <th className="px-2 py-2 text-right">Picked总</th>
                <th className="px-2 py-2 text-right">Δ</th>
                <th className="px-2 py-2 text-right">优先级</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => {
                const isActive = t.id === selectedTaskId;
                const totals = getTotals(t);
                return (
                  <tr
                    key={t.id}
                    className={
                      "cursor-pointer border-t border-slate-100 " +
                      (isActive ? "bg-sky-50" : "hover:bg-slate-50")
                    }
                    onClick={() => onSelectTask(t.id)}
                  >
                    <td className="px-2 py-2 font-mono">{t.id}</td>
                    <td className="px-2 py-2">
                      <span className="font-mono text-slate-700">
                        {t.ref ?? "-"}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-[11px]">
                      {t.source ?? "-"}
                    </td>
                    <td className="px-2 py-2">
                      <span
                        className={
                          "inline-flex items-center rounded-full border px-1.5 py-0.5 " +
                          statusBadgeClass(t.status)
                        }
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-right">
                      {t.lines?.length ?? 0}
                    </td>
                    <td className="px-2 py-2 text-right">
                      {totals.reqTotal}
                    </td>
                    <td className="px-2 py-2 text-right">
                      {totals.pickedTotal}
                    </td>
                    <td className="px-2 py-2 text-right">
                      {totals.delta}
                    </td>
                    <td className="px-2 py-2 text-right">
                      {t.priority}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};
