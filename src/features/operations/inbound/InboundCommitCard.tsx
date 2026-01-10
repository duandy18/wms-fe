// src/features/operations/inbound/InboundCommitCard.tsx
// Cockpit 提交入库卡片（commit → 真正写库存 + 台账）
// 作业视角：只关心“是否成功入库”与“库存是否变化”

import React from "react";
import { useNavigate } from "react-router-dom";
import type { InboundCockpitController } from "./types";

import { MismatchBanner } from "./commit/MismatchBanner";
import { MismatchConfirmModal } from "./commit/MismatchConfirmModal";
import { CommitSupplementPanels } from "./commit/CommitSupplementPanels";
import { useInboundCommitModel } from "./commit/useInboundCommitModel";
import { InboundUI } from "./ui";

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

  const commitAreaDisabled =
    m.isCommitted || !!c.committing || m.commitBlocked || m.manualDraftBlocked;

  const handleCommitClick = async () => {
    await m.handleCommitClick();
  };

  const handleConfirmCommit = async () => {
    await m.handleConfirmCommit();
  };

  // --- 跳转：只做“按钮入口”，不自动跳、不自动查 ---
  const handleViewSnapshot = () => {
    const qs = new URLSearchParams();
    if (m.taskId) qs.set("task_id", String(m.taskId));
    navigate(`/snapshot${qs.toString() ? `?${qs.toString()}` : ""}`);
  };

  const handleViewLedger = () => {
    // ✅ 严格对齐 LedgerQuery：只透传它支持的字段
    const qs = new URLSearchParams();
    const tid = (c.traceId ?? "").trim();
    if (tid) qs.set("trace_id", tid);
    navigate(`/inventory/ledger${qs.toString() ? `?${qs.toString()}` : ""}`);
  };

  const handleViewTrace = () => {
    const tid = (c.traceId ?? "").trim();
    if (!tid) return;
    const qs = new URLSearchParams();
    qs.set("trace_id", tid);
    navigate(`/trace?${qs.toString()}`);
  };

  const hasTrace = Boolean((c.traceId ?? "").trim());

  return (
    <section className={`${InboundUI.card} ${InboundUI.cardPad} ${InboundUI.cardGap} relative`}>
      <div className="flex items-center justify-between gap-2">
        <h2 className={InboundUI.title}>提交入库</h2>
        {c.commitError ? <span className="text-xs text-red-600">{c.commitError}</span> : null}
      </div>

      {!m.task ? null : (
        <>
          <div className={InboundUI.subtitle}>
            当前任务：#{m.task.id}
            {m.task.po_id != null ? (
              <span className={`ml-1 ${InboundUI.quiet}`}>（关联采购单 #{m.task.po_id}）</span>
            ) : null}
          </div>

          <div className="text-sm text-slate-700">
            当前汇总：应收 <span className="font-mono">{c.varianceSummary.totalExpected}</span>，实收{" "}
            <span className="font-mono">{c.varianceSummary.totalScanned}</span>，差异{" "}
            <span
              className={
                c.varianceSummary.totalVariance === 0
                  ? "text-emerald-700 font-mono"
                  : c.varianceSummary.totalVariance > 0
                  ? "text-amber-700 font-mono"
                  : "text-rose-700 font-mono"
              }
            >
              {c.varianceSummary.totalVariance}
            </span>
            。
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

          <div className={commitAreaDisabled ? "pointer-events-none opacity-60" : ""}>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={commitAreaDisabled}
                onClick={() => void handleCommitClick()}
                className={InboundUI.btnPrimary}
              >
                {m.isCommitted ? "已入库" : c.committing ? "提交中…" : "确认入库"}
              </button>

              <button type="button" onClick={handleViewSnapshot} className={InboundUI.btnSecondary}>
                查看即时库存
              </button>

              <button type="button" onClick={handleViewLedger} className={InboundUI.btnSecondary}>
                查看库存台账
              </button>

              {hasTrace ? (
                <button type="button" onClick={handleViewTrace} className={InboundUI.btnSecondary}>
                  查看 Trace
                </button>
              ) : null}
            </div>

            <div className="mt-2 text-[12px] text-slate-500">
              提交成功后建议按需查看：即时库存（余额）/ 库存台账（变动事件）/ Trace（全链路追溯）。
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
