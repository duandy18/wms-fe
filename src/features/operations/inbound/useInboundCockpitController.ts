// src/features/operations/inbound/useInboundCockpitController.ts
// =====================================================
//  Inbound Cockpit - 核心中控
// =====================================================

import { useMemo, useState } from "react";
import type { ParsedBarcode } from "../scan/barcodeParser";

import {
  fetchPurchaseOrderV2,
  type PurchaseOrderWithLines,
} from "../../purchase-orders/api";

import {
  fetchReceiveTask,
  recordReceiveScan,
  commitReceiveTask,
  createReceiveTaskFromPo,
  type ReceiveTask,
} from "../../receive-tasks/api";

import type {
  InboundCockpitController,
  InboundScanHistoryEntry,
  InboundVarianceSummary,
} from "./types";

let nextHistoryId = 1;

const fmt = (d: Date) => d.toISOString().replace("T", " ").slice(0, 19);

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

type ApiErrorShape = {
  message?: string;
};

export function useInboundCockpitController(): InboundCockpitController {
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

  // Cockpit 的 trace_id：提交时写入后台，便于 Trace / Ledger 聚合
  const [traceId, setTraceId] = useState("");

  // 当前高亮 item（最近一次成功 recordReceiveScan 的行）
  const [activeItemId, setActiveItemId] = useState<number | null>(null);

  const varianceSummary = useMemo(
    () => calcVariance(currentTask),
    [currentTask],
  );

  // ========== PO ==========

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
      const e = err as ApiErrorShape;
      console.error("fetchPurchaseOrderV2 error", e);
      setCurrentPo(null);
      setPoError(e?.message ?? "加载采购单失败");
    } finally {
      setLoadingPo(false);
    }
  }

  // ========== 收货任务 ==========

  async function internalLoadTask(taskId: number) {
    setLoadingTask(true);
    setTaskError(null);
    try {
      const t = await fetchReceiveTask(taskId);
      setCurrentTask(t);
      setCommitError(null);
      setActiveItemId(null);
    } catch (err: unknown) {
      const e = err as ApiErrorShape;
      console.error("fetchReceiveTask error", e);
      setCurrentTask(null);
      setTaskError(e?.message ?? "加载收货任务失败");
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
      setActiveItemId(null);
    } catch (err: unknown) {
      const e = err as ApiErrorShape;
      console.error("createReceiveTaskFromPo failed", e);
      setTaskError(e?.message ?? "从采购单创建收货任务失败");
    } finally {
      setCreatingTask(false);
    }
  }

  // ========== 扫码 ==========

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

    // 从解析结果中提取批次 / 日期（如果有）
    const batch_code = parsed.batch_code;
    const production_date = parsed.production_date;
    const expiry_date = parsed.expiry_date;

    try {
      const updated = await recordReceiveScan(currentTask.id, {
        item_id: itemId,
        qty,
        batch_code: batch_code ?? undefined,
        production_date: production_date ?? undefined,
        expiry_date: expiry_date ?? undefined,
      });
      setCurrentTask(updated);
      setActiveItemId(itemId);

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
      const e = err as ApiErrorShape;
      console.error("recordReceiveScan failed", e);
      const msg = e?.message ?? "扫码失败";

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

  // ========== 行内批次元数据更新 ==========

  async function updateLineMeta(
    itemId: number,
    meta: {
      batch_code?: string;
      production_date?: string;
      expiry_date?: string;
    },
  ): Promise<void> {
    if (!currentTask) {
      setTaskError("请先绑定收货任务");
      return;
    }
    if (currentTask.status === "COMMITTED") {
      setTaskError("任务已 COMMITTED，不能修改批次信息");
      return;
    }

    try {
      const updated = await recordReceiveScan(currentTask.id, {
        item_id: itemId,
        qty: 0, // 仅更新元数据，后端允许 qty=0 时更新批次/日期
        batch_code: meta.batch_code,
        production_date: meta.production_date,
        expiry_date: meta.expiry_date,
      });
      setCurrentTask(updated);
    } catch (err: unknown) {
      const e = err as ApiErrorShape;
      console.error("updateLineMeta (recordReceiveScan) failed", e);
      setTaskError(e?.message ?? "更新批次信息失败");
    }
  }

  // ========== 采购单行收货（手工录入） ==========

  async function manualReceiveLine(
    itemId: number,
    qty: number,
    meta?: {
      batch_code?: string;
      production_date?: string;
      expiry_date?: string;
    },
  ): Promise<void> {
    if (!currentTask) {
      setTaskError("请先绑定收货任务");
      return;
    }
    if (currentTask.status === "COMMITTED") {
      setTaskError("任务已 COMMITTED，不能继续收货");
      return;
    }
    if (!qty || qty <= 0) {
      setTaskError("本次收货数量必须大于 0");
      return;
    }

    // 找到对应行，若 meta 缺失则从行里兜底
    const line = currentTask.lines.find((l) => l.item_id === itemId);
    if (!line) {
      setTaskError(`当前任务中不存在 item_id=${itemId} 的行，无法直接按行收货`);
      return;
    }

    const batch_code =
      meta?.batch_code !== undefined ? meta.batch_code : line.batch_code;
    const production_date =
      meta?.production_date !== undefined
        ? meta.production_date
        : line.production_date ?? undefined;
    const expiry_date =
      meta?.expiry_date !== undefined
        ? meta.expiry_date
        : line.expiry_date ?? undefined;

    try {
      const updated = await recordReceiveScan(currentTask.id, {
        item_id: itemId,
        qty,
        batch_code: batch_code ?? undefined,
        production_date,
        expiry_date,
      });
      setCurrentTask(updated);
      setActiveItemId(itemId);

      const now = new Date();
      const histId = nextHistoryId++;
      const entry: InboundScanHistoryEntry = {
        id: histId,
        ts: fmt(now),
        barcode: "MANUAL-LINE",
        item_id: itemId,
        qty,
        ok: true,
      };
      setHistory((prev) => [entry, ...prev].slice(0, 100));
    } catch (err: unknown) {
      const e = err as ApiErrorShape;
      console.error("manualReceiveLine failed", e);
      const msg = e?.message ?? "按行收货失败";
      setTaskError(msg);

      const now = new Date();
      const histId = nextHistoryId++;
      const entry: InboundScanHistoryEntry = {
        id: histId,
        ts: fmt(now),
        barcode: "MANUAL-LINE",
        item_id: itemId,
        qty,
        ok: false,
        error: msg,
      };
      setHistory((prev) => [entry, ...prev].slice(0, 100));
    }
  }

  // ========== commit ==========

  async function commit(): Promise<boolean> {
    if (!currentTask) {
      setCommitError("请先绑定任务");
      return false;
    }
    if (currentTask.status === "COMMITTED") {
      setCommitError("任务已 COMMITTED");
      return false;
    }

    // ★ 提交前强校验：任何 scanned_qty != 0 的行，必须有 batch_code 和(生产或到期日期)
    const badLine = currentTask.lines.find((l) => {
      if (!l.scanned_qty || l.scanned_qty === 0) return false;
      const noBatch = !l.batch_code || !l.batch_code.trim();
      const noDates = !l.production_date && !l.expiry_date;
      return noBatch || noDates;
    });

    if (badLine) {
      const msg = `行 item_id=${badLine.item_id}（${
        badLine.item_name ?? "-"
      }）已存在实收数量，但批次或生产/到期日期信息不完整，请先在“收货明细 → 编辑批次/日期”中补全后再提交。`;
      setCommitError(msg);
      return false;
    }

    const finalTraceId =
      traceId && traceId.trim()
        ? traceId.trim()
        : `inbound:cockpit:${currentTask.id}:${Date.now()}`;
    setTraceId(finalTraceId);

    setCommitting(true);
    setCommitError(null);

    try {
      const updated = await commitReceiveTask(currentTask.id, {
        trace_id: finalTraceId,
      });
      setCurrentTask(updated);
      return true;
    } catch (err: unknown) {
      const e = err as ApiErrorShape;
      console.error("commitReceiveTask failed", e);
      setCommitError(e?.message ?? "确认入库失败");
      return false;
    } finally {
      setCommitting(false);
    }
  }

  return {
    // state
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

    varianceSummary,

    traceId,
    activeItemId,

    // setters
    setPoIdInput,
    setTaskIdInput,
    setTraceId,
    setActiveItemId,

    // actions
    loadPoById,
    createTaskFromPo,
    bindTaskById,
    reloadTask,

    handleScan,
    handleScanParsed,

    updateLineMeta,
    manualReceiveLine,
    commit,
  };
}
