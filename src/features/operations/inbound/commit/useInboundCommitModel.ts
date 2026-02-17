// src/features/operations/inbound/commit/useInboundCommitModel.ts

import { useEffect, useMemo, useRef, useState } from "react";
import type { InboundCockpitController } from "../types";
import { buildTraceQuery, getMismatchLines } from "./commitUtils";
import { requiresBatch, requiresDates, hasAnyDate } from "./commitCardHelpers";

export type SupplementHint =
  | null
  | { kind: "done"; text: string }
  | { kind: "pending"; text: string };

type SupplementUpdatedDetail = {
  remainingHard?: number;
};

function hasPlannedLine(l: { expected_qty?: number | null }): boolean {
  const v = Number(l.expected_qty ?? 0);
  return Number.isFinite(v) && v > 0;
}

export function useInboundCommitModel(
  c: InboundCockpitController & {
    traceId: string;
    setTraceId: (v: string) => void;
    commit: () => Promise<boolean>;
    committing?: boolean;
    commitError?: string | null;
  },
) {
  const task = c.currentTask;
  const isCommitted = task?.status === "COMMITTED";
  const taskId = task?.id ?? null;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [blockedMsg, setBlockedMsg] = useState<string | null>(null);

  const [supplementHint, setSupplementHint] = useState<SupplementHint>(null);
  const hintTimerRef = useRef<number | null>(null);

  const [autoRefreshErr, setAutoRefreshErr] = useState<string | null>(null);

  const mismatchLines = useMemo(() => getMismatchLines(task), [task]);
  const topMismatch = useMemo(() => mismatchLines.slice(0, 5), [mismatchLines]);

  const traceQuery = useMemo(() => buildTraceQuery(c.traceId), [c.traceId]);

  /**
   * ✅ Phase 3 收紧：hard blocked 不再依赖 scanned_qty>0
   *
   * 原因：后端在 commit 时会对“任务内的保质期行”做强合同校验；
   * 若前端仍只在 scanned>0 才阻断，会出现“按钮可点 → 422 才报错”的体验裂缝。
   *
   * 规则（与后端更一致）：
   * - 只要该行属于本任务（expected_qty>0 / planned line）
   * - 且该行要求 batch / date
   * - 且缺失对应字段
   * → 视为 hardBlocked（必须先补录）
   */
  const hardBlockedLines = useMemo(() => {
    if (!task) return [];
    return task.lines.filter((l) => {
      // 只对“任务行”做硬合同校验：避免把历史/空行也拉进来
      if (!hasPlannedLine(l)) return false;

      const batch = (l.batch_code ?? "").trim();
      const prod = (l.production_date ?? "").trim();

      const missBatch = requiresBatch(l) && !batch;
      const missProd = requiresDates(l) && !prod;

      return missBatch || missProd;
    });
  }, [task]);

  const topHardBlocked = useMemo(() => hardBlockedLines.slice(0, 5), [hardBlockedLines]);

  /**
   * 软建议：用于提示“建议补录”，不阻断提交。
   * - 有保质期但缺日期（或缺批次）
   * - 或者缺日期但不是硬要求
   */
  const softSuggestLines = useMemo(() => {
    if (!task) return [];
    return task.lines.filter((l) => {
      if (!hasPlannedLine(l)) return false;

      const batch = (l.batch_code ?? "").trim();
      // 缺批次一定给建议（即使不硬阻断也要提示）
      if (!batch) return true;

      // 有批次但缺日期：建议补齐
      return !hasAnyDate(l);
    });
  }, [task]);

  const commitBlocked = !isCommitted && hardBlockedLines.length > 0;
  const manualDraftBlocked = !isCommitted && !!c.manualDraft?.dirty;

  const autoRefreshAfterCommit = async (poIdToRefresh: number | null) => {
    setAutoRefreshErr(null);
    try {
      if (poIdToRefresh != null) {
        await c.loadPoById(String(poIdToRefresh));
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "自动刷新失败";
      setAutoRefreshErr(msg);
    }
  };

  const runCommitAndFinishSession = async (): Promise<boolean> => {
    setAutoRefreshErr(null);

    // commit 前先记住 poId（commit 成功后要刷新 PO，但不再 reloadTask）
    const poIdToRefresh = c.currentTask?.po_id ?? null;

    const ok = await c.commit();
    if (!ok) return false;

    await autoRefreshAfterCommit(poIdToRefresh);

    // ✅ 作业闭环：提交成功后立刻解绑任务，回到“未绑定任务”干净状态
    c.endTaskSession();

    return true;
  };

  const handleCommitClick = async (): Promise<"OPEN_CONFIRM" | "DONE" | "BLOCKED"> => {
    setBlockedMsg(null);
    setAutoRefreshErr(null);

    if (manualDraftBlocked) {
      setBlockedMsg("手工收货存在未落地输入：请先“记录/一键记录本次”或清空输入，再提交入库。");
      return "BLOCKED";
    }

    if (commitBlocked) {
      setBlockedMsg("存在“入库必需字段缺失（批次/生产日期）”的行，请先补录后再提交入库。");
      return "BLOCKED";
    }

    if (mismatchLines.length > 0 && !isCommitted) {
      setConfirmOpen(true);
      return "OPEN_CONFIRM";
    }

    await runCommitAndFinishSession();
    return "DONE";
  };

  const handleConfirmCommit = async (): Promise<void> => {
    setConfirmOpen(false);
    await runCommitAndFinishSession();
  };

  // ✅ 进入 COMMITTED 终态：清理“上一轮对话框/阻断提示”的残留
  useEffect(() => {
    if (!isCommitted) return;
    setConfirmOpen(false);
    setBlockedMsg(null);
  }, [isCommitted]);

  // 补录保存回流：刷新 task，并在入库页明确提示
  useEffect(() => {
    const onUpdated = (ev: Event) => {
      const e = ev as CustomEvent<SupplementUpdatedDetail>;
      const remaining = Number(e.detail?.remainingHard ?? NaN);

      if (hintTimerRef.current) {
        window.clearTimeout(hintTimerRef.current);
        hintTimerRef.current = null;
      }

      void c.reloadTask();

      if (Number.isFinite(remaining)) {
        if (remaining <= 0) {
          setSupplementHint({ kind: "done", text: "补录已完成：所有必需字段已补齐，可以继续提交入库。" });
        } else {
          setSupplementHint({ kind: "pending", text: `已保存：仍有 ${remaining} 行必需信息未补录，暂时无法提交入库。` });
        }
      } else {
        setSupplementHint({ kind: "done", text: "已保存补录信息，并已刷新入库任务状态。" });
      }

      hintTimerRef.current = window.setTimeout(() => {
        setSupplementHint(null);
        hintTimerRef.current = null;
      }, 4500);
    };

    window.addEventListener("inbound:supplement-updated", onUpdated);
    return () => {
      window.removeEventListener("inbound:supplement-updated", onUpdated);
      if (hintTimerRef.current) {
        window.clearTimeout(hintTimerRef.current);
        hintTimerRef.current = null;
      }
    };
  }, [c]);

  return {
    task,
    taskId,
    isCommitted,

    traceQuery,

    mismatchLines,
    topMismatch,

    hardBlockedLines,
    topHardBlocked,
    softSuggestLines,

    commitBlocked,
    manualDraftBlocked,

    confirmOpen,
    setConfirmOpen,

    blockedMsg,
    supplementHint,
    autoRefreshErr,

    handleCommitClick,
    handleConfirmCommit,
  };
}
