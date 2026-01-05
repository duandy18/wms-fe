// src/features/operations/inbound/cockpit/commit.ts

import { commitReceiveTask, type ReceiveTask } from "../../../receive-tasks/api";
import { getErrMsg, makeDefaultTraceId } from "./utils";

export async function commit(args: {
  currentTask: ReceiveTask | null;

  traceId: string;
  setTraceId: (v: string) => void;

  setCommitting: (v: boolean) => void;
  setCommitError: (v: string | null) => void;

  setCurrentTask: (v: ReceiveTask | null) => void;
  setTaskError: (v: string | null) => void;
}): Promise<boolean> {
  const {
    currentTask,
    traceId,
    setTraceId,
    setCommitting,
    setCommitError,
    setCurrentTask,
    setTaskError,
  } = args;

  if (!currentTask) {
    setCommitError("请先绑定任务");
    return false;
  }
  if (currentTask.status === "COMMITTED") {
    setCommitError("任务已 COMMITTED");
    return false;
  }

  const finalTraceId =
    traceId && traceId.trim()
      ? traceId.trim()
      : makeDefaultTraceId(currentTask.id);

  setTraceId(finalTraceId);
  setCommitting(true);
  setCommitError(null);

  try {
    const updated = await commitReceiveTask(currentTask.id, {
      trace_id: finalTraceId,
    });
    setCurrentTask(updated);
    setTaskError(null);
    return true;
  } catch (err: unknown) {
    console.error("commitReceiveTask failed", err);
    setCommitError(getErrMsg(err, "确认入库失败"));
    return false;
  } finally {
    setCommitting(false);
  }
}
