// src/features/dev/pick-tasks/controller/useDevPickContext.ts
import { useCallback, useMemo, useState } from "react";

import { fetchDevOrderView, ingestDemoOrder, ensureOrderWarehouse, type DevOrderView } from "../../orders/api/index";
import { createPickTaskFromOrder, getPickTask, getPickTaskDiff, type PickTask, type PickTaskDiffSummary } from "../../../operations/outbound-pick/pickTasksApi";
import { getErrorMessage } from "../types";

export function useDevPickContext() {
  const [platform, setPlatform] = useState("PDD");
  const [shopId, setShopId] = useState("1");

  const [orderView, setOrderView] = useState<DevOrderView | null>(null);
  const [task, setTask] = useState<PickTask | null>(null);
  const [diff, setDiff] = useState<PickTaskDiffSummary | null>(null);

  const [creating, setCreating] = useState(false);
  const [loadingTask, setLoadingTask] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentTaskId = task?.id ?? null;
  const activeWarehouseId = task?.warehouse_id ?? null;
  const activeItemId = useMemo(() => {
    if (!task || !task.lines || task.lines.length === 0) return null;
    return task.lines[0].item_id;
  }, [task]);

  const refreshDiff = useCallback(async (taskId: number) => {
    try {
      const d = await getPickTaskDiff(taskId);
      setDiff(d);
    } catch (err: unknown) {
      console.warn("getPickTaskDiff failed", err);
    }
  }, []);

  const reloadTask = useCallback(async () => {
    if (!currentTaskId) return;
    setError(null);
    setLoadingTask(true);
    try {
      const t = await getPickTask(currentTaskId);
      setTask(t);
      await refreshDiff(t.id);
    } catch (err: unknown) {
      console.error(err);
      setError(getErrorMessage(err) || "重新加载任务失败");
    } finally {
      setLoadingTask(false);
    }
  }, [currentTaskId, refreshDiff]);

  const createFromDemo = useCallback(async () => {
    setError(null);
    setCreating(true);

    setTask(null);
    setDiff(null);
    setOrderView(null);

    try {
      const plat = platform.trim() || "PDD";
      const shop = shopId.trim() || "1";

      const demo = await ingestDemoOrder({ platform: plat, shopId: shop });
      const { order_id, ext_order_no } = demo;

      const ensured = await ensureOrderWarehouse({
        platform: plat,
        shopId: shop,
        extOrderNo: ext_order_no,
      });
      if (!ensured.ok || !ensured.warehouse_id) {
        throw new Error(ensured.message || "ensure-warehouse 失败，请检查店铺与仓库绑定关系。");
      }

      const whId = ensured.warehouse_id;

      const createdTask = await createPickTaskFromOrder(order_id, {
        warehouse_id: whId,
        source: "ORDER",
        priority: 100,
      });
      setTask(createdTask);

      const view = await fetchDevOrderView({
        platform: plat,
        shopId: shop,
        extOrderNo: ext_order_no,
      });
      setOrderView(view);

      await refreshDiff(createdTask.id);
    } catch (err: unknown) {
      console.error(err);
      setError(getErrorMessage(err) || "创建 demo 订单 / 拣货任务失败");
    } finally {
      setCreating(false);
    }
  }, [platform, shopId, refreshDiff]);

  return {
    // ctx
    platform,
    shopId,
    setPlatform,
    setShopId,

    // data
    orderView,
    task,
    diff,

    // derived
    currentTaskId,
    activeWarehouseId,
    activeItemId,

    // status
    creating,
    loadingTask,
    error,
    setError,

    // actions
    createFromDemo,
    reloadTask,
    refreshDiff,
    setOrderView,
    setTask,
    setDiff,
  };
}
