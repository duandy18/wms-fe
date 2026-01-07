// src/features/operations/inbound/InboundCommitCard.tsx
// Cockpit 提交入库卡片（commit → 真正写库存 + 台账）

import React from "react";
import { useNavigate } from "react-router-dom";
import type { InboundCockpitController } from "./types";

import { MismatchBanner } from "./commit/MismatchBanner";
import { TraceIdField } from "./commit/TraceIdField";
import { MismatchConfirmModal } from "./commit/MismatchConfirmModal";
import { SupplementLink } from "./SupplementLink";

import { CommitSupplementPanels } from "./commit/CommitSupplementPanels";
import { useInboundCommitModel } from "./commit/useInboundCommitModel";

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
  const navigate = useNavigate();
  const m = useInboundCommitModel(c);

  const handleViewTrace = () => {
    if (!m.traceQuery) return;
    navigate(m.traceQuery);
  };

  const commitAreaDisabled =
    m.isCommitted || !!c.committing || m.commitBlocked || m.manualDraftBlocked;

  const handleCommitClick = async () => {
    const r = await m.handleCommitClick();
    if (r !== "DONE") return;

    const id = (c.traceId ?? "").trim();
    if (id) {
      navigate(`/trace?trace_id=${encodeURIComponent(id)}`);
    }
  };

  const handleConfirmCommit = async () => {
    await m.handleConfirmCommit();

    const id = (c.traceId ?? "").trim();
    if (id) {
      navigate(`/trace?trace_id=${encodeURIComponent(id)}`);
    }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 relative">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">提交入库</h2>
        {c.commitError ? <span className="text-xs text-red-600">{c.commitError}</span> : null}
      </div>

      {/* ✅ 空态不显示说明文案（你前面要求“只删页面注释/说明”一致） */}
      {!m.task ? null : (
        <>
          <div className="space-y-1 text-xs text-slate-700">
            <div>
              当前任务：#{m.task.id}
              {m.task.po_id != null ? (
                <span className="ml-1 text-slate-500">（关联采购单 #{m.task.po_id}）</span>
              ) : null}
            </div>

            <div className="text-slate-600">
              当前汇总：应收合计 <span className="font-mono">{c.varianceSummary.totalExpected}</span>，实收合计{" "}
              <span className="font-mono">{c.varianceSummary.totalScanned}</span>，差异{" "}
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

          <CommitSupplementPanels
            taskId={m.taskId}
            supplementHint={m.supplementHint}
            manualDraftBlocked={m.manualDraftBlocked}
            manualDraft={
              c.manualDraft
                ? { touchedLines: c.manualDraft.touchedLines, totalQty: c.manualDraft.totalQty }
                : null
            }
            commitBlocked={m.commitBlocked}
            hardBlockedLines={m.hardBlockedLines}
            topHardBlocked={m.topHardBlocked}
            softSuggestLines={m.softSuggestLines}
            blockedMsg={m.blockedMsg}
            autoRefreshErr={m.autoRefreshErr}
          />

          <MismatchBanner mismatchLines={m.mismatchLines} topMismatch={m.topMismatch} />

          <TraceIdField value={c.traceId} onChange={c.setTraceId} />

          <div className={commitAreaDisabled ? "pointer-events-none opacity-60" : ""}>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={commitAreaDisabled}
                onClick={() => void handleCommitClick()}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {m.isCommitted ? "已入库" : c.committing ? "提交中…" : "确认入库"}
              </button>

              <button
                type="button"
                disabled={!m.traceQuery}
                onClick={handleViewTrace}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                查看 Trace
              </button>

              <span className="text-xs text-slate-500 ml-auto">
                {m.commitBlocked ? (
                  <>
                    <SupplementLink source="purchase" taskId={m.taskId}>
                      去补录
                    </SupplementLink>
                  </>
                ) : (
                  <>
                    <SupplementLink source="purchase" taskId={m.taskId}>
                      补录中心
                    </SupplementLink>
                  </>
                )}
              </span>
            </div>
          </div>
        </>
      )}

      <MismatchConfirmModal
        open={m.confirmOpen && m.mismatchLines.length > 0}
        mismatchLines={m.mismatchLines}
        onCancel={() => m.setConfirmOpen(false)}
        onConfirm={() => void handleConfirmCommit()}
      />
    </section>
  );
};
