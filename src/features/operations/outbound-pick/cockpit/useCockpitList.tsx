// src/features/operations/outbound-pick/cockpit/useCockpitList.tsx

import { useEffect, useMemo, useState } from "react";
import { listPickTasks, type PickTask } from "../pickTasksApi";
import type { ApiErrorShape, StatusFilter } from "../types_cockpit";

export function useCockpitList() {
  // 列表过滤：仓库 + 状态 + 来源（默认只看 ORDER）
  const [warehouseId, setWarehouseId] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("READY");
  const [sourceFilter, setSourceFilter] = useState<"ORDER" | "ALL">("ORDER");

  // 列表数据
  const [tasks, setTasks] = useState<PickTask[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  // 当前选中任务
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  // 根据 sourceFilter 做前端过滤（默认只看 ORDER）
  const visibleTasks = useMemo(
    () => tasks.filter((t) => (sourceFilter === "ORDER" ? t.source === "ORDER" : true)),
    [tasks, sourceFilter],
  );

  // ---------------- 加载列表 ----------------
  async function loadTasks() {
    setLoadingList(true);
    setListError(null);
    try {
      const statusParam =
        statusFilter === "ALL" || statusFilter === "DONE" ? undefined : statusFilter;

      const data = await listPickTasks({
        warehouse_id: warehouseId || undefined,
        status: statusParam,
        limit: 100,
      });

      setTasks(data);
    } catch (err: unknown) {
      const e = err as ApiErrorShape;
      console.error("loadTasks failed:", e);
      setListError(e?.message ?? "加载拣货任务列表失败");
      setTasks([]);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    void loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouseId, statusFilter]);

  // 当 visibleTasks 变化时，同步选中任务（保持与原逻辑一致）
  useEffect(() => {
    if (visibleTasks.length === 0) {
      setSelectedTaskId(null);
      return;
    }

    if (selectedTaskId == null || !visibleTasks.some((t) => t.id === selectedTaskId)) {
      setSelectedTaskId(visibleTasks[0].id);
    }
  }, [visibleTasks, selectedTaskId]);

  return {
    warehouseId,
    setWarehouseId,
    statusFilter,
    setStatusFilter,
    sourceFilter,
    setSourceFilter,

    tasks,
    visibleTasks,
    loadingList,
    listError,
    loadTasks,

    selectedTaskId,
    setSelectedTaskId,
  };
}
