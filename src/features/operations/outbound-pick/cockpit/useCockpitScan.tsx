// src/features/operations/outbound-pick/cockpit/useCockpitScan.tsx

import { useEffect, useState } from "react";

import { scanPickV2, type ScanRequest, type ScanResponse } from "../../scan/api";
import { parseScanBarcode } from "../../scan/barcodeParser";

import { scanPickTask, type PickTask } from "../pickTasksApi";
import type { ApiErrorShape, ScanResponseExtended } from "../types_cockpit";

export function useCockpitScan(args: {
  selectedTask: PickTask | null;

  scanBatchOverride: string;
  setScanBatchOverride: (v: string) => void;

  activeItemMeta: unknown | null;

  setActiveItemId: (id: number | null) => void;
  loadTaskDetail: (taskId: number) => Promise<void>;

  navigateToBarcodeBind: (barcode: string) => void;
}) {
  const {
    selectedTask,
    scanBatchOverride,
    setScanBatchOverride,
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
    batch_code: string;
    qty: number;
  } | null>(null);

  // ---------------- 自动清除扫码成功提示 ----------------
  useEffect(() => {
    if (!scanSuccess) return;
    const timer = setTimeout(() => setScanSuccess(false), 1500);
    return () => clearTimeout(timer);
  }, [scanSuccess]);

  // ---------------- 扫码拣货（条码驱动版） ----------------
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
      // 1）本地 parse 只用来拿候选 qty + 批次，不再负责 item_id
      const parsedLocal = parseScanBarcode(raw);

      const qtyCandidateFromBarcode = parsedLocal.qty;
      const effectiveQty =
        scanQty && scanQty > 0
          ? scanQty
          : qtyCandidateFromBarcode && qtyCandidateFromBarcode > 0
          ? qtyCandidateFromBarcode
          : 1;

      const parsedBatch = parsedLocal.batch_code ?? "";
      const overrideBatch = scanBatchOverride.trim();
      const finalBatch = parsedBatch || overrideBatch;

      // 2）调用 /scan(mode=pick, probe=true)，让后端根据条码主数据解析 item_id
      const probeReq: ScanRequest = {
        mode: "pick",
        warehouse_id: selectedTask.warehouse_id,
        barcode: raw,
        qty: effectiveQty,
        probe: true,
        ctx: { device_id: "pick-task-cockpit" },
      };

      let resp: ScanResponse;
      try {
        resp = await scanPickV2(probeReq);
      } catch (e) {
        const ee = e as ApiErrorShape;
        console.error("scanPickV2(probe) failed:", ee);
        throw new Error(ee?.message ?? "扫描失败：/scan pick 解析条码出错（probe）");
      }

      const extended = resp as ScanResponseExtended;
      const itemId = (extended as ScanResponseExtended).item_id ?? 0;
      currentItemId = itemId;

      // 预览信息（在 UI 显示）
      setScanPreview({
        item_id: itemId || 0,
        batch_code: finalBatch,
        qty: effectiveQty,
      });

      // 3）根据后端解析结果判断是否可继续
      if (!itemId || itemId <= 0) {
        const msg = `条码 ${raw} 未能解析出有效商品，请在条码管理中完成绑定后再试。`;
        setScanError(msg);
        navigateToBarcodeBind(raw);
        return;
      }

      if (!finalBatch) {
        throw new Error(
          "批次不能为空：条码本身不带批次时，必须在下方输入框或通过 FEFO 卡片选择批次。",
        );
      }

      // 多 item 联动：扫码哪个 item，就把 activeItemId 切换到哪个
      setActiveItemId(itemId);

      // 4）写入任务（不扣库存）
      await scanPickTask(selectedTask.id, {
        item_id: itemId,
        qty: effectiveQty,
        batch_code: finalBatch,
      });

      // 刷新详情 / diff / FEFO
      await loadTaskDetail(selectedTask.id);

      // 成功反馈
      setScanSuccess(true);
    } catch (err: unknown) {
      const e = err as ApiErrorShape;
      console.error("scanPickTask with barcode failed:", e);
      setScanError(e?.message ?? "扫码拣货失败");
      setScanSuccess(false);

      if (currentItemId) {
        setActiveItemId(currentItemId);
      }

      // 让 ScanConsole 也能记录错误
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
