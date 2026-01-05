// src/features/operations/inbound/scan/useInboundScanCardModel.ts

import { useState } from "react";
import type { InboundCockpitController } from "../types";
import { parseScanBarcode, type ParsedBarcode } from "../../scan/barcodeParser";
import { useScanProbe } from "../../scan/useScanProbe";
import type { ApiErrorShape, StatusLevel } from "./types";

export function useInboundScanCardModel(c: InboundCockpitController) {
  const [scanQty, setScanQty] = useState<number>(1);

  const [statusLevel, setStatusLevel] = useState<StatusLevel>("idle");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const { probe, loading, error: probeError } = useScanProbe("receive");

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    if (!Number.isFinite(v) || v <= 0) {
      setScanQty(1);
    } else {
      setScanQty(Math.floor(v));
    }
  };

  const handleScan = async (barcodeRaw: string) => {
    const barcode = barcodeRaw.trim();
    if (!barcode) return;

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
        setStatusMsg(
          `条码解析成功：item_id=${std.item_id ?? "(未解析)"}，qty=${std.qty ?? 1}`,
        );
      } else if (std.status === "UNBOUND") {
        setStatusLevel("warn");
        setStatusMsg(
          `条码 ${barcode} 未在条码主数据中绑定任何商品，请检查条码与 Items 条码管理。`,
        );
      } else {
        setStatusLevel("error");
        setStatusMsg(std.message ?? "条码解析失败");
      }

      const itemId =
        (std.item_id as number | null | undefined) ??
        parsedLocal.item_id ??
        null;

      const qtyFromParsed =
        (std.qty as number | null | undefined) ??
        parsedLocal.qty ??
        1;

      const effectiveQty =
        Number.isFinite(scanQty) && scanQty > 0 ? scanQty : qtyFromParsed;

      const overridden: ParsedBarcode = {
        ...parsedLocal,
        raw: barcode,
        item_id: itemId ?? undefined,
        qty: effectiveQty,
      };

      await c.handleScanParsed(overridden);
    } catch (e: unknown) {
      const err = e as ApiErrorShape;
      setStatusLevel("error");
      setStatusMsg(err?.message ?? "调用 /scan 解析失败");
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
