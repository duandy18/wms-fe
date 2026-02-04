// src/features/operations/outbound-pick/cockpit/useCockpitCommit.tsx

import { useState } from "react";

import { commitPickTask, getPickTask, type PickTask } from "../pickTasksApi";
import type { ApiErrorShape, PickPostCommitInfo } from "../types_cockpit";

import { apiGet } from "../../../../lib/api";
import type { TraceEvent } from "../../../diagnostics/trace/types";

import { fetchLedgerList } from "../../../diagnostics/ledger-tool/api";
import type { LedgerList, LedgerRow } from "../../../diagnostics/ledger-tool/types";

import { fetchItemDetail, type ItemDetailResponse } from "../../../inventory/snapshot/api";

export function useCockpitCommit(args: {
  selectedTask: PickTask | null;
  currentPlatformShop: { platform: string; shop_id: string };
  allowDiffDefault: boolean;

  loadTasks: () => Promise<void>;
  loadTaskDetail: (taskId: number) => Promise<void>;
}) {
  const { selectedTask, currentPlatformShop, allowDiffDefault, loadTasks, loadTaskDetail } = args;

  const [allowDiff, setAllowDiff] = useState(allowDiffDefault);

  const [commitBusy, setCommitBusy] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);

  const [traceId, setTraceId] = useState<string | null>(null);
  const [postCommitInfo, setPostCommitInfo] = useState<PickPostCommitInfo | null>(null);
  const [postCommitLoading, setPostCommitLoading] = useState(false);
  const [postCommitError, setPostCommitError] = useState<string | null>(null);

  // ---------------- commit 后情报加载 ----------------
  async function loadPostCommit(trace_id: string, task: PickTask) {
    setPostCommitLoading(true);
    setPostCommitError(null);
    try {
      // 1) Trace 事件
      const traceResp = await apiGet<{ events: TraceEvent[] }>(`/debug/trace/${encodeURIComponent(trace_id)}`);
      const traceEvents = traceResp?.events ?? [];

      // 2) Ledger 明细
      let ledgerRows: LedgerRow[] = [];
      try {
        const ledgerList: LedgerList = await fetchLedgerList({
          trace_id,
          limit: 100,
          offset: 0,
        });
        ledgerRows = ledgerList.items ?? [];
      } catch (e) {
        console.error("loadPostCommit: fetchLedgerList failed", e);
      }

      // 3) Snapshot：取任务第一行的 item_id
      let snapshot: ItemDetailResponse | null = null;
      try {
        const firstLine = task.lines && task.lines[0];
        if (firstLine) {
          snapshot = await fetchItemDetail(firstLine.item_id);
        }
      } catch (e) {
        console.error("loadPostCommit: fetchItemDetail failed", e);
      }

      setPostCommitInfo({
        traceEvents,
        ledgerRows,
        snapshot,
      });
    } catch (err: unknown) {
      const e = err as ApiErrorShape;
      console.error("loadPostCommit(trace) error", e);
      setPostCommitError(e?.message ?? "加载提交后链路信息失败");
    } finally {
      setPostCommitLoading(false);
    }
  }

  // ---------------- commit 出库（Phase 2：无需确认码） ----------------
  const handleCommit = async () => {
    if (!selectedTask) return;

    setCommitError(null);
    setCommitBusy(true);

    setPostCommitInfo(null);
    setPostCommitError(null);

    try {
      const { platform, shop_id } = currentPlatformShop;

      // 本地生成 trace_id：用于链路聚合（后端也会回传最终 trace_id）
      const localTraceId = `picktask:${selectedTask.id}:${Date.now()}`;
      setTraceId(localTraceId);

      const res = await commitPickTask(selectedTask.id, {
        platform,
        shop_id,
        trace_id: localTraceId,
        allow_diff: allowDiff,
      });

      // 刷新列表 & 详情
      await loadTasks();
      await loadTaskDetail(selectedTask.id);

      // 尽量使用后端回传的 trace_id（幂等重放/回读更准确）
      const finalTrace = (res?.trace_id ?? localTraceId) || localTraceId;
      setTraceId(finalTrace);

      // 加载提交后链路信息（用 trace 聚合）
      const freshTask = await getPickTask(selectedTask.id);
      await loadPostCommit(finalTrace, freshTask);
    } catch (err: unknown) {
      const e = err as ApiErrorShape;
      console.error("commitPickTask failed:", e);
      setCommitError(e?.message ?? "commit 出库失败");
    } finally {
      setCommitBusy(false);
    }
  };

  function reset() {
    setAllowDiff(allowDiffDefault);
    setCommitBusy(false);
    setCommitError(null);

    setTraceId(null);
    setPostCommitInfo(null);
    setPostCommitLoading(false);
    setPostCommitError(null);
  }

  return {
    allowDiff,
    setAllowDiff,

    commitBusy,
    commitError,
    handleCommit,

    traceId,
    postCommitInfo,
    postCommitLoading,
    postCommitError,

    reset,
  };
}
