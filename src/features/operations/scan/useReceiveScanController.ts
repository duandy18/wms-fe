// src/features/operations/scan/useReceiveScanController.ts
//
// 中控：收货任务 + 扫码控制器
// - 负责绑定收货任务（/receive-tasks/{id}）
// - 负责根据条码解析结果调 /receive-tasks/{id}/scan
// - 维护 history / lastParsed / varianceSummary 等状态

import { useEffect, useMemo, useState } from "react";
import type { ParsedBarcode } from "./barcodeParser";
import {
  fetchReceiveTask,
  recordReceiveScan,
  type ReceiveTask,
} from "../../receive-tasks/api";

export interface ScanHistoryEntry {
  id: number;
  ts: string;
  barcode: string;
  item_id: number | null;
  qty: number;
  ok: boolean;
  error?: string | null;
}

export interface VarianceSummary {
  totalExpected: number;
  totalScanned: number;
  totalVariance: number;
}

let nextHistoryId = 1;

const formatTs = (ts: Date) =>
  ts.toISOString().replace("T", " ").slice(0, 19);

type ApiErrorShape = {
  message?: string;
};

// 扩展 ParsedBarcode，让 TS 知道 production_date / expiry_date 这些字段可能存在
type ParsedBarcodeWithDates = ParsedBarcode & {
  production_date?: string | null;
  expiry_date?: string | null;
};

export function useReceiveScanController() {
  // 收货任务 & 绑定状态
  const [taskIdInput, setTaskIdInput] = useState("");
  const [task, setTask] = useState<ReceiveTask | null>(null);
  const [loadingTask, setLoadingTask] = useState(false);
  const [bindingError, setBindingError] = useState<string | null>(null);
  const [taskError, setTaskError] = useState<string | null>(null);

  // 最近一次解析结果 & 扫码历史
  const [lastParsed, setLastParsed] = useState<ParsedBarcode | null>(
    null,
  );
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);

  const boundTaskId = useMemo(
    () => (task ? task.id : null),
    [task],
  );

  const isTaskCommitted = task?.status === "COMMITTED";

  const varianceSummary: VarianceSummary = useMemo(() => {
    if (!task) {
      return {
        totalExpected: 0,
        totalScanned: 0,
        totalVariance: 0,
      };
    }
    let totalExpected = 0;
    let totalScanned = 0;
    for (const l of task.lines) {
      totalScanned += l.scanned_qty;
      if (l.expected_qty != null) {
        totalExpected += l.expected_qty;
      }
    }
    return {
      totalExpected,
      totalScanned,
      totalVariance: totalScanned - totalExpected,
    };
  }, [task]);

  // 用任务 ID 绑定（供下拉 / 外部调用）
  const bindTaskById = async (taskId: number) => {
    if (!taskId || taskId <= 0) {
      setBindingError("收货任务 ID 必须为正整数");
      return;
    }
    setLoadingTask(true);
    setBindingError(null);
    setTaskError(null);
    try {
      const t = await fetchReceiveTask(taskId);
      setTask(t);
    } catch (err: unknown) {
      const e = err as ApiErrorShape;
      console.error("fetchReceiveTask failed", e);
      setTask(null);
      setTaskError(e?.message ?? "加载收货任务失败");
    } finally {
      setLoadingTask(false);
    }
  };

  // 基于输入框的绑定（旧逻辑，内部调用 bindTaskById）
  const bindTask = async () => {
    const trimmed = taskIdInput.trim();
    if (!trimmed) {
      setBindingError("请先输入收货任务 ID");
      return;
    }
    const n = Number(trimmed);
    if (!Number.isFinite(n) || n <= 0) {
      setBindingError("收货任务 ID 必须为正整数");
      return;
    }
    await bindTaskById(n);
  };

  // 扫码台 onScan：记录原始条码骨架
  const handleScan = (barcode: string) => {
    const now = new Date();
    setHistory((prev) => [
      {
        id: nextHistoryId++,
        ts: formatTs(now),
        barcode,
        item_id: null,
        qty: 0,
        ok: false,
        error: "等待解析条码",
      },
      ...prev,
    ]);
  };

  // 扫码台 onScanParsed：根据解析结果调用 /receive-tasks/{id}/scan
  const handleScanParsed = async (parsed: ParsedBarcode) => {
    setLastParsed(parsed);

    if (!task || !boundTaskId) {
      setTaskError("请先绑定收货任务 ID，然后再扫码收货。");
      return;
    }
    if (isTaskCommitted) {
      setTaskError("该收货任务已 COMMITTED，不能继续扫码。");
      return;
    }

    const now = new Date();
    const histId = nextHistoryId++;

    const itemId = parsed.item_id ?? null;
    const qty = parsed.qty ?? 1;

    if (!itemId || itemId <= 0) {
      setHistory((prev) => [
        {
          id: histId,
          ts: formatTs(now),
          barcode: parsed.raw ?? "",
          item_id: null,
          qty,
          ok: false,
          error: "条码中未解析出有效 item_id",
        },
        ...prev,
      ]);
      setTaskError("条码中未解析出有效 item_id，无法记入收货任务。");
      return;
    }

    const parsedWithDates = parsed as ParsedBarcodeWithDates;

    const batch_code = parsed.batch_code ?? undefined;
    const production_date = parsedWithDates.production_date ?? undefined;
    const expiry_date = parsedWithDates.expiry_date ?? undefined;

    try {
      const updated = await recordReceiveScan(boundTaskId, {
        item_id: itemId,
        qty,
        batch_code,
        production_date,
        expiry_date,
      });
      setTask(updated);
      setTaskError(null);
      setHistory((prev) => [
        {
          id: histId,
          ts: formatTs(now),
          barcode: parsed.raw ?? "",
          item_id: itemId,
          qty,
          ok: true,
        },
        ...prev,
      ]);
    } catch (err: unknown) {
      const e = err as ApiErrorShape;
      console.error("recordReceiveScan failed", e);
      const msg = e?.message ?? "扫码收货失败";
      setTaskError(msg);
      setHistory((prev) => [
        {
          id: histId,
          ts: formatTs(now),
          barcode: parsed.raw ?? "",
          item_id: itemId,
          qty,
          ok: false,
          error: msg,
        },
        ...prev,
      ]);
    }
  };

  // 支持 URL 上挂 task_id 查询参数，作为默认选中值
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tid = params.get("task_id");
    if (tid) {
      setTaskIdInput(tid);
    }
  }, []);

  return {
    // 状态
    task,
    taskIdInput,
    loadingTask,
    bindingError,
    taskError,
    history,
    lastParsed,
    varianceSummary,
    isTaskCommitted,

    // 动作
    setTaskIdInput,
    bindTask,
    bindTaskById,
    handleScan,
    handleScanParsed,
  };
}
