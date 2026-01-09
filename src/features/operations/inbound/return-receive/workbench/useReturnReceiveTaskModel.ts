// src/features/operations/inbound/return-receive/workbench/useReturnReceiveTaskModel.ts

import { useMemo, useState } from "react";
import type { ReturnTaskLine } from "../types";
import type { ReturnReceiveState } from "../types";
import { commitReturnTask, createReturnTaskFromOrder, recordReturnReceive } from "../../../../return-tasks/api";
import { formatErr, parseIntSafe, toInt } from "./utils";

export type ReturnReceiveTaskModel = Pick<
  ReturnReceiveState,
  | "orderRef"
  | "setOrderRef"
  | "task"
  | "loadingCreate"
  | "error"
  | "committing"
  | "commitError"
  | "qtyInputs"
  | "setQtyInput"
  | "canCreate"
  | "canCommit"
  | "createTask"
  | "clearAll"
  | "adjustLineQty"
  | "applyInputDelta"
  | "commit"
> & {
  clearWorkArea: () => void;

  // ✅ commit 成功后保留一条“查看库存”的定位信息（不自动跳转）
  lastCommittedItemId: number | null;
  clearLastCommitted: () => void;
};

export function useReturnReceiveTaskModel(args: {
  selectedOrderRef: string;
  summaryLinesCount: number;
  loadingDetail: boolean;

  onCommitSuccess: () => Promise<void>;
}): ReturnReceiveTaskModel {
  const { selectedOrderRef, summaryLinesCount, loadingDetail, onCommitSuccess } = args;

  const [orderRef, setOrderRef] = useState<string>(""); // 兼容字段
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [task, setTask] = useState<ReturnReceiveState["task"]>(null);
  const [error, setError] = useState<string | null>(null);

  const [committing, setCommitting] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);

  const [qtyInputs, setQtyInputs] = useState<Record<number, string>>({});

  // ✅ commit 成功后给 UI 一个“查看即时库存”的按钮入口
  const [lastCommittedItemId, setLastCommittedItemId] = useState<number | null>(null);
  const clearLastCommitted = () => setLastCommittedItemId(null);

  const clearWorkArea = () => {
    setOrderRef("");
    setTask(null);
    setError(null);
    setCommitError(null);
    setQtyInputs({});
    setCommitting(false);

    // ⚠️ 不清 lastCommittedItemId：让按钮能留在界面上给人手动点
  };

  const canCreate = useMemo(() => {
    const ref = selectedOrderRef.trim();
    if (!ref) return false;
    if (loadingCreate || loadingDetail) return false;
    if (summaryLinesCount <= 0) return false;
    return true;
  }, [selectedOrderRef, loadingCreate, loadingDetail, summaryLinesCount]);

  const canCommit = useMemo(() => {
    if (!task) return false;
    if (committing) return false;
    if (task.status === "COMMITTED") return false;

    const lines = task.lines ?? [];
    if (lines.length === 0) return false;

    let hasPositive = false;
    for (const ln of lines) {
      const picked = toInt(ln.picked_qty ?? 0);
      const expected = ln.expected_qty == null ? null : toInt(ln.expected_qty);

      if (picked > 0) hasPositive = true;
      if (picked < 0) return false;
      if (expected != null && picked > expected) return false;
    }
    return hasPositive;
  }, [task, committing]);

  const setQtyInput = (itemId: number, v: string) => {
    setQtyInputs((prev) => ({ ...prev, [itemId]: v }));
  };

  const createTask = async (params?: { warehouseId?: number | null }) => {
    const ref = selectedOrderRef.trim();
    if (!ref) return;

    // 新任务开始：旧的“查看库存”入口不再相关
    setLastCommittedItemId(null);

    setError(null);
    setCommitError(null);
    setLoadingCreate(true);
    try {
      const t = await createReturnTaskFromOrder(ref, {
        warehouse_id: params?.warehouseId ?? null,
        include_zero_shipped: false,
      });
      setTask(t);
      setQtyInputs({});
    } catch (e: unknown) {
      setError(formatErr(e, "创建退货回仓任务失败"));
    } finally {
      setLoadingCreate(false);
    }
  };

  const adjustLineQty = async (line: ReturnTaskLine, delta: number) => {
    if (!task) return;
    if (task.status === "COMMITTED") return;

    setError(null);
    setCommitError(null);

    try {
      const t = await recordReturnReceive(task.id, {
        item_id: line.item_id,
        qty: delta,
      });
      setTask(t);
      setQtyInputs((prev) => {
        const next = { ...prev };
        delete next[line.item_id];
        return next;
      });
    } catch (e: unknown) {
      setError(formatErr(e, "记录数量失败"));
    }
  };

  const applyInputDelta = async (line: ReturnTaskLine) => {
    if (!task) return;
    if (task.status === "COMMITTED") return;

    setError(null);

    const raw = qtyInputs[line.item_id] ?? "";
    const n = parseIntSafe(raw);
    if (n == null || n === 0) {
      setError("请输入非 0 的整数数量（可正可负，用于撤销误录）。");
      return;
    }

    await adjustLineQty(line, n);
  };

  const clearAll = () => {
    // 只清右侧作业
    setLastCommittedItemId(null);
    clearWorkArea();
  };

  const commit = async () => {
    if (!task) return;
    if (!canCommit) return;

    // 新一次提交开始：旧入口作废
    setLastCommittedItemId(null);

    setCommitError(null);
    setError(null);
    setCommitting(true);
    try {
      // 先记住一个“可定位”的 item_id（最小实现：取第一行）
      const itemIdForView = task.lines?.[0]?.item_id ?? null;

      await commitReturnTask(task.id, { trace_id: null });

      // ✅ commit 成功后保留“查看库存”入口（不自动跳）
      setLastCommittedItemId(itemIdForView);

      // ✅ 作业闭环：commit 成功后清场（右侧）
      clearWorkArea();

      // ✅ 刷新左侧列表（让 remaining_qty 变化/订单消失）
      await onCommitSuccess();
    } catch (e: unknown) {
      setCommitError(formatErr(e, "提交回仓失败"));
    } finally {
      setCommitting(false);
    }
  };

  return {
    orderRef,
    setOrderRef,

    task,

    loadingCreate,
    error,

    committing,
    commitError,

    qtyInputs,
    setQtyInput,

    canCreate,
    canCommit,

    createTask,
    clearAll,

    adjustLineQty,
    applyInputDelta,
    commit,

    clearWorkArea,

    lastCommittedItemId,
    clearLastCommitted,
  };
}
