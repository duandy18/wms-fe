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
import { MismatchConfirmModal } from "./commit/MismatchConfirmModal";
import { SupplementLink } from "./SupplementLink";
import { hasAnyDate, needsBatch } from "./lines/lineUtils";

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
  const [blockedMsg, setBlockedMsg] = useState<string | null>(null);

  const mismatchLines = useMemo(() => getMismatchLines(task), [task]);
  const topMismatch = mismatchLines.slice(0, 5);

  const traceQuery = buildTraceQuery(c.traceId);

  const missingBatchLines = useMemo(() => {
    if (!task) return [];
    return task.lines.filter((l) => needsBatch(l));
  }, [task]);

  const missingDateLines = useMemo(() => {
    if (!task) return [];
    return task.lines.filter((l) => {
      const scanned = l.scanned_qty ?? 0;
      if (scanned <= 0) return false;
      if (!((l.batch_code ?? "").trim())) return false;
      return !hasAnyDate(l);
    });
  }, [task]);

  // 硬阻断：已有实收但缺批次（最危险）
  const commitBlocked = !isCommitted && missingBatchLines.length > 0;

  const runCommitAndRedirect = async () => {
    const ok = await c.commit();
    if (!ok) return;

    const id = (c.traceId ?? "").trim();
    if (id) {
      navigate(`/trace?trace_id=${encodeURIComponent(id)}`);
    }
  };

  const handleCommitClick = async () => {
    setBlockedMsg(null);

    if (commitBlocked) {
      setBlockedMsg("存在“已收但缺批次”的行，请先补录后再提交入库。");
      return;
    }

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

  const commitAreaDisabled =
    isCommitted || !!c.committing || commitBlocked;

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 relative">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">提交入库</h2>
        {c.commitError ? <span className="text-xs text-red-600">{c.commitError}</span> : null}
      </div>

      {!task ? (
        <div className="text-xs text-slate-500">尚未绑定收货任务。请先创建或绑定任务。</div>
      ) : (
        <>
          <div className="space-y-1 text-xs text-slate-700">
            <div>
              当前任务：#{task.id}
              {task.po_id != null ? (
                <span className="ml-1 text-slate-500">（关联采购单 #{task.po_id}）</span>
              ) : null}
            </div>

            <div className="text-slate-600">
              提交入库后，将以当前“实收累计”为最终入库数量写入库存与台账，任务状态将变为“已入库”。
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

          {/* 补录阻断/提醒 */}
          {commitBlocked ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              存在需要补录的行（已收但缺批次/日期）。请先{" "}
              <SupplementLink source="purchase">去补录</SupplementLink>{" "}
              再提交入库。
            </div>
          ) : missingDateLines.length > 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
              提示：有行已收但日期为空。若需要补录，可{" "}
              <SupplementLink source="purchase">去补录</SupplementLink>。
            </div>
          ) : null}

          {blockedMsg ? <div className="text-xs text-red-600">{blockedMsg}</div> : null}

          <MismatchBanner mismatchLines={mismatchLines} topMismatch={topMismatch} />

          <TraceIdField value={c.traceId} onChange={c.setTraceId} />

          <div className={commitAreaDisabled ? "pointer-events-none opacity-60" : ""}>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={commitAreaDisabled}
                onClick={() => void handleCommitClick()}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {isCommitted ? "已入库" : !!c.committing ? "提交中…" : "确认入库"}
              </button>

              <button
                type="button"
                disabled={!traceQuery}
                onClick={handleViewTrace}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                查看 Trace
              </button>

              <span className="text-xs text-slate-500 ml-auto">
                {commitBlocked ? (
                  <>
                    需要补录？{" "}
                    <SupplementLink source="purchase">去补录</SupplementLink>
                  </>
                ) : (
                  <>
                    <SupplementLink source="purchase">补录中心</SupplementLink>
                  </>
                )}
              </span>
            </div>
          </div>
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
