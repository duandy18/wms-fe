// src/features/dev/inbound/DevInboundCommitCard.tsx
// 提交入库（commit → InboundService.receive）

import React from "react";
import type { DevInboundController } from "./types";

interface Props {
  c: DevInboundController;
}

export const DevInboundCommitCard: React.FC<Props> = ({ c }) => {
  const task = c.currentTask;
  const isCommitted = task?.status === "COMMITTED";

  const handleCommit = async () => {
    await c.commit();
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">
          提交入库（commit → InboundService.receive）
        </h2>
        {c.commitError && (
          <span className="text-xs text-red-600">{c.commitError}</span>
        )}
      </div>

      {!task ? (
        <div className="text-xs text-slate-500">
          尚未绑定收货任务。先在左侧完成任务绑定，再进行 commit。
        </div>
      ) : (
        <>
          <div className="space-y-1 text-xs text-slate-700">
            <div>
              当前任务：#{task.id}
              {task.po_id != null && (
                <span className="ml-1 text-slate-500">
                  (PO-{task.po_id})
                </span>
              )}
            </div>
            <div className="text-slate-600">
              commit 时将对每一行执行：
              <span className="font-mono mx-1">
                committed_qty = scanned_qty
              </span>
              ，并调用 InboundService.receive(item_id, qty, …) 写入台账与库存。
            </div>
          </div>

          <div className="mt-2 space-y-2 text-xs">
            <label className="block text-slate-500">
              trace_id（可选，用于 Trace / Ledger / Lifecycle 聚合）
            </label>
            <input
              className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs font-mono"
              placeholder="为空时自动生成：inbound:{task_id}:{timestamp}"
              value={c.traceId}
              onChange={(e) => c.setTraceId(e.target.value)}
            />
          </div>

          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              disabled={isCommitted || c.committing}
              onClick={handleCommit}
              className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm disabled:opacity-60"
            >
              {isCommitted
                ? "已 COMMITTED"
                : c.committing
                ? "提交中…"
                : "确认入库（commit）"}
            </button>

            <a
              href={
                c.traceId
                  ? `/diagnostics/trace?trace_id=${encodeURIComponent(
                      c.traceId,
                    )}`
                  : undefined
              }
              className={
                "inline-flex items-center rounded-md border px-3 py-1 text-[11px] " +
                (c.traceId
                  ? "border-slate-300 text-slate-700 hover:bg-slate-50"
                  : "border-slate-200 text-slate-300 cursor-not-allowed")
              }
            >
              查看 Trace 页面
            </a>
          </div>
        </>
      )}
    </section>
  );
};
