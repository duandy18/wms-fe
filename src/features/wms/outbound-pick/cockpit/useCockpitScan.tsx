// src/features/wms/outbound-pick/cockpit/useCockpitScan.tsx

import { useEffect, useState } from "react";

import {
  probePickBarcode,
  type PickProbeRequest,
  type PickProbeResponse,
} from "../../scan/api";
import { parseScanBarcode } from "../../../wms/scan/core/richBarcodeParser";

import { scanPickTask, type PickTask } from "../pickTasksApi";
import type { ApiErrorShape, PickProbeResponseExtended } from "../types_cockpit";
import type { ItemBasic } from "../../../../domains/pms/public/contracts/itemBasic";

const NO_BATCH_CODE = "NOEXP";

function isBatchRequired(meta: ItemBasic | null): boolean {
  if (!meta) return false;

  const maybe = meta as unknown as {
    requires_batch?: unknown;
    has_shelf_life?: unknown;
  };
  if (typeof maybe.requires_batch === "boolean") return maybe.requires_batch;

  return maybe.has_shelf_life === true;
}

export function useCockpitScan(args: {
  selectedTask: PickTask | null;

  scanBatchOverride: string;
  setScanBatchOverride: (v: string) => void;

  activeItemMeta: ItemBasic | null;

  setActiveItemId: (id: number | null) => void;
  loadTaskDetail: (taskId: number) => Promise<void>;

  navigateToBarcodeBind: (barcode: string) => void;
}) {
  const {
    selectedTask,
    scanBatchOverride,
    setScanBatchOverride,
    activeItemMeta,
    setActiveItemId,
    loadTaskDetail,
    navigateToBarcodeBind,
  } = args;

  const [scanBusy, setScanBusy] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);

  const [scanQty, setScanQty] = useState<number>(1);

  const [scanPreview, setScanPreview] = useState<{
    item_id: number;
    batch_code: string | null;
    qty: number;
  } | null>(null);

  useEffect(() => {
    if (!scanSuccess) return;
    const timer = setTimeout(() => setScanSuccess(false), 1500);
    return () => clearTimeout(timer);
  }, [scanSuccess]);

  const handleScan = async (barcode: string) => {
    if (!selectedTask) {
      setScanError("请先在左侧选择一个拣货任务");
      return;
    }

    const raw = barcode.trim();
    if (!raw) return;

    setScanError(null);
    setScanSuccess(false);
    setScanBusy(true);

    let currentItemId: number | null = null;

    try {
      const parsedLocal = parseScanBarcode(raw);

      const qtyCandidateFromBarcode = parsedLocal.qty;
      const effectiveQty =
        scanQty && scanQty > 0
          ? scanQty
          : qtyCandidateFromBarcode && qtyCandidateFromBarcode > 0
            ? qtyCandidateFromBarcode
            : 1;

      const parsedBatch = (parsedLocal.batch_code ?? "").trim();
      const overrideBatch = scanBatchOverride.trim();
      let finalBatch = (parsedBatch || overrideBatch).trim();

      const probeReq: PickProbeRequest = {
        warehouse_id: selectedTask.warehouse_id,
        barcode: raw,
        qty: effectiveQty,
        ctx: { device_id: "pick-task-cockpit" },
      };

      let resp: PickProbeResponse;
      try {
        resp = await probePickBarcode(probeReq);
      } catch (e) {
        const ee = e as ApiErrorShape;
        console.error("probePickBarcode failed:", ee);
        throw new Error(ee?.message ?? "扫描失败：pick probe 解析条码出错");
      }

      const extended = resp as PickProbeResponseExtended;
      const itemId = extended.item_id ?? 0;
      currentItemId = itemId;

      if (!itemId || itemId <= 0) {
        const msg = `条码 ${raw} 未能解析出有效商品，请在条码管理中完成绑定后再试。`;
        setScanError(msg);
        navigateToBarcodeBind(raw);
        return;
      }

      setActiveItemId(itemId);

      const batchRequired = isBatchRequired(activeItemMeta);

      if (batchRequired) {
        if (!finalBatch) {
          throw new Error("该商品为批次受控：条码不带批次时，必须在下方输入批次号后再扫码。");
        }
      } else {
        if (!finalBatch) {
          finalBatch = NO_BATCH_CODE;
        }
      }

      setScanPreview({
        item_id: itemId || 0,
        batch_code: finalBatch || null,
        qty: effectiveQty,
      });

      await scanPickTask(selectedTask.id, {
        item_id: itemId,
        qty: effectiveQty,
        batch_code: finalBatch,
      });

      await loadTaskDetail(selectedTask.id);

      setScanSuccess(true);
    } catch (err: unknown) {
      const e = err as ApiErrorShape;
      console.error("scanPickTask with barcode failed:", e);
      setScanError(e?.message ?? "扫码拣货失败");
      setScanSuccess(false);

      if (currentItemId) {
        setActiveItemId(currentItemId);
      }

      throw err;
    } finally {
      setScanBusy(false);
    }
  };

  function reset() {
    setScanBusy(false);
    setScanError(null);
    setScanSuccess(false);
    setScanPreview(null);
    setScanQty(1);
    setScanBatchOverride("");
  }

  return {
    scanBusy,
    scanError,
    scanSuccess,

    scanQty,
    setScanQty,

    scanPreview,
    handleScan,

    reset,
  };
}
