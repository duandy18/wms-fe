// src/features/operations/inbound/InboundCommitCard.tsx
// Cockpit 提交入库卡片（commit → 真正写库存 + 台账）
// - 支持 trace_id 输入
// - 提交前展示差异摘要对话框，列出前几条有差异的行，防误操作
// - 提交成功后使用 react-router navigate() 跳转到 Trace 页面（不刷新整站）

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { InboundCockpitController } from "./types";

interface Props {
  c: InboundCockpitController;
}

export const InboundCommitCard: React.FC<Props> = ({ c }) => {
  const task = c.currentTask;
  const isCommitted = task?.status === "COMMITTED";
  const navigate = useNavigate();

  const [confirmOpen, setConfirmOpen] = useState(false);

  const mismatchLines = useMemo(() => {
    if (!task) return [];
    return task.lines.filter(
      (l) =>
        l.expected_qty != null &&
        l.scanned_qty !== l.expected_qty,
    );
  }, [task]);

  const topMismatch = mismatchLines.slice(0, 5);

  const traceQuery =
    c.traceId && c.traceId.trim()
      ? `/trace?trace_id=${encodeURIComponent(c.traceId.trim())}`
      : "";

  const runCommitAndRedirect = async () => {
    const ok = await c.commit();
    if (ok) {
      const id = c.traceId && c.traceId.trim();
      if (id) {
        // 使用 SPA 内导航，避免整站刷新和重新登录
        navigate(`/trace?trace_id=${encodeURIComponent(id)}`);
      }
    }
  };

  const handleCommitClick = async () => {
    if (mismatchLines.length > 0 && !isCommitted) {
      setConfirmOpen(true);
      return;
    }
    await runCommitAndRedirect();
  };

  const handleConfirmCommit = async () => {
    setConfirmOpen(false);
    await runCommitAndRedirect();
  };

  const handleViewTrace = () => {
    if (!traceQuery) return;
    navigate(traceQuery);
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 relative">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">
          提交入库（确认收货）
        </h2>
        {c.commitError && (
          <span className="text-xs text-red-600">{c.commitError}</span>
        )}
      </div>

      {!task ? (
        <div className="text-xs text-slate-500">
          尚未绑定收货任务。请先创建或绑定任务。
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
              点击“确认入库”后，系统将以当前实收数量
              <span className="font-mono mx-1">scanned_qty</span>
              作为最终入库数量写入库存与台账，任务状态将变为 COMMITTED。
            </div>
            <div className="text-slate-600">
              当前汇总：应收合计{" "}
              <span className="font-mono">
                {c.varianceSummary.totalExpected}
              </span>
              ，实收合计{" "}
              <span className="font-mono">
                {c.varianceSummary.totalScanned}
              </span>
              ，差异{" "}
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
              。
            </div>
          </div>

          {/* 差异摘要（非弹窗版，始终提示） */}
          {mismatchLines.length > 0 && (
            <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
              <div className="font-semibold mb-1">
                注意：共有 {mismatchLines.length} 行存在差异（实收 ≠ 应收），请确认无误后再提交。
              </div>
              <ul className="list-disc pl-4 space-y-0.5">
                {topMismatch.map((l) => (
                  <li key={l.id}>
                    item_id=
                    <span className="font-mono">{l.item_id}</span>{" "}
                    名称：{l.item_name ?? "-"}，应收=
                    <span className="font-mono">
                      {l.expected_qty ?? "-"}
                    </span>
                    ，实收=
                    <span className="font-mono">
                      {l.scanned_qty}
                    </span>
                  </li>
                ))}
                {mismatchLines.length > topMismatch.length && (
                  <li>…… 其余 {mismatchLines.length - topMismatch.length} 行略</li>
                )}
              </ul>
            </div>
          )}

          {/* trace_id 输入 / 显示 */}
          <div className="mt-2 space-y-1 text-xs">
            <label className="block text-slate-500">
              trace_id（可选，用于 Trace / Ledger / Snapshot 聚合）
            </label>
            <input
              className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs font-mono"
              placeholder="为空时自动生成：inbound:cockpit:{task_id}:{timestamp}"
              value={c.traceId}
              onChange={(e) => c.setTraceId(e.target.value)}
            />
          </div>

          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              disabled={isCommitted || c.committing}
              onClick={handleCommitClick}
              className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm disabled:opacity-60"
            >
              {isCommitted
                ? "已确认入库（COMMITTED）"
                : c.committing
                ? "提交中…"
                : "确认入库（commit）"}
            </button>

            {/* Trace 按钮：使用 navigate 跳转，避免整站刷新 */}
            <button
              type="button"
              disabled={!traceQuery}
              onClick={handleViewTrace}
              className={
                "inline-flex items-center rounded-md border px-3 py-1 text-[11px] " +
                (traceQuery
                  ? "border-slate-300 text-slate-700 hover:bg-slate-50"
                  : "border-slate-200 text-slate-300 cursor-not-allowed")
              }
            >
              查看 Trace 页面
            </button>
          </div>
        </>
      )}

      {/* 差异确认弹窗 */}
      {confirmOpen && mismatchLines.length > 0 && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">
              ⚠️ 入库差异提示
            </h3>
            <p className="text-xs text-slate-700">
              本次收货任务中存在
              <span className="font-semibold mx-1">
                {mismatchLines.length}
              </span>
              行实收与应收不一致，请确认差异合理后再继续入库。
            </p>
            <div className="max-h-40 overflow-y-auto border border-slate-100 rounded bg-slate-50">
              <table className="min-w-full border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-600">
                    <th className="px-2 py-1 text-right">Item</th>
                    <th className="px-2 py-1 text-left">名称</th>
                    <th className="px-2 py-1 text-right">应收</th>
                    <th className="px-2 py-1 text-right">实收</th>
                    <th className="px-2 py-1 text-right">差异</th>
                  </tr>
                </thead>
                <tbody>
                  {mismatchLines.map((l) => {
                    const v =
                      l.expected_qty != null
                        ? l.scanned_qty - l.expected_qty
                        : l.scanned_qty;
                    const cls =
                      v === 0
                        ? "text-emerald-700"
                        : v > 0
                        ? "text-amber-700"
                        : "text-rose-700";
                    return (
                      <tr
                        key={l.id}
                        className="border-t border-slate-100 align-top"
                      >
                        <td className="px-2 py-1 text-right font-mono">
                          {l.item_id}
                        </td>
                        <td className="px-2 py-1">
                          {l.item_name ?? "-"}
                        </td>
                        <td className="px-2 py-1 text-right font-mono">
                          {l.expected_qty ?? "-"}
                        </td>
                        <td className="px-2 py-1 text-right font-mono">
                          {l.scanned_qty}
                        </td>
                        <td className={"px-2 py-1 text-right font-mono " + cls}>
                          {v}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                className="px-3 py-1 text-[11px] rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
                onClick={() => setConfirmOpen(false)}
              >
                取消
              </button>
              <button
                type="button"
                className="px-3 py-1 text-[11px] rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={handleConfirmCommit}
              >
                继续入库
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
