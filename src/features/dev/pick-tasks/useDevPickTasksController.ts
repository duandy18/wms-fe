// src/features/dev/pick-tasks/useDevPickTasksController.ts

import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  ingestDemoOrder,
  ensureOrderWarehouse,
  fetchDevOrderView,
  type DevOrderView,
} from "../orders/api/index";

import {
  createPickTaskFromOrder,
  getPickTask,
  getPickTaskDiff,
  scanPickTask,
  commitPickTask,
  type PickTask,
  type PickTaskDiffSummary,
  type PickTaskCommitResult,
} from "../../operations/outbound-pick/pickTasksApi";

import { apiPost } from "../../../lib/api";
import { buildWmsOrderConfirmCodeFromTaskRef } from "../../operations/outbound-pick/pickTasksCockpitUtils";

import type { CommitFormState, ScanFormState, StockBatchRow, StockBatchQueryOut } from "./types";
import { getErrorMessage } from "./types";

// 供上层（Panel）使用的返回结构
export function useDevPickTasksController(args: { navigate: (to: string) => void }) {
  const { navigate } = args;

  // 基础上下文：平台 / 店铺
  const [platform, setPlatform] = useState("PDD");
  const [shopId, setShopId] = useState("1");

  // 订单 & 任务状态
  const [orderView, setOrderView] = useState<DevOrderView | null>(null);
  const [task, setTask] = useState<PickTask | null>(null);
  const [diff, setDiff] = useState<PickTaskDiffSummary | null>(null);

  const [creating, setCreating] = useState(false);
  const [loadingTask, setLoadingTask] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 扫码表单 + 状态反馈（注意 qty 含义：本次要拣的数量）
  const [scanForm, setScanForm] = useState<ScanFormState>({
    itemId: "",
    qty: "1",
    batchCode: "",
  });
  const [scanLoading, setScanLoading] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  // commit 表单 + 状态反馈
  const [commitForm, setCommitForm] = useState<CommitFormState>({
    platform: "PDD",
    shopId: "1",
    traceId: "",
    allowDiff: true,
  });
  const [commitLoading, setCommitLoading] = useState(false);
  const [commitResult, setCommitResult] = useState<PickTaskCommitResult | null>(null);
  const [commitSuccess, setCommitSuccess] = useState(false);

  // FEFO 批次视图状态
  const [batchRows, setBatchRows] = useState<StockBatchRow[]>([]);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [batchesError, setBatchesError] = useState<string | null>(null);

  const currentTaskId = task?.id ?? null;
  const activeWarehouseId = task?.warehouse_id ?? null;
  const activeItemId = useMemo(() => {
    if (!task || !task.lines || task.lines.length === 0) return null;
    return task.lines[0].item_id;
  }, [task]);

  // 推荐批次：FEFO 排序后第一条（后端已按 FEFO 排）
  const recommendedBatchCode = batchRows.length > 0 ? batchRows[0].batch_code ?? null : null;

  // ---------- 小工具：刷新 diff ----------
  const refreshDiff = useCallback(async (taskId: number) => {
    try {
      const d = await getPickTaskDiff(taskId);
      setDiff(d);
    } catch (err: unknown) {
      console.warn("getPickTaskDiff failed", err);
    }
  }, []);

  // ---------- 根据当前任务的 item_id + warehouse_id 查询 FEFO 批次 ----------
  useEffect(() => {
    async function loadBatches() {
      if (!activeWarehouseId || !activeItemId) {
        setBatchRows([]);
        setBatchesError(null);
        return;
      }

      setBatchesLoading(true);
      setBatchesError(null);

      try {
        const payload: Omit<StockBatchQueryOut, "items"> & { item_id: number; warehouse_id: number; items?: never } = {
          item_id: activeItemId,
          warehouse_id: activeWarehouseId,
          total: 0,
          page: 1,
          page_size: 50,
        };

        // 实际后端只需要 item_id/warehouse_id/page/page_size，我们这里用明确字段构造，避免 any
        const res = await apiPost<StockBatchQueryOut>("/stock/batch/query", {
          item_id: payload.item_id,
          warehouse_id: payload.warehouse_id,
          page: payload.page,
          page_size: payload.page_size,
        });

        setBatchRows(res.items ?? []);
      } catch (err: unknown) {
        console.error(err);
        setBatchesError(getErrorMessage(err) || "加载批次库存失败");
        setBatchRows([]);
      } finally {
        setBatchesLoading(false);
      }
    }

    void loadBatches();
  }, [activeWarehouseId, activeItemId]);

  // ---------- 一键生成 demo 订单 + 创建拣货任务 ----------
  async function handleCreateFromDemo() {
    setError(null);
    setCreating(true);
    setTask(null);
    setDiff(null);
    setCommitResult(null);
    setScanSuccess(false);
    setCommitSuccess(false);

    try {
      const plat = platform.trim() || "PDD";
      const shop = shopId.trim() || "1";

      // 1) 生成 demo 订单
      const demo = await ingestDemoOrder({ platform: plat, shopId: shop });
      const { order_id, ext_order_no } = demo;

      // 2) 确保订单已有仓库（按店铺绑定解析）
      const ensured = await ensureOrderWarehouse({
        platform: plat,
        shopId: shop,
        extOrderNo: ext_order_no,
      });
      if (!ensured.ok || !ensured.warehouse_id) {
        throw new Error(ensured.message || "ensure-warehouse 失败，请检查店铺与仓库绑定关系。");
      }

      const whId = ensured.warehouse_id;

      // 3) 创建拣货任务（source=ORDER）
      const createdTask = await createPickTaskFromOrder(order_id, {
        warehouse_id: whId,
        source: "ORDER",
        priority: 100,
      });
      setTask(createdTask);

      // 4) 拉订单头，拿 trace_id（用于 commit & Trace 跳转）
      const view = await fetchDevOrderView({
        platform: plat,
        shopId: shop,
        extOrderNo: ext_order_no,
      });
      setOrderView(view);

      setCommitForm((prev) => ({
        platform: plat,
        shopId: shop,
        traceId: view.trace_id || "",
        allowDiff: prev.allowDiff,
      }));

      // 清一下本地状态
      setScanForm({ itemId: "", qty: "1", batchCode: "" });
      setBatchRows([]);

      // 5) 刷新 diff
      await refreshDiff(createdTask.id);
    } catch (err: unknown) {
      console.error(err);
      setError(getErrorMessage(err) || "创建 demo 订单 / 拣货任务失败");
    } finally {
      setCreating(false);
    }
  }

  // ---------- 手动重载任务 ----------
  async function handleReloadTask() {
    if (!currentTaskId) return;
    setError(null);
    setLoadingTask(true);
    setCommitResult(null);
    setCommitSuccess(false);
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
  }

  // ---------- 扫码写任务（不扣库存） ----------
  async function handleScanSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentTaskId) {
      setError("请先创建或加载一条拣货任务。");
      return;
    }
    setError(null);
    setScanLoading(true);
    setCommitResult(null);
    setCommitSuccess(false);

    try {
      const itemId = Number.parseInt(scanForm.itemId, 10);
      const qty = Number.parseInt(scanForm.qty, 10);
      const batchCode = scanForm.batchCode.trim() || undefined;

      if (!itemId || qty <= 0) {
        throw new Error("请填写合法的 item_id 和数量（数量表示本次拣货动作要拣的件数，例如 5 表示一次性拣 5 件）。");
      }

      const t = await scanPickTask(currentTaskId, {
        item_id: itemId,
        qty,
        batch_code: batchCode ?? null,
      });
      setTask(t);
      await refreshDiff(t.id);
      setScanSuccess(true);
    } catch (err: unknown) {
      console.error(err);
      setError(getErrorMessage(err) || "记录扫码拣货失败");
      setScanSuccess(false);
    } finally {
      setScanLoading(false);
    }
  }

  function buildDevHandoffCodeOrThrow(args2: { taskRef: string | null; plat: string; shop: string }): string {
    const code = buildWmsOrderConfirmCodeFromTaskRef(args2.taskRef);
    if (code) return code;

    // Dev 面板不允许 fallback 到 PICKTASK，因为后端 commit 已强制要求 ORD + WMS:ORDER:v1
    throw new Error(
      `无法从 task.ref 推导订单确认码：task.ref=${String(args2.taskRef || "")}。请确认任务来源为 ORDER 且 ref 为 ORD:*。`,
    );
  }

  // ---------- commit 出库 ----------
  async function handleCommitSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentTaskId || !task) {
      setError("没有任务可 commit。");
      return;
    }

    const plat = commitForm.platform.trim() || platform.trim() || "PDD";
    const shop = commitForm.shopId.trim() || shopId.trim() || "1";

    setError(null);
    setCommitLoading(true);
    setCommitResult(null);
    setCommitSuccess(false);

    try {
      const handoffCode = buildDevHandoffCodeOrThrow({ taskRef: task.ref ?? null, plat, shop });

      const payload = {
        platform: plat,
        shop_id: shop,
        handoff_code: handoffCode,
        trace_id: commitForm.traceId.trim() || null,
        allow_diff: commitForm.allowDiff,
      };

      const res = await commitPickTask(currentTaskId, payload);
      setCommitResult(res);
      setCommitSuccess(true);

      const t = await getPickTask(currentTaskId);
      setTask(t);
      await refreshDiff(t.id);
    } catch (err: unknown) {
      console.error(err);
      setError(getErrorMessage(err) || "commit 出库失败");
      setCommitSuccess(false);
    } finally {
      setCommitLoading(false);
    }
  }

  // ---------- 使用推荐批次：写入扫码批次输入框 ----------
  function handleUseRecommendedBatch() {
    if (!recommendedBatchCode) return;
    setScanForm((prev) => ({ ...prev, batchCode: recommendedBatchCode }));
  }

  // ---------- 跳 Trace ----------
  function handleJumpTrace() {
    const traceId = commitForm.traceId.trim() || orderView?.trace_id?.trim() || "";
    if (!traceId) return;
    const qs = new URLSearchParams();
    qs.set("trace_id", traceId);
    navigate(`/trace?${qs.toString()}`);
  }

  function updateScanForm(patch: Partial<ScanFormState>) {
    setScanForm((prev) => ({ ...prev, ...patch }));
  }

  function updateCommitForm(patch: Partial<CommitFormState>) {
    setCommitForm((prev) => ({ ...prev, ...patch }));
  }

  return {
    // 基础上下文
    platform,
    shopId,
    setPlatform,
    setShopId,

    creating,
    onCreateDemo: handleCreateFromDemo,

    // 订单 & 任务
    orderView,
    task,
    loadingTask,
    onReloadTask: handleReloadTask,

    // FEFO 批次
    batchRows,
    batchesLoading,
    batchesError,
    activeItemId,
    activeWarehouseId,
    recommendedBatchCode,
    onUseRecommendedBatch: handleUseRecommendedBatch,

    // diff
    diff,

    // 扫码
    scanForm,
    scanLoading,
    scanSuccess,
    onChangeScanForm: updateScanForm,
    onSubmitScan: handleScanSubmit,

    // commit
    commitForm,
    commitLoading,
    commitSuccess,
    onChangeCommitForm: updateCommitForm,
    onSubmitCommit: handleCommitSubmit,
    onJumpTrace: handleJumpTrace,

    // 错误 & 结果
    error,
    commitResult,
  };
}
