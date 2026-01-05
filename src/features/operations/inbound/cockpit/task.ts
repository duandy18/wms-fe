// src/features/operations/inbound/cockpit/task.ts

import { fetchReceiveTask, createReceiveTaskFromPo, type ReceiveTask } from "../../../receive-tasks/api";
import type { PurchaseOrderWithLines } from "../../../purchase-orders/api";
import { getErrMsg } from "./utils";

export async function internalLoadTask(args: {
  taskId: number;
  setLoadingTask: (v: boolean) => void;
  setTaskError: (v: string | null) => void;
  setCurrentTask: (v: ReceiveTask | null) => void;
  setCommitError: (v: string | null) => void;
  setActiveItemId: (v: number | null) => void;
}) {
  const { taskId, setLoadingTask, setTaskError, setCurrentTask, setCommitError, setActiveItemId } = args;

  setLoadingTask(true);
  setTaskError(null);
  try {
    const t = await fetchReceiveTask(taskId);
    setCurrentTask(t);
    setCommitError(null);
    setActiveItemId(null);
  } catch (err: unknown) {
    console.error("fetchReceiveTask error", err);
    setCurrentTask(null);
    setTaskError(getErrMsg(err, "加载收货任务失败"));
  } finally {
    setLoadingTask(false);
  }
}

export async function bindTaskById(args: {
  taskIdInput: string;
  setTaskError: (v: string | null) => void;
  onLoad: (taskId: number) => Promise<void>;
}) {
  const { taskIdInput, setTaskError, onLoad } = args;

  const raw = taskIdInput.trim();
  if (!raw) {
    setTaskError("请输入收货任务 ID");
    return;
  }
  const id = Number(raw);
  if (!Number.isFinite(id) || id <= 0) {
    setTaskError("任务 ID 必须为正整数");
    return;
  }
  await onLoad(id);
}

export async function reloadTask(args: {
  currentTask: ReceiveTask | null;
  onLoad: (taskId: number) => Promise<void>;
}) {
  const { currentTask, onLoad } = args;
  if (currentTask) {
    await onLoad(currentTask.id);
  }
}

export async function createTaskFromPo(args: {
  currentPo: PurchaseOrderWithLines | null;
  setCreatingTask: (v: boolean) => void;
  setTaskError: (v: string | null) => void;
  setCurrentTask: (v: ReceiveTask | null) => void;
  setTaskIdInput: (v: string) => void;
  setCommitError: (v: string | null) => void;
  setActiveItemId: (v: number | null) => void;
}) {
  const {
    currentPo,
    setCreatingTask,
    setTaskError,
    setCurrentTask,
    setTaskIdInput,
    setCommitError,
    setActiveItemId,
  } = args;

  if (!currentPo) {
    setTaskError("请先加载采购单");
    return;
  }
  const poId = currentPo.id;

  setCreatingTask(true);
  setTaskError(null);
  try {
    const task = await createReceiveTaskFromPo(poId, {
      warehouse_id: currentPo.warehouse_id,
      include_fully_received: false,
    });
    setCurrentTask(task);
    setTaskIdInput(String(task.id));
    setCommitError(null);
    setActiveItemId(null);
  } catch (err: unknown) {
    console.error("createReceiveTaskFromPo failed", err);
    setTaskError(getErrMsg(err, "从采购单创建收货任务失败"));
  } finally {
    setCreatingTask(false);
  }
}
