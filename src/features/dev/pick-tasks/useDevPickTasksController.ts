// src/features/dev/pick-tasks/useDevPickTasksController.ts
import { useCallback, useEffect } from "react";

import { getPickTask, type PickTask } from "../../operations/outbound-pick/pickTasksApi";
import { useDevPickContext } from "./controller/useDevPickContext";
import { useDevPickBatches } from "./controller/useDevPickBatches";
import { useDevPickScan } from "./controller/useDevPickScan";
import { useDevPickCommit } from "./controller/useDevPickCommit";

export function useDevPickTasksController(args: { navigate: (to: string) => void }) {
  const { navigate } = args;

  const ctx = useDevPickContext();

  const batches = useDevPickBatches({
    activeWarehouseId: ctx.activeWarehouseId,
    activeItemId: ctx.activeItemId,
  });

  // task 更新后：刷新 diff + 写回 ctx.task
  const onTaskUpdated = useCallback(
    async (t: PickTask) => {
      ctx.setTask(t);
      await ctx.refreshDiff(t.id);
    },
    [ctx],
  );

  const scan = useDevPickScan({
    currentTaskId: ctx.currentTaskId,
    onTaskUpdated,
    setError: ctx.setError,
  });

  const commit = useDevPickCommit({
    currentTaskId: ctx.currentTaskId,
    platformFallback: ctx.platform,
    shopIdFallback: ctx.shopId,
    orderTraceId: ctx.orderView?.trace_id ?? null,
    onCommitted: async () => {
      // committed 时不额外做事，状态由 commit hook 自己管理
      return;
    },
    onTaskReloaded: onTaskUpdated,
    setError: ctx.setError,
    getTask: getPickTask,
  });

  // 创建 demo 成功后：把 trace_id 回填到 commit 表单（便于跳 trace）
  useEffect(() => {
    commit.syncTraceId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.orderView?.trace_id]);

  // 使用推荐批次：直接写入 scan 表单
  const onUseRecommendedBatch = useCallback(() => {
    scan.onUseRecommendedBatch(batches.recommendedBatchCode);
  }, [scan, batches.recommendedBatchCode]);

  // 跳 Trace（沿用你原逻辑）
  const onJumpTrace = useCallback(() => {
    const tid = (commit.commitForm.traceId || ctx.orderView?.trace_id || "").trim();
    if (!tid) return;
    const qs = new URLSearchParams();
    qs.set("trace_id", tid);
    navigate(`/trace?${qs.toString()}`);
  }, [commit.commitForm.traceId, ctx.orderView?.trace_id, navigate]);

  return {
    // 基础上下文
    platform: ctx.platform,
    shopId: ctx.shopId,
    setPlatform: ctx.setPlatform,
    setShopId: ctx.setShopId,

    creating: ctx.creating,
    onCreateDemo: ctx.createFromDemo,

    // 订单 & 任务
    orderView: ctx.orderView,
    task: ctx.task,
    loadingTask: ctx.loadingTask,
    onReloadTask: ctx.reloadTask,

    // FEFO 批次
    batchRows: batches.batchRows,
    batchesLoading: batches.batchesLoading,
    batchesError: batches.batchesError,
    activeItemId: ctx.activeItemId,
    activeWarehouseId: ctx.activeWarehouseId,
    recommendedBatchCode: batches.recommendedBatchCode,
    onUseRecommendedBatch,

    // diff
    diff: ctx.diff,

    // 扫码
    scanForm: scan.scanForm,
    scanLoading: scan.scanLoading,
    scanSuccess: scan.scanSuccess,
    onChangeScanForm: scan.onChangeScanForm,
    onSubmitScan: scan.onSubmitScan,

    // commit
    commitForm: commit.commitForm,
    commitLoading: commit.commitLoading,
    commitSuccess: commit.commitSuccess,
    onChangeCommitForm: commit.onChangeCommitForm,
    onSubmitCommit: commit.onSubmitCommit,
    onJumpTrace,

    // 错误 & 结果
    error: ctx.error,
    commitResult: commit.commitResult,
  };
}
