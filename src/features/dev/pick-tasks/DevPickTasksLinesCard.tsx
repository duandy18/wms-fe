// src/features/dev/pick-tasks/DevPickTasksLinesCard.tsx

import React from "react";
import type { PickTask } from "../../operations/outbound-pick/pickTasksApi";

interface Props {
  task: PickTask | null;
}

export const DevPickTasksLinesCard: React.FC<Props> = ({ task }) => {
  if (!task) return null;

  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-700">
          任务行（PickTaskLines）
        </h3>
        <span className="text-[11px] text-slate-500">
          共 {task.lines.length} 行
        </span>
      </div>
      <div className="max-h-64 overflow-auto rounded border border-slate-200 bg-white">
        <table className="min-w-full border-collapse text-xs">
          <thead className="bg-slate-100">
            <tr>
              <th className="border-b border-slate-200 px-2 py-1 text-left">
                line_id
              </th>
              <th className="border-b border-slate-200 px-2 py-1 text-left">
                item_id
              </th>
              <th className="border-b border-slate-200 px-2 py-1 text-right">
                req_qty
              </th>
              <th className="border-b border-slate-200 px-2 py-1 text-right">
                picked_qty
              </th>
              <th className="border-b border-slate-200 px-2 py-1 text-left">
                batch_code
              </th>
              <th className="border-b border-slate-200 px-2 py-1 text-left">
                status
              </th>
              <th className="border-b border-slate-200 px-2 py-1 text-left">
                order_id
              </th>
            </tr>
          </thead>
          <tbody>
            {task.lines.map((ln) => (
              <tr key={ln.id} className="odd:bg-white even:bg-slate-50">
                <td className="border-b border-slate-100 px-2 py-1 font-mono">
                  {ln.id}
                </td>
                <td className="border-b border-slate-100 px-2 py-1 font-mono">
                  {ln.item_id}
                </td>
                <td className="border-b border-slate-100 px-2 py-1 text-right font-mono">
                  {ln.req_qty}
                </td>
                <td className="border-b border-slate-100 px-2 py-1 text-right font-mono">
                  {ln.picked_qty}
                </td>
                <td className="border-b border-slate-100 px-2 py-1 font-mono">
                  {ln.batch_code || "—"}
                </td>
                <td className="border-b border-slate-100 px-2 py-1 font-mono">
                  {ln.status}
                </td>
                <td className="border-b border-slate-100 px-2 py-1 font-mono">
                  {ln.order_id ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
