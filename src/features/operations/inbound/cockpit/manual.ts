// src/features/operations/inbound/cockpit/manual.ts

import { recordReceiveScan, type ReceiveTask } from "../../../receive-tasks/api";
import type { InboundScanHistoryEntry } from "../types";
import { allocHistoryId, fmt, getErrMsg } from "./utils";

export async function manualReceiveLine(args: {
  itemId: number;
  qty: number;
  meta?: { batch_code?: string; production_date?: string; expiry_date?: string };

  currentTask: ReceiveTask | null;
  setCurrentTask: (v: ReceiveTask | null) => void;
  setActiveItemId: (v: number | null) => void;
  setTaskError: (v: string | null) => void;
  setCommitError: (v: string | null) => void;

  setHistory: (updater: (prev: InboundScanHistoryEntry[]) => InboundScanHistoryEntry[]) => void;
}) {
  const {
    itemId,
    qty,
    meta,
    currentTask,
    setCurrentTask,
    setActiveItemId,
    setTaskError,
    setCommitError,
    setHistory,
  } = args;

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

  const line = currentTask.lines.find((l) => l.item_id === itemId);
  if (!line) {
    setTaskError(`当前任务中不存在 item_id=${itemId} 的行，无法直接按行收货`);
    return;
  }

  const batch_code = meta?.batch_code !== undefined ? meta.batch_code : line.batch_code;
  const production_date =
    meta?.production_date !== undefined ? meta.production_date : line.production_date ?? undefined;
  const expiry_date =
    meta?.expiry_date !== undefined ? meta.expiry_date : line.expiry_date ?? undefined;

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
    setTaskError(null);
    setCommitError(null);

    const now = new Date();
    const entry: InboundScanHistoryEntry = {
      id: allocHistoryId(),
      ts: fmt(now),
      barcode: "MANUAL-LINE",
      item_id: itemId,
      qty,
      ok: true,
    };
    setHistory((prev) => [entry, ...prev].slice(0, 100));
  } catch (err: unknown) {
    console.error("manualReceiveLine failed", err);
    const msg = getErrMsg(err, "按行收货失败");
    setTaskError(msg);

    const now = new Date();
    const entry: InboundScanHistoryEntry = {
      id: allocHistoryId(),
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
