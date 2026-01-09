// src/features/operations/inbound/useInboundCockpitController.ts
// =====================================================
//  Inbound Cockpit - 核心中控
// =====================================================

import { useMemo, useRef, useState } from "react";
import type { ParsedBarcode } from "../scan/barcodeParser";

import type { PurchaseOrderWithLines } from "../../purchase-orders/api";
import type {
  ReceiveTask,
  ReceiveTaskCreateFromPoSelectedLinePayload,
} from "../../receive-tasks/api";

import type {
  InboundCockpitController,
  InboundScanHistoryEntry,
  InboundManualDraftSummary,
} from "./types";

import { calcVariance } from "./cockpit/utils";
import { loadPoById as doLoadPoById } from "./cockpit/po";
import {
  internalLoadTask as doInternalLoadTask,
  bindTaskById as doBindTaskById,
  reloadTask as doReloadTask,
  createTaskFromPo as doCreateTaskFromPo,
  createTaskFromPoSelected as doCreateTaskFromPoSelected,
} from "./cockpit/task";
import {
  handleScan as doHandleScan,
  handleScanParsed as doHandleScanParsed,
} from "./cockpit/scan";
import { updateLineMeta as doUpdateLineMeta } from "./cockpit/lineMeta";
import { manualReceiveLine as doManualReceiveLine } from "./cockpit/manual";
import { commit as doCommit } from "./cockpit/commit";

const EMPTY_MANUAL_DRAFT: InboundManualDraftSummary = {
  dirty: false,
  touchedLines: 0,
  totalQty: 0,
};

export function useInboundCockpitController(): InboundCockpitController {
  const [poIdInput, setPoIdInput] = useState("");
  const [currentPo, setCurrentPo] = useState<PurchaseOrderWithLines | null>(null);
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
  const [activeItemId, setActiveItemId] = useState<number | null>(null);

  // ✅ 手工收货：未落地输入（草稿）摘要，用于 commit 前硬阻断
  const [manualDraft, setManualDraft] = useState<InboundManualDraftSummary>(
    EMPTY_MANUAL_DRAFT,
  );

  const varianceSummary = useMemo(() => calcVariance(currentTask), [currentTask]);

  // ========== PO ==========
  const poLoadSeqRef = useRef(0);

  async function loadPoById(poId?: string) {
    const input = String((poId ?? poIdInput) ?? "").trim();
    if (poId != null) {
      setPoIdInput(input);
    }

    const seq = ++poLoadSeqRef.current;
    const isLatest = () => seq === poLoadSeqRef.current;

    const guarded =
      <T,>(setter: (v: T) => void) =>
      (v: T) => {
        if (isLatest()) setter(v);
      };

    await doLoadPoById({
      poIdInput: input,
      setPoError: guarded(setPoError),
      setLoadingPo: guarded(setLoadingPo),
      setCurrentPo: guarded(setCurrentPo),
    });
  }

  // ========== 收货任务 ==========

  async function internalLoadTask(taskId: number) {
    await doInternalLoadTask({
      taskId,
      setLoadingTask,
      setTaskError,
      setCurrentTask,
      setCommitError,
      setActiveItemId,
    });

    // 任务切换/重新加载时，把手工草稿清空（避免把旧输入带到新任务）
    setManualDraft(EMPTY_MANUAL_DRAFT);
  }

  async function bindTaskById() {
    await doBindTaskById({
      taskIdInput,
      setTaskError,
      onLoad: internalLoadTask,
    });
  }

  async function reloadTask() {
    await doReloadTask({
      currentTask,
      onLoad: internalLoadTask,
    });
  }

  async function createTaskFromPo() {
    await doCreateTaskFromPo({
      currentPo,
      setCreatingTask,
      setTaskError,
      setCurrentTask,
      setTaskIdInput,
      setCommitError,
      setActiveItemId,
    });

    setManualDraft(EMPTY_MANUAL_DRAFT);
  }

  async function createTaskFromPoSelected(
    lines: ReceiveTaskCreateFromPoSelectedLinePayload[],
  ) {
    await doCreateTaskFromPoSelected({
      currentPo,
      selectedLines: lines,
      setCreatingTask,
      setTaskError,
      setCurrentTask,
      setTaskIdInput,
      setCommitError,
      setActiveItemId,
    });

    setManualDraft(EMPTY_MANUAL_DRAFT);
  }

  function endTaskSession() {
    // ✅ 解绑当前任务 + 清掉执行态残留（不影响当前采购单上下文）
    setCurrentTask(null);
    setTaskIdInput("");
    setTaskError(null);
    setLoadingTask(false);

    setCommitError(null);
    setActiveItemId(null);

    setLastParsed(null);
    setHistory([]);

    setManualDraft(EMPTY_MANUAL_DRAFT);
    setTraceId("");
  }

  // ========== 扫码 ==========

  function handleScan(barcode: string) {
    doHandleScan({
      barcode,
      setHistory,
    });
  }

  async function handleScanParsed(parsed: ParsedBarcode) {
    await doHandleScanParsed({
      parsed,
      currentTask,
      setLastParsed,
      setHistory,
      setCurrentTask,
      setActiveItemId,
      setTaskError,
      setCommitError,
    });

    // 扫码会直接更新 task.lines 的实收，不影响手工草稿
  }

  // ========== 行内批次元数据更新（批次/日期） ==========

  async function updateLineMeta(
    itemId: number,
    meta: { batch_code?: string; production_date?: string; expiry_date?: string },
  ): Promise<void> {
    await doUpdateLineMeta({
      itemId,
      meta,
      currentTask,
      setCurrentTask,
      setTaskError,
    });
  }

  // ========== 采购单行收货（手工录入） ==========

  async function manualReceiveLine(
    itemId: number,
    qty: number,
    meta?: { batch_code?: string; production_date?: string; expiry_date?: string },
  ): Promise<void> {
    await doManualReceiveLine({
      itemId,
      qty,
      meta,
      currentTask,
      setCurrentTask,
      setActiveItemId,
      setTaskError,
      setCommitError,
      setHistory,
    });

    // 单行/批量记录成功后，由手工模块主动清理输入并同步 manualDraft；
    // 这里不做推断，避免误清空。
  }

  // ========== commit ==========
  async function commit(): Promise<boolean> {
    return await doCommit({
      currentTask,
      traceId,
      setTraceId,
      setCommitting,
      setCommitError,
      setCurrentTask,
      setTaskError,
    });
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

    manualDraft,

    // setters
    setPoIdInput,
    setTaskIdInput,
    setTraceId,
    setActiveItemId,
    setManualDraft,

    // actions
    loadPoById,
    createTaskFromPo,
    createTaskFromPoSelected,
    bindTaskById,
    reloadTask,
    endTaskSession,

    handleScan,
    handleScanParsed,

    updateLineMeta,
    manualReceiveLine,
    commit,
  };
}
