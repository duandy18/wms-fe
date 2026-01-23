// src/features/dev/DevPickTasksPanel.tsx
//
// DevConsole · 拣货链路调试主面板（PickTasks Debug Panel）
//
// 中控职责：
// - 生成 demo 订单 + demo 拣货任务（source=ORDER）；
// - 加载拣货任务头 + 行 + diff；
// - 查询 FEFO 批次库存（/stock/batch/query）；
// - 记录拣货动作：/pick-tasks/{task_id}/scan（只写任务，不扣库存）；
// - 提交出库：/pick-tasks/{task_id}/commit（真正写 ledger + stocks + trace）。
//
// 重要约定（注意数量语义）：
// - scanForm.qty 表示「本次拣货动作要拣的数量」，而不是「扫码次数」。
//   例如同一商品需要 5 件时，只需调用一次 scanPickTask，qty=5 即可。
// - 批次 batch_code 必须由 FEFO + 人工确认后填入；后端不会替你自动选批次。

import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ingestDemoOrder,
  ensureOrderWarehouse,
  fetchDevOrderView,
  type DevOrderView,
} from "./orders/api/index";

import {
  createPickTaskFromOrder,
  getPickTask,
  getPickTaskDiff,
  scanPickTask,
  commitPickTask,
  type PickTask,
  type PickTaskDiffSummary,
  type PickTaskCommitResult,
} from "../operations/outbound-pick/pickTasksApi";

import { apiPost } from "../../lib/api";
import { DevPickTasksLayout } from "./pick-tasks/DevPickTasksLayout";

// ---------- 扫码 / commit 表单状态 ----------

export type ScanFormState = {
  itemId: string;
  qty: string; // 本次动作要拣的数量（例如 5 = 本次拣 5 件）
  batchCode: string;
};

export type CommitFormState = {
  platform: string;
  shopId: string;
  traceId: string;
  allowDiff: boolean;
};

// ---------- 批次查询类型（对应 /stock/batch/query 输出） ----------

export interface StockBatchRow {
  batch_id: number | null;
  item_id: number;
  warehouse_id: number;
  batch_code: string | null;
  qty: number;
  production_date?: string | null;
  expiry_date?: string | null;
  days_to_expiry?: number | null;
}

interface StockBatchQueryOut {
  total: number;
  page: number;
  page_size: number;
  items: StockBatchRow[];
}

// 统一错误信息提取，避免到处写 any / as Error
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "未知错误";
  }
};

export const DevPickTasksPanel: React.FC = () => {
  const navigate = useNavigate();

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
  const [commitResult, setCommitResult] = useState<PickTaskCommitResult | null>(
    null,
  );
  const [commitSuccess, setCommitSuccess] = useState(false);

  // FEFO 批次视图状态
  const [batchRows, setBatchRows] = useState<StockBatchRow[]>([]);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [batchesError, setBatchesError] = useState<string | null>(null);

  const currentTaskId = task?.id ?? null;
  const activeWarehouseId = task?.warehouse_id ?? null;
  const activeItemId =
    task && task.lines && task.lines.length > 0
      ? task.lines[0].item_id
      : null;

  // 推荐批次：FEFO 排序后第一条（后端已按 FEFO 排）
  const recommendedBatchCode =
    batchRows.length > 0 ? batchRows[0].batch_code ?? null : null;

  // ---------- 小工具：刷新 diff ----------
  const refreshDiff = useCallback(
    async (taskId: number) => {
      try {
        const d = await getPickTaskDiff(taskId);
        setDiff(d);
      } catch (err: unknown) {
        console.warn("getPickTaskDiff failed", err);
      }
    },
    [],
  );

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
        const payload = {
          item_id: activeItemId,
          warehouse_id: activeWarehouseId,
          page: 1,
          page_size: 50,
        };
        const res = await apiPost<StockBatchQueryOut>(
          "/stock/batch/query",
          payload,
        );
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
        throw new Error(
          ensured.message ||
            "ensure-warehouse 失败，请检查店铺与仓库绑定关系。",
        );
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
        throw new Error(
          "请填写合法的 item_id 和数量（数量表示本次拣货动作要拣的件数，例如 5 表示一次性拣 5 件）。",
        );
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
      const payload = {
        platform: plat,
        shop_id: shop,
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
    const traceId =
      commitForm.traceId.trim() || orderView?.trace_id?.trim() || "";
    if (!traceId) return;
    const qs = new URLSearchParams();
    qs.set("trace_id", traceId);
    navigate(`/trace?${qs.toString()}`);
  }

  // ---------- 表单局部更新工具 ----------
  function updateScanForm(patch: Partial<ScanFormState>) {
    setScanForm((prev) => ({ ...prev, ...patch }));
  }

  function updateCommitForm(patch: Partial<CommitFormState>) {
    setCommitForm((prev) => ({ ...prev, ...patch }));
  }

  return (
    <DevPickTasksLayout
      // 基础上下文
      platform={platform}
      shopId={shopId}
      onChangePlatform={setPlatform}
      onChangeShopId={setShopId}
      creating={creating}
      onCreateDemo={handleCreateFromDemo}
      // 订单 & 任务
      orderView={orderView}
      task={task}
      loadingTask={loadingTask}
      onReloadTask={handleReloadTask}
      // FEFO 批次
      batchRows={batchRows}
      batchesLoading={batchesLoading}
      batchesError={batchesError}
      activeItemId={activeItemId}
      activeWarehouseId={activeWarehouseId}
      recommendedBatchCode={recommendedBatchCode}
      onUseRecommendedBatch={handleUseRecommendedBatch}
      // diff
      diff={diff}
      // 扫码
      scanForm={scanForm}
      scanLoading={scanLoading}
      scanSuccess={scanSuccess}
      onChangeScanForm={updateScanForm}
      onSubmitScan={handleScanSubmit}
      // commit
      commitForm={commitForm}
      commitLoading={commitLoading}
      commitSuccess={commitSuccess}
      onChangeCommitForm={updateCommitForm}
      onSubmitCommit={handleCommitSubmit}
      onJumpTrace={handleJumpTrace}
      // 错误 & 结果
      error={error}
      commitResult={commitResult}
    />
  );
};
