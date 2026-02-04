// src/features/dev/pick-tasks/controller/useDevPickCommit.ts
import { useCallback, useState } from "react";

import { commitPickTask, type PickTask, type PickTaskCommitResult } from "../../../operations/outbound-pick/pickTasksApi";
import type { CommitFormState } from "../types";
import { getErrorMessage } from "../types";

export function useDevPickCommit(args: {
  currentTaskId: number | null;
  platformFallback: string;
  shopIdFallback: string;
  orderTraceId: string | null;
  onCommitted: (res: PickTaskCommitResult) => Promise<void>;
  onTaskReloaded: (t: PickTask) => Promise<void>;
  setError: (msg: string | null) => void;
  getTask: (taskId: number) => Promise<PickTask>;
}) {
  const { currentTaskId, platformFallback, shopIdFallback, orderTraceId, onCommitted, onTaskReloaded, setError, getTask } =
    args;

  const [commitForm, setCommitForm] = useState<CommitFormState>({
    platform: "PDD",
    shopId: "1",
    traceId: "",
    allowDiff: true,
  });

  const [commitLoading, setCommitLoading] = useState(false);
  const [commitResult, setCommitResult] = useState<PickTaskCommitResult | null>(null);
  const [commitSuccess, setCommitSuccess] = useState(false);

  const updateCommitForm = useCallback((patch: Partial<CommitFormState>) => {
    setCommitForm((prev) => ({ ...prev, ...patch }));
  }, []);

  // 外部可以在拿到订单 trace 后回填
  const syncTraceId = useCallback(() => {
    if (!orderTraceId) return;
    setCommitForm((prev) => ({ ...prev, traceId: prev.traceId || orderTraceId }));
  }, [orderTraceId]);

  const submitCommit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!currentTaskId) {
        setError("没有任务可 commit。");
        return;
      }

      const plat = commitForm.platform.trim() || platformFallback.trim() || "PDD";
      const shop = commitForm.shopId.trim() || shopIdFallback.trim() || "1";

      setError(null);
      setCommitLoading(true);
      setCommitResult(null);
      setCommitSuccess(false);

      try {
        const res = await commitPickTask(currentTaskId, {
          platform: plat,
          shop_id: shop,
          trace_id: commitForm.traceId.trim() || null,
          allow_diff: commitForm.allowDiff,
        });

        setCommitResult(res);
        setCommitSuccess(true);

        await onCommitted(res);

        const t = await getTask(currentTaskId);
        await onTaskReloaded(t);
      } catch (err: unknown) {
        console.error(err);
        setError(getErrorMessage(err) || "commit 出库失败");
        setCommitSuccess(false);
      } finally {
        setCommitLoading(false);
      }
    },
    [
      currentTaskId,
      commitForm,
      platformFallback,
      shopIdFallback,
      setError,
      onCommitted,
      onTaskReloaded,
      getTask,
    ],
  );

  return {
    commitForm,
    commitLoading,
    commitResult,
    commitSuccess,

    onChangeCommitForm: updateCommitForm,
    onSubmitCommit: submitCommit,
    syncTraceId,

    setCommitForm,
    setCommitResult,
    setCommitSuccess,
  };
}
