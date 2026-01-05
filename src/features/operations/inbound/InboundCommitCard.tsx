// src/features/operations/inbound/InboundCommitCard.tsx
// Cockpit 提交入库卡片（commit → 真正写库存 + 台账）
// - 支持 trace_id 输入
// - 提交前展示差异摘要对话框，列出前几条有差异的行，防误操作
// - 提交成功后使用 react-router navigate() 跳转到 Trace 页面（不刷新整站）

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { InboundCockpitController } from "./types";

import { buildTraceQuery, getMismatchLines } from "./commit/commitUtils";
import { MismatchBanner } from "./commit/MismatchBanner";
import { TraceIdField } from "./commit/TraceIdField";
import { CommitActions } from "./commit/CommitActions";
import { MismatchConfirmModal } from "./commit/MismatchConfirmModal";

type InboundCommitController = InboundCockpitController & {
  traceId: string;
  setTraceId: (v: string) => void;
  commit: () => Promise<boolean>;
  committing?: boolean;
  commitError?: string | null;
};

interface Props {
  c: InboundCommitController;
}

export const InboundCommitCard: React.FC<Props> = ({ c }) => {
  const task = c.currentTask;
  const isCommitted = task?.status === "COMMITTED";
  const navigate = useNavigate();

  const [confirmOpen, setConfirmOpen] = useState(false);

  const mismatchLines = useMemo(() => getMismatchLines(task), [task]);
  const topMismatch = mismatchLines.slice(0, 5);

  const traceQuery = buildTraceQuery(c.traceId);

  const runCommitAndRedirect = async () => {
    const ok = await c.commit();
    if (!ok) return;

    const id = (c.traceId ?? "").trim();
    if (id) {
      // 使用 SPA 内导航，避免整站刷新和重新登录
      navigate(`/trace?trace_id=${encodeURIComponent(id)}`);
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
        <h2 className="text-sm font-semibold text-slate-800">提交入库（确认收货）</h2>
        {c.commitError && <span className="text-xs text-red-600">{c.commitError}</span>}
      </div>

      {!task ? (
        <div className="text-xs text-slate-500">尚未绑定收货任务。请先创建或绑定任务。</div>
      ) : (
        <>
          <div className="space-y-1 text-xs text-slate-700">
            <div>
              当前任务：#{task.id}
              {task.po_id != null && (
                <span className="ml-1 text-slate-500">(PO-{task.po_id})</span>
              )}
            </div>

            <div className="text-slate-600">
              点击“确认入库”后，系统将以当前实收数量
              <span className="font-mono mx-1">scanned_qty</span>
              作为最终入库数量写入库存与台账，任务状态将变为 COMMITTED。
            </div>

            <div className="text-slate-600">
              当前汇总：应收合计{" "}
              <span className="font-mono">{c.varianceSummary.totalExpected}</span>
              ，实收合计{" "}
              <span className="font-mono">{c.varianceSummary.totalScanned}</span>
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

          <MismatchBanner mismatchLines={mismatchLines} topMismatch={topMismatch} />

          <TraceIdField value={c.traceId} onChange={c.setTraceId} />

          <CommitActions
            isCommitted={isCommitted}
            committing={!!c.committing}
            canViewTrace={!!traceQuery}
            onCommitClick={() => void handleCommitClick()}
            onViewTrace={handleViewTrace}
          />
        </>
      )}

      <MismatchConfirmModal
        open={confirmOpen && mismatchLines.length > 0}
        mismatchLines={mismatchLines}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void handleConfirmCommit()}
      />
    </section>
  );
};
