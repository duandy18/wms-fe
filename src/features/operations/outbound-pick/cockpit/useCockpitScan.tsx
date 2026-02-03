// src/features/operations/outbound-pick/cockpit/useCockpitScan.tsx

import { useEffect, useState } from "react";

import { scanPickV2, type ScanRequest, type ScanResponse } from "../../scan/api";
import { parseScanBarcode } from "../../scan/barcodeParser";

import { scanPickTask, type PickTask } from "../pickTasksApi";
import type { ApiErrorShape, ScanResponseExtended } from "../types_cockpit";
import type { ItemBasic } from "../../../../master-data/itemsApi";

const NO_BATCH_CODE = "NOEXP";

function isBatchRequired(meta: ItemBasic | null): boolean {
  if (!meta) return false;

  // 优先使用后端派生字段 requires_batch（若存在）
  const maybe = meta as unknown as { requires_batch?: unknown; has_shelf_life?: unknown };
  if (typeof maybe.requires_batch === "boolean") return maybe.requires_batch;

  // 兜底：以 has_shelf_life 推断（与你后端 item_service 的派生逻辑一致）
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
      // 1）本地 parse：只用来拿候选 qty + 批次（若条码带批次）
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

      // 3）根据后端解析结果判断是否可继续
      if (!itemId || itemId <= 0) {
        const msg = `条码 ${raw} 未能解析出有效商品，请在条码管理中完成绑定后再试。`;
        setScanError(msg);
        navigateToBarcodeBind(raw);
        return;
      }

      // 多 item 联动：扫码哪个 item，就把 activeItemId 切换到哪个
      setActiveItemId(itemId);

      // 4）批次策略（人机协同裁决）
      const batchRequired = isBatchRequired(activeItemMeta);

      if (batchRequired) {
        // 批次受控：必须由条码或人工输入提供
        if (!finalBatch) {
          throw new Error("该商品为批次受控：条码不带批次时，必须在下方输入批次号后再扫码。");
        }
      } else {
        // 非批次受控：不要求操作员录批次；内部落到“无批次桶”
        if (!finalBatch) {
          finalBatch = NO_BATCH_CODE;
        }
      }

      // 预览信息（在 UI 显示）
      setScanPreview({
        item_id: itemId || 0,
        batch_code: finalBatch || null,
        qty: effectiveQty,
      });

      // 5）写入任务（不扣库存）
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
