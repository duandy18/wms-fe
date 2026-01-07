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

export function useInboundCommitModel(c: InboundCockpitController & {
  traceId: string;
  setTraceId: (v: string) => void;
  commit: () => Promise<boolean>;
  committing?: boolean;
  commitError?: string | null;
}) {
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

  const hardBlockedLines = useMemo(() => {
    if (!task) return [];
    return task.lines.filter((l) => {
      const scanned = l.scanned_qty ?? 0;
      if (scanned <= 0) return false;

      const batch = (l.batch_code ?? "").trim();
      const prod = (l.production_date ?? "").trim();

      const missBatch = requiresBatch(l) && !batch;
      const missProd = requiresDates(l) && !prod;

      return missBatch || missProd;
    });
  }, [task]);

  const topHardBlocked = useMemo(() => hardBlockedLines.slice(0, 5), [hardBlockedLines]);

  const softSuggestLines = useMemo(() => {
    if (!task) return [];
    return task.lines.filter((l) => {
      const scanned = l.scanned_qty ?? 0;
      if (scanned <= 0) return false;

      const batch = (l.batch_code ?? "").trim();
      if (!batch) return true;
      return !hasAnyDate(l);
    });
  }, [task]);

  const commitBlocked = !isCommitted && hardBlockedLines.length > 0;
  const manualDraftBlocked = !isCommitted && !!c.manualDraft?.dirty;

  const autoRefreshAfterCommit = async () => {
    setAutoRefreshErr(null);
    try {
      await c.reloadTask();

      const poId = c.currentTask?.po_id ?? task?.po_id ?? null;
      if (poId != null) {
        await c.loadPoById(String(poId));
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "自动刷新失败";
      setAutoRefreshErr(msg);
    }
  };

  const runCommitAndAutoRefresh = async (): Promise<boolean> => {
    setAutoRefreshErr(null);

    const ok = await c.commit();
    if (!ok) return false;

    await autoRefreshAfterCommit();
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

    await runCommitAndAutoRefresh();
    return "DONE";
  };

  const handleConfirmCommit = async (): Promise<void> => {
    setConfirmOpen(false);
    await runCommitAndAutoRefresh();
  };

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
