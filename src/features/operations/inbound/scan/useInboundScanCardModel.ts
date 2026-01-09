// src/features/operations/inbound/scan/useInboundScanCardModel.ts

import { useEffect, useState } from "react";
import type { InboundCockpitController } from "../types";
import { parseScanBarcode, type ParsedBarcode } from "../../scan/barcodeParser";
import { useScanProbe } from "../../scan/useScanProbe";
import type { ApiErrorShape, StatusLevel } from "./types";

export function useInboundScanCardModel(c: InboundCockpitController) {
  const [scanQty, setScanQty] = useState<number>(1);

  const [statusLevel, setStatusLevel] = useState<StatusLevel>("idle");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const { probe, loading, error: probeError } = useScanProbe("receive");

  const taskId = c.currentTask?.id ?? null;
  const isCommitted = c.currentTask?.status === "COMMITTED";

  // ✅ 任务切换 / 进入终态：清理扫码卡残留（作业结束不应继续扫）
  useEffect(() => {
    setScanQty(1);
    setStatusLevel("idle");
    setStatusMsg(null);
  }, [taskId, isCommitted]);

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    if (!Number.isFinite(v) || v <= 0) {
      setScanQty(1);
    } else {
      setScanQty(Math.floor(v));
    }
  };

  const handleScan = async (barcodeRaw: string) => {
    if (isCommitted) {
      setStatusLevel("warn");
      setStatusMsg("本次任务已入库，作业已结束：请创建新任务继续收货。");
      return;
    }

    const barcode = barcodeRaw.trim();
    if (!barcode) return;

    // 先记录本地历史（轻量）
    c.handleScan(barcode);

    const parsedLocal: ParsedBarcode = parseScanBarcode(barcode);

    try {
      const std = await probe({
        barcode,
        warehouseId: c.currentTask?.warehouse_id ?? 1,
        ctx: { device_id: "inbound-cockpit" },
      });

      if (std.status === "OK") {
        setStatusLevel("ok");
        setStatusMsg("条码已识别，正在累加实收数量…");
      } else if (std.status === "UNBOUND") {
        setStatusLevel("warn");
        setStatusMsg("条码未绑定商品：请先在【商品条码管理】完成绑定。");
      } else {
        setStatusLevel("error");
        setStatusMsg(std.message ?? "条码解析失败");
      }

      const itemId = (std.item_id as number | null | undefined) ?? parsedLocal.item_id ?? null;

      const qtyFromParsed = (std.qty as number | null | undefined) ?? parsedLocal.qty ?? 1;

      const effectiveQty = Number.isFinite(scanQty) && scanQty > 0 ? scanQty : qtyFromParsed;

      const overridden: ParsedBarcode = {
        ...parsedLocal,
        raw: barcode,
        item_id: itemId ?? undefined,
        qty: effectiveQty,
      };

      await c.handleScanParsed(overridden);

      // handleScanParsed 成功后，给用户一个“结果已落账”的反馈
      if (itemId) {
        setStatusLevel("ok");
        setStatusMsg("已累加实收数量。");
      } else {
        setStatusLevel("warn");
        setStatusMsg("已解析条码，但未识别到对应商品。请检查条码绑定。");
      }
    } catch (e: unknown) {
      const err = e as ApiErrorShape;
      setStatusLevel("error");
      setStatusMsg(err?.message ?? "条码解析/累加失败");
      throw e;
    }
  };

  return {
    scanQty,
    statusLevel,
    statusMsg,

    loading,
    probeError,

    handleQtyChange,
    handleScan,
  };
}
