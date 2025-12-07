// src/features/dev/inbound/useDevInboundController.ts
// ======================================================================
//  Inbound Debug Panel - 核心中控 Orchestrator（v2）
//  - Demo 采购单 + 收货任务
//  - 从 PO/ORDER 创建收货任务
//  - 扫码 → recordReceiveScan（含批次 + 日期）
//  - commit → InboundService.receive → Ledger/Stocks
//  - commit 后自动拉 Trace / Ledger / Snapshot 情报
// ======================================================================

import { useMemo, useState } from "react";
import type { ParsedBarcode } from "../../operations/scan/barcodeParser";

import {
  fetchPurchaseOrderV2,
  createDemoPurchaseOrder,
  type PurchaseOrderWithLines,
} from "../../purchase-orders/api";

import {
  fetchReceiveTask,
  recordReceiveScan,
  commitReceiveTask,
  createReceiveTaskFromPo,
  createReceiveTaskDemoFromPo,
  type ReceiveTask,
} from "../../receive-tasks/api";

import { fetchLedgerList } from "../../diagnostics/ledger-tool/api";
import { fetchItemDetail } from "../../inventory/snapshot/api";
import { apiGet } from "../../../lib/api";

import {
  type DevInboundController,
  type InboundScanHistoryEntry,
  type InboundVarianceSummary,
  type InboundPostCommitInfo,
  type InboundDemoScenario,
} from "./types";
import type { TraceEvent } from "../../diagnostics/trace/types";
import type { LedgerRow } from "../../diagnostics/ledger-tool/types";
import type { SnapshotRow } from "../../inventory/snapshot/types";

let nextHistoryId = 1;
const fmt = (d: Date) => d.toISOString().replace("T", " ").slice(0, 19);

// 扩展 ParsedBarcode，增加日期字段
type ParsedBarcodeWithDates = ParsedBarcode & {
  production_date?: string | null;
  expiry_date?: string | null;
};

type TraceDebugResponse = {
  events: TraceEvent[];
};

type LedgerList = {
  items: LedgerRow[];
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "未知错误";
  }
};

function calcVariance(task: ReceiveTask | null): InboundVarianceSummary {
  if (!task) return { totalExpected: 0, totalScanned: 0, totalVariance: 0 };

  let expected = 0;
  let scanned = 0;

  for (const l of task.lines) {
    scanned += l.scanned_qty;
    if (l.expected_qty != null) expected += l.expected_qty;
  }

  return {
    totalExpected: expected,
    totalScanned: scanned,
    totalVariance: scanned - expected,
  };
}

export function useDevInboundController(): DevInboundController {
  const [poIdInput, setPoIdInput] = useState("");
  const [currentPo, setCurrentPo] = useState<PurchaseOrderWithLines | null>(
    null,
  );
  const [loadingPo, setLoadingPo] = useState(false);
  const [poError, setPoError] = useState<string | null>(null);

  const [taskIdInput, setTaskIdInput] = useState("");
  const [currentTask, setCurrentTask] = useState<ReceiveTask | null>(null);
  const [loadingTask, setLoadingTask] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);
  const [creatingTask, setCreatingTask] = useState(false);

  const [lastParsed, setLastParsed] = useState<ParsedBarcode | null>(null);
  const [history, setHistory] = useState<InboundScanHistoryEntry[]>([]);

  const [committing, setCommitting] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);

  const [traceId, setTraceId] = useState("");

  const varianceSummary = useMemo(
    () => calcVariance(currentTask),
    [currentTask],
  );

  const [postCommit, setPostCommit] = useState<InboundPostCommitInfo | null>(
    null,
  );
  const [loadingPostCommit, setLoadingPostCommit] = useState(false);

  // ===== PO =====
  async function loadPoById() {
    const raw = poIdInput.trim();
    if (!raw) {
      setPoError("请输入采购单 ID");
      return;
    }
    const id = Number(raw);
    if (!Number.isFinite(id) || id <= 0) {
      setPoError("采购单 ID 必须为正整数");
      return;
    }

    setLoadingPo(true);
    setPoError(null);
    try {
      const po = await fetchPurchaseOrderV2(id);
      setCurrentPo(po);
    } catch (err: unknown) {
      console.error("fetchPurchaseOrderV2 error", err);
      setCurrentPo(null);
      setPoError(getErrorMessage(err) || "加载采购单失败");
    } finally {
      setLoadingPo(false);
    }
  }

  // ===== 收货任务：加载/绑定/创建 =====
  async function internalLoadTask(taskId: number) {
    setLoadingTask(true);
    setTaskError(null);
    try {
      const t = await fetchReceiveTask(taskId);
      setCurrentTask(t);
      setCommitError(null);
      setPostCommit(null);
    } catch (err: unknown) {
      console.error("fetchReceiveTask error", err);
      setCurrentTask(null);
      setTaskError(getErrorMessage(err) || "加载收货任务失败");
    } finally {
      setLoadingTask(false);
    }
  }

  async function bindTaskById() {
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
    await internalLoadTask(id);
  }

  async function reloadTask() {
    if (currentTask) {
      await internalLoadTask(currentTask.id);
    }
  }

  async function createTaskFromPo() {
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
      setPostCommit(null);
    } catch (err: unknown) {
      console.error("createReceiveTaskFromPo failed", err);
      setTaskError(
        getErrorMessage(err) || "从采购单创建收货任务失败",
      );
    } finally {
      setCreatingTask(false);
    }
  }

  // Dev：基于当前 PO 生成 demo 收货任务（修改 scanned_qty）
  async function createDemoTask(scenario: InboundDemoScenario) {
    if (!currentPo) {
      setTaskError("请先加载采购单，再生成 Demo 任务。");
      return;
    }
    const poId = currentPo.id;

    setCreatingTask(true);
    setTaskError(null);
    try {
      const task = await createReceiveTaskDemoFromPo(poId, scenario);
      setCurrentTask(task);
      setTaskIdInput(String(task.id));
      setCommitError(null);
      setPostCommit(null);
    } catch (err: unknown) {
      console.error("createReceiveTaskDemoFromPo failed", err);
      setTaskError(getErrorMessage(err) || "生成 Demo 收货任务失败");
    } finally {
      setCreatingTask(false);
    }
  }

  // Dev：一键 demo PO + “干净的”收货任务（scanned_qty 全 0）
  async function createDemoPoAndTask() {
    setCreatingTask(true);
    setPoError(null);
    setTaskError(null);
    try {
      // 1) 创建 demo 采购单
      const po = await createDemoPurchaseOrder();
      setCurrentPo(po);
      setPoIdInput(String(po.id));

      // 2) 基于该 PO 创建收货任务（expected 有值，scanned 全 0）
      const task = await createReceiveTaskFromPo(po.id, {
        warehouse_id: po.warehouse_id,
        include_fully_received: false,
      });
      setCurrentTask(task);
      setTaskIdInput(String(task.id));

      setCommitError(null);
      setPostCommit(null);
    } catch (err: unknown) {
      console.error("createDemoPoAndTask failed", err);
      setTaskError(
        getErrorMessage(err) || "生成 Demo 采购单 + 收货任务失败",
      );
    } finally {
      setCreatingTask(false);
    }
  }

  // ===== 扫码 =====
  function handleScan(barcode: string) {
    const now = new Date();
    const entry: InboundScanHistoryEntry = {
      id: nextHistoryId++,
      ts: fmt(now),
      barcode,
      item_id: null,
      qty: 0,
      ok: false,
      error: "等待解析条码",
    };
    setHistory((prev) => [entry, ...prev].slice(0, 100));
  }

  async function handleScanParsed(parsed: ParsedBarcode) {
    setLastParsed(parsed);

    if (!currentTask) {
      setTaskError("请先绑定收货任务");
      return;
    }
    if (currentTask.status === "COMMITTED") {
      setTaskError("任务已 COMMITTED，不能继续扫码");
      return;
    }

    const parsedWithDates = parsed as ParsedBarcodeWithDates;

    const now = new Date();
    const histId = nextHistoryId++;
    const itemId = parsed.item_id ?? null;
    const qty = parsed.qty ?? 1;
    const barcode = parsed.raw ?? "";

    if (!itemId || itemId <= 0) {
      const entry: InboundScanHistoryEntry = {
        id: histId,
        ts: fmt(now),
        barcode,
        item_id: null,
        qty,
        ok: false,
        error: "条码中缺少 item_id",
      };
      setHistory((prev) => [entry, ...prev].slice(0, 100));

      setTaskError("条码中缺少 item_id");
      return;
    }

    const batch_code = parsed.batch_code ?? undefined;
    const production_date = parsedWithDates.production_date ?? undefined;
    const expiry_date = parsedWithDates.expiry_date ?? undefined;

    try {
      const updated = await recordReceiveScan(currentTask.id, {
        item_id: itemId,
        qty,
        batch_code,
        production_date,
        expiry_date,
      });
      setCurrentTask(updated);

      const entry: InboundScanHistoryEntry = {
        id: histId,
        ts: fmt(now),
        barcode,
        item_id: itemId,
        qty,
        ok: true,
      };
      setHistory((prev) => [entry, ...prev].slice(0, 100));
    } catch (err: unknown) {
      console.error("recordReceiveScan failed", err);
      const msg = getErrorMessage(err) || "扫码失败";

      const entry: InboundScanHistoryEntry = {
        id: histId,
        ts: fmt(now),
        barcode,
        item_id: itemId,
        qty,
        ok: false,
        error: msg,
      };
      setHistory((prev) => [entry, ...prev].slice(0, 100));

      setTaskError(msg);
    }
  }

  // ===== commit + post-commit（Trace / Ledger / Snapshot） =====
  async function commit() {
    if (!currentTask) {
      setCommitError("请先绑定任务");
      return;
    }
    if (currentTask.status === "COMMITTED") {
      setCommitError("任务已 COMMITTED");
      return;
    }

    const finalTraceId =
      traceId && traceId.trim()
        ? traceId.trim()
        : `inbound:${currentTask.id}:${Date.now()}`;
    setTraceId(finalTraceId);

    setCommitting(true);
    setCommitError(null);

    try {
      const updated = await commitReceiveTask(currentTask.id, {
        trace_id: finalTraceId,
      });

      setCurrentTask(updated);
      await loadPostCommit(finalTraceId, updated);
    } catch (err: unknown) {
      console.error("commitReceiveTask failed", err);
      setCommitError(getErrorMessage(err) || "commit 失败");
    } finally {
      setCommitting(false);
    }
  }

  async function loadPostCommit(trace_id: string, task: ReceiveTask) {
    setLoadingPostCommit(true);
    try {
      const traceResp = await apiGet<TraceDebugResponse>(
        `/debug/trace/${encodeURIComponent(trace_id)}`,
      );
      const traceEvents = traceResp?.events ?? [];

      let ledgerRows: LedgerRow[] = [];
      try {
        const ledgerList = (await fetchLedgerList({
          trace_id,
          limit: 100,
          offset: 0,
        })) as LedgerList;
        ledgerRows = ledgerList.items ?? [];
      } catch (err: unknown) {
        console.error("loadPostCommit: fetchLedgerList failed", err);
      }

      let snapshot: SnapshotRow | null = null;
      try {
        if (task.lines && task.lines.length > 0) {
          const itemId = task.lines[0].item_id;
          snapshot = await fetchItemDetail(itemId, "MAIN");
        }
      } catch (err: unknown) {
        console.error("loadPostCommit: fetchItemDetail failed", err);
      }

      const info: InboundPostCommitInfo = {
        traceEvents,
        ledgerRows,
        snapshot,
      };

      setPostCommit(info);
    } catch (err: unknown) {
      console.error("loadPostCommit(trace) error", err);
    } finally {
      setLoadingPostCommit(false);
    }
  }

  return {
    poIdInput,
    currentPo,
    loadingPo,
    poError,

    taskIdInput,
    currentTask,
    loadingTask,
    creatingTask,
    taskError,

    lastParsed,
    history,

    committing,
    commitError,
    traceId,

    varianceSummary,

    postCommit,
    loadingPostCommit,

    setPoIdInput,
    setTaskIdInput,
    setTraceId,

    loadPoById,
    createTaskFromPo,
    bindTaskById,
    reloadTask,

    createDemoTask,
    createDemoPoAndTask,

    handleScan,
    handleScanParsed,

    commit,
  };
}
