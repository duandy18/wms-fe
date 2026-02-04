// src/features/operations/outbound-pick/orderPick/useCreatePickTaskFromOrder.ts
import { useCallback, useMemo, useState } from "react";

import type { OrderSummary } from "../../../orders/api";
import { createPickTaskFromOrder, type PickTask } from "../pickTasksApi";

export function useCreatePickTaskFromOrder(args: {
  pickedOrder: OrderSummary | null;

  // PickTasks cockpit controller：用于创建成功后的联动
  loadTasks: () => Promise<void>;
  setSelectedTaskId: (id: number | null) => void;
  loadTaskDetail: (taskId: number) => Promise<void>;
}) {
  const { pickedOrder, loadTasks, setSelectedTaskId, loadTaskDetail } = args;

  const [creatingTask, setCreatingTask] = useState(false);
  const [createTaskError, setCreateTaskError] = useState<string | null>(null);
  const [createdTask, setCreatedTask] = useState<PickTask | null>(null);

  // ✅ Phase 2：创建拣货任务不再要求前端选仓（执行仓由后端根据店铺默认仓解析）
  const canCreateTask = useMemo(() => {
    return !!pickedOrder && !creatingTask;
  }, [pickedOrder, creatingTask]);

  const createTask = useCallback(async () => {
    if (!pickedOrder) return;

    setCreatingTask(true);
    setCreateTaskError(null);
    setCreatedTask(null);

    try {
      const task = await createPickTaskFromOrder(pickedOrder.id, {
        source: "ORDER",
        priority: 100,
      });

      setCreatedTask(task);

      // ✅ 创建成功后：刷新任务列表 + 选中该任务 + 拉详情
      await loadTasks();
      setSelectedTaskId(task.id);
      await loadTaskDetail(task.id);
    } catch (err: unknown) {
      console.error("createPickTaskFromOrder failed", err);
      const msg = err instanceof Error ? err.message : "创建拣货任务失败";
      setCreateTaskError(msg);
    } finally {
      setCreatingTask(false);
    }
  }, [pickedOrder, loadTasks, setSelectedTaskId, loadTaskDetail]);

  const reset = useCallback(() => {
    setCreatingTask(false);
    setCreateTaskError(null);
    setCreatedTask(null);
  }, []);

  return {
    creatingTask,
    createTaskError,
    createdTask,
    canCreateTask,
    createTask,
    reset,
  };
}
