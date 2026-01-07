// src/features/operations/outbound-pick/cockpit/useCockpitDetail.tsx

import { useEffect, useState } from "react";

import {
  getPickTask,
  getPickTaskDiff,
  type PickTask,
  type PickTaskDiffSummary,
} from "../pickTasksApi";
import type { ApiErrorShape } from "../types_cockpit";

import { fetchOrderView, type OrderView } from "../../../orders/api";
import { parseOrderKeyFromRef } from "../pickTasksCockpitUtils";

export function useCockpitDetail(args: { selectedTaskId: number | null }) {
  const { selectedTaskId } = args;

  const [selectedTask, setSelectedTask] = useState<PickTask | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [activeItemId, setActiveItemId] = useState<number | null>(null);
  const [diff, setDiff] = useState<PickTaskDiffSummary | null>(null);

  // 当前任务的订单信息（从 ref 解析，再调 /orders 获取）
  const [orderInfo, setOrderInfo] = useState<OrderView | null>(null);

  async function loadTaskDetail(taskId: number) {
    setLoadingDetail(true);
    setDetailError(null);
    try {
      // 1) 拿任务本身
      const task = await getPickTask(taskId);
      setSelectedTask(task);
      setActiveItemId(task.lines[0]?.item_id ?? null);

      // 2) 根据 ref 解析订单键，拉订单头
      let order: OrderView | null = null;
      const key = parseOrderKeyFromRef(task.ref ?? null);
      if (key) {
        try {
          order = await fetchOrderView({
            platform: key.platform,
            shopId: key.shopId,
            extOrderNo: key.extOrderNo,
          });
        } catch (e) {
          console.warn("fetchOrderView failed:", e);
        }
      }
      setOrderInfo(order);

      // 3) diff
      const diffSummary = await getPickTaskDiff(taskId);
      setDiff(diffSummary);
    } catch (err: unknown) {
      const e = err as ApiErrorShape;
      console.error("loadTaskDetail failed:", e);
      setDetailError(e?.message ?? "加载任务详情失败");
      setSelectedTask(null);
      setDiff(null);
      setActiveItemId(null);
      setOrderInfo(null);
    } finally {
      setLoadingDetail(false);
    }
  }

  function reset() {
    setSelectedTask(null);
    setDiff(null);
    setActiveItemId(null);
    setOrderInfo(null);
    setDetailError(null);
    setLoadingDetail(false);
  }

  useEffect(() => {
    if (selectedTaskId != null) {
      void loadTaskDetail(selectedTaskId);
    } else {
      reset();
    }
     
  }, [selectedTaskId]);

  return {
    selectedTask,
    loadingDetail,
    detailError,
    loadTaskDetail,

    activeItemId,
    setActiveItemId,

    diff,
    orderInfo,

    reset,
  };
}
