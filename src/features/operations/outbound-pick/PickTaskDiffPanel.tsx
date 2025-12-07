// src/features/operations/outbound-pick/PickTaskDiffPanel.tsx
//
// 差异分析 Panel（内容模块）：
// 比较任务中各商品的计划数量（订单）与实际拣货数量。

import React from "react";
import type { PickTaskDiffSummary } from "./pickTasksApi";

type Props = {
  diff: PickTaskDiffSummary | null;
};

export const PickTaskDiffPanel: React.FC<Props> = ({ diff }) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-800">
        差异分析
      </h3>
      <p className="text-xs text-slate-600">
        比较任务中各商品的计划数量（来自订单）与实际拣货数量。
        <span className="font-semibold mx-1">UNDER</span>
        表示仍未拣够，
        <span className="font-semibold mx-1">OVER</span>
        表示拣多了，
        <span className="font-semibold mx-1">OK</span>
        表示数量一致。
      </p>

      {!diff ? (
        <div className="text-sm text-slate-500">
          暂无 diff 数据。
        </div>
      ) : (
        <>
          <div className="text-xs text-slate-600">
            has_over=
            <span
              className={
                diff.has_over ? "text-red-600" : "text-emerald-600"
              }
            >
              {String(diff.has_over)}
            </span>
            ，has_under=
            <span
              className={
                diff.has_under ? "text-amber-600" : "text-emerald-600"
              }
            >
              {String(diff.has_under)}
            </span>
          </div>
          <div className="border border-slate-200 rounded-lg max-h-40 overflow-auto">
            {diff.lines.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-500">
                无差异行。
              </div>
            ) : (
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-slate-50 sticky top-0">
                  <tr className="text-xs text-slate-600">
                    <th className="px-3 py-2 text-left">Item</th>
                    <th className="px-3 py-2 text-right">Req</th>
                    <th className="px-3 py-2 text-right">Picked</th>
                    <th className="px-3 py-2 text-right">Δ</th>
                    <th className="px-3 py-2 text-left">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {diff.lines.map((ln) => (
                    <tr
                      key={ln.item_id}
                      className="border-t border-slate-100"
                    >
                      <td className="px-3 py-2 font-mono">
                        {ln.item_id}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {ln.req_qty}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {ln.picked_qty}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {ln.delta}
                      </td>
                      <td className="px-3 py-2">
                        {ln.status === "OK" && (
                          <span className="text-emerald-600">OK</span>
                        )}
                        {ln.status === "UNDER" && (
                          <span className="text-amber-600">UNDER</span>
                        )}
                        {ln.status === "OVER" && (
                          <span className="text-red-600">OVER</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};
