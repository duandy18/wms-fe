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
import { getInboundUiCaps } from "./stateMachine";

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

  const caps = getInboundUiCaps({
    currentTask: c.currentTask,
    committing: c.committing,
    manualDraft: c.manualDraft,
    varianceSummary: c.varianceSummary,
  });

  // ✅ 原有更细阻断（缺批次/缺日期/草稿/差异确认等）
  const commitAreaDisabledByModel = m.isCommitted || !!c.committing || m.commitBlocked || m.manualDraftBlocked;

  // ✅ Phase 3 新增：最低门槛阻断（必须产生实收）
  const commitAreaDisabled = commitAreaDisabledByModel || !caps.canCommitClick;

  const handleCommitClick = async () => {
    await m.handleCommitClick();
  };

  const handleConfirmCommit = async () => {
    await m.handleConfirmCommit();
  };

  const handleViewInventory = () => {
    navigate("/inventory/snapshot");
  };

  return (
    <section className={`${InboundUI.card} ${InboundUI.cardPad} ${InboundUI.cardGap} relative`}>
      <div className="flex items-center justify-between gap-2">
        <h2 className={InboundUI.title}>提交入库</h2>
        {c.commitError ? <span className="text-xs text-red-600">{c.commitError}</span> : null}
      </div>

      {/* ✅ Phase 3：最低门槛阻断原因显性化（避免“按钮灰了但不知道为啥”） */}
      {!caps.canCommitClick && !m.isCommitted ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-700">
          提交暂不可用：{caps.blockedReason ?? "请先完成扫码/录入形成实收，再提交入库"}
        </div>
      ) : null}

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
              c.manualDraft ? { touchedLines: c.manualDraft.touchedLines, totalQty: c.manualDraft.totalQty } : null
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
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={commitAreaDisabled}
                onClick={() => void handleCommitClick()}
                className={InboundUI.btnPrimary}
                title={
                  commitAreaDisabled
                    ? caps.blockedReason ?? m.blockedMsg ?? "当前状态不可提交"
                    : undefined
                }
              >
                {m.isCommitted ? "已入库" : c.committing ? "提交中…" : "确认入库"}
              </button>

              <button type="button" onClick={handleViewInventory} className={InboundUI.btnSecondary}>
                查看库存变化
              </button>
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
