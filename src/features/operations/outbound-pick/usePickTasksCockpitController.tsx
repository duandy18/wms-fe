// src/features/operations/outbound-pick/usePickTasksCockpitController.tsx

import { useMemo } from "react";

import { derivePlatformShop } from "./pickTasksCockpitUtils";
import { useCockpitList } from "./cockpit/useCockpitList";
import { useCockpitDetail } from "./cockpit/useCockpitDetail";
import { useCockpitItemMeta } from "./cockpit/useCockpitItemMeta";
import { useCockpitFefo } from "./cockpit/useCockpitFefo";
import { useCockpitScan } from "./cockpit/useCockpitScan";
import { useCockpitCommit } from "./cockpit/useCockpitCommit";

export function usePickTasksCockpitController(args: {
  navigateToBarcodeBind: (barcode: string) => void;
}) {
  const { navigateToBarcodeBind } = args;

  // ---------------- 列表：仓库 + 状态 + 来源 + tasks ----------------
  const list = useCockpitList();

  // ---------------- 详情：selectedTask + diff + orderInfo + activeItemId ----------------
  const detail = useCockpitDetail({
    selectedTaskId: list.selectedTaskId,
  });

  // ---------------- item 主数据缓存：item_id -> ItemBasic ----------------
  const itemMeta = useCockpitItemMeta();

  // ---------------- 当前任务的平台 / 店铺 ----------------
  const currentPlatformShop = useMemo(
    () =>
      detail.selectedTask
        ? derivePlatformShop(detail.selectedTask.ref)
        : { platform: "PDD", shop_id: "1" },
    [detail.selectedTask],
  );

  // ---------------- active item 的元数据 ----------------
  const activeItemMeta = useMemo(() => {
    const id = detail.activeItemId;
    if (id == null) return null;
    return itemMeta.itemMetaMap[id] ?? null;
  }, [detail.activeItemId, itemMeta.itemMetaMap]);

  // ---------------- FEFO 批次视图 ----------------
  const fefo = useCockpitFefo({
    activeItemId: detail.activeItemId,
    selectedTask: detail.selectedTask,
  });

  // ---------------- 扫码拣货 ----------------
  const scan = useCockpitScan({
    selectedTask: detail.selectedTask,
    scanBatchOverride: fefo.scanBatchOverride,
    setScanBatchOverride: fefo.setScanBatchOverride,
    activeItemMeta,
    setActiveItemId: detail.setActiveItemId,
    loadTaskDetail: detail.loadTaskDetail,
    navigateToBarcodeBind,
  });

  // ---------------- 提交出库 + 提交后链路 ----------------
  const commit = useCockpitCommit({
    selectedTask: detail.selectedTask,
    currentPlatformShop,
    allowDiffDefault: false,
    loadTasks: list.loadTasks,
    loadTaskDetail: detail.loadTaskDetail,
  });

  // ---------------- 绑定：列表加载 & 选中任务漂移处理 ----------------
  // 当 list 的过滤条件变化，会触发 list.loadTasks；随后 list.visibleTasks 变化。
  // 这里做“选中任务自动对齐”与“空列表时全局清空”。
  // （逻辑与原文件一致：visibleTasks 为空时清空多个子状态）
  // NOTE: 具体 effect 在 useCockpitList 内部已执行“默认选中第一条”；这里补齐空列表全清空。
  if (list.visibleTasks.length === 0 && list.selectedTaskId != null) {
    // 让 UI 回到“无任务”状态
    list.setSelectedTaskId(null);
    detail.reset();
    fefo.reset();
    scan.reset();
    commit.reset();
  }

  return {
    // filters
    warehouseId: list.warehouseId,
    setWarehouseId: list.setWarehouseId,
    statusFilter: list.statusFilter,
    setStatusFilter: list.setStatusFilter,
    sourceFilter: list.sourceFilter,
    setSourceFilter: list.setSourceFilter,

    // list
    tasks: list.tasks,
    visibleTasks: list.visibleTasks,
    loadingList: list.loadingList,
    listError: list.listError,
    loadTasks: list.loadTasks,

    // selection & detail
    selectedTaskId: list.selectedTaskId,
    setSelectedTaskId: list.setSelectedTaskId,
    selectedTask: detail.selectedTask,
    loadingDetail: detail.loadingDetail,
    detailError: detail.detailError,
    loadTaskDetail: detail.loadTaskDetail,

    // diff
    diff: detail.diff,

    // item meta
    itemMetaMap: itemMeta.itemMetaMap,
    activeItemId: detail.activeItemId,
    setActiveItemId: detail.setActiveItemId,
    activeItemMeta,

    // order info
    orderInfo: detail.orderInfo,

    // platform/shop
    currentPlatformShop,

    // scan
    scanBusy: scan.scanBusy,
    scanError: scan.scanError,
    scanSuccess: scan.scanSuccess,
    scanBatchOverride: fefo.scanBatchOverride,
    setScanBatchOverride: fefo.setScanBatchOverride,
    scanQty: scan.scanQty,
    setScanQty: scan.setScanQty,
    scanPreview: scan.scanPreview,
    handleScan: scan.handleScan,

    // fefo
    fefoDetail: fefo.fefoDetail,
    fefoLoading: fefo.fefoLoading,
    fefoError: fefo.fefoError,
    handleUseFefoBatch: fefo.handleUseFefoBatch,

    // commit
    allowDiff: commit.allowDiff,
    setAllowDiff: commit.setAllowDiff,
    commitBusy: commit.commitBusy,
    commitError: commit.commitError,
    handleCommit: commit.handleCommit,

    // post commit
    traceId: commit.traceId,
    postCommitInfo: commit.postCommitInfo,
    postCommitLoading: commit.postCommitLoading,
    postCommitError: commit.postCommitError,
  };
}
