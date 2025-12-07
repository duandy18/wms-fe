// src/features/dev/pick-tasks/DevPickTasksDiffCard.tsx

import React from "react";
import type { PickTaskDiffSummary } from "../../operations/outbound-pick/pickTasksApi";

interface Props {
  diff: PickTaskDiffSummary | null;
}

export const DevPickTasksDiffCard: React.FC<Props> = ({ diff }) => {
  if (!diff) return null;

  const lines = diff.lines ?? [];

  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-700">
          差异汇总（按 item_id）
        </h3>
        <div className="space-x-2 text-[11px]">
          <span
            className={
              "inline-flex items-center rounded px-2 py-0.5 " +
              (diff.has_over
                ? "bg-red-100 text-red-700"
                : "bg-slate-100 text-slate-500")
            }
          >
            OVER
          </span>
          <span
            className={
              "inline-flex items-center rounded px-2 py-0.5 " +
              (diff.has_under
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-100 text-slate-500")
            }
          >
            UNDER
          </span>
        </div>
      </div>
      <div className="max-h-40 overflow-auto rounded border border-slate-200 bg-white">
        <table className="min-w-full border-collapse text-xs">
          <thead className="bg-slate-100">
            <tr>
              <th className="border-b border-slate-200 px-2 py-1 text-left">
                item_id
              </th>
              <th className="border-b border-slate-200 px-2 py-1 text-right">
                req_qty
              </th>
              <th className="border-b border-slate-200 px-2 py-1 text-right">
                picked_qty
              </th>
              <th className="border-b border-slate-200 px-2 py-1 text-right">
                delta
              </th>
              <th className="border-b border-slate-200 px-2 py-1 text-left">
                status
              </th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.item_id} className="odd:bg-white even:bg-slate-50">
                <td className="border-b border-slate-100 px-2 py-1 font-mono">
                  {l.item_id}
                </td>
                <td className="border-b border-slate-100 px-2 py-1 text-right font-mono">
                  {l.req_qty}
                </td>
                <td className="border-b border-slate-100 px-2 py-1 text-right font-mono">
                  {l.picked_qty}
                </td>
                <td className="border-b border-slate-100 px-2 py-1 text-right font-mono">
                  {l.delta}
                </td>
                <td className="border-b border-slate-100 px-2 py-1 font-mono">
                  {l.status}
                </td>
              </tr>
            ))}
            {lines.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-2 py-2 text-center text-slate-400"
                >
                  暂无差异记录。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
