// src/features/operations/inbound/cockpit/scan.ts

import type { ParsedBarcode } from "../../scan/barcodeParser";
import { recordReceiveScan, type ReceiveTask } from "../../../receive-tasks/api";
import type { InboundScanHistoryEntry } from "../types";
import { allocHistoryId, fmt, getErrMsg } from "./utils";

export function handleScan(args: {
  barcode: string;
  setHistory: (updater: (prev: InboundScanHistoryEntry[]) => InboundScanHistoryEntry[]) => void;
}) {
  const { barcode, setHistory } = args;

  const now = new Date();
  const entry: InboundScanHistoryEntry = {
    id: allocHistoryId(),
    ts: fmt(now),
    barcode,
    item_id: null,
    qty: 0,
    ok: false,
    error: "等待解析条码",
  };
  setHistory((prev) => [entry, ...prev].slice(0, 100));
}

export async function handleScanParsed(args: {
  parsed: ParsedBarcode;
  currentTask: ReceiveTask | null;
  setLastParsed: (v: ParsedBarcode | null) => void;
  setHistory: (updater: (prev: InboundScanHistoryEntry[]) => InboundScanHistoryEntry[]) => void;

  setCurrentTask: (v: ReceiveTask | null) => void;
  setActiveItemId: (v: number | null) => void;

  setTaskError: (v: string | null) => void;
  setCommitError: (v: string | null) => void;
}) {
  const {
    parsed,
    currentTask,
    setLastParsed,
    setHistory,
    setCurrentTask,
    setActiveItemId,
    setTaskError,
    setCommitError,
  } = args;

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
  const histId = allocHistoryId();
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
    setTaskError(null);
    setCommitError(null);

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
    const msg = getErrMsg(err, "扫码失败");

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
