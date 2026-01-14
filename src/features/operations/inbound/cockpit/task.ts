// src/features/operations/inbound/cockpit/task.ts

import {
  fetchReceiveTask,
  createReceiveTaskFromPo,
  createReceiveTaskFromPoSelected,
  type ReceiveTask,
  type ReceiveTaskCreateFromPoSelectedLinePayload,
} from "../../../receive-tasks/api";
import type { PurchaseOrderDetail } from "../../../purchase-orders/api";
import { getErrMsg } from "./utils";

export async function internalLoadTask(args: {
  taskId: number;
  setLoadingTask: (v: boolean) => void;
  setTaskError: (v: string | null) => void;
  setCurrentTask: (v: ReceiveTask | null) => void;
  setCommitError: (v: string | null) => void;
  setActiveItemId: (v: number | null) => void;
}) {
  const {
    taskId,
    setLoadingTask,
    setTaskError,
    setCurrentTask,
    setCommitError,
    setActiveItemId,
  } = args;

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

/** 旧：整单/剩余应收创建（保留备用） */
export async function createTaskFromPo(args: {
  currentPo: PurchaseOrderDetail | null;
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

/** 新：选择式创建（本次到货批次） */
export async function createTaskFromPoSelected(args: {
  currentPo: PurchaseOrderDetail | null;
  selectedLines: ReceiveTaskCreateFromPoSelectedLinePayload[];
  setCreatingTask: (v: boolean) => void;
  setTaskError: (v: string | null) => void;
  setCurrentTask: (v: ReceiveTask | null) => void;
  setTaskIdInput: (v: string) => void;
  setCommitError: (v: string | null) => void;
  setActiveItemId: (v: number | null) => void;
}) {
  const {
    currentPo,
    selectedLines,
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
  if (!selectedLines || selectedLines.length === 0) {
    setTaskError("请先选择本次到货行并填写计划量");
    return;
  }

  const poId = currentPo.id;

  setCreatingTask(true);
  setTaskError(null);
  try {
    const task = await createReceiveTaskFromPoSelected(poId, {
      warehouse_id: currentPo.warehouse_id,
      lines: selectedLines,
    });
    setCurrentTask(task);
    setTaskIdInput(String(task.id));
    setCommitError(null);
    setActiveItemId(null);
  } catch (err: unknown) {
     
    console.error("createReceiveTaskFromPoSelected failed", err);
    setTaskError(getErrMsg(err, "创建本次到货收货任务失败"));
  } finally {
    setCreatingTask(false);
  }
}
