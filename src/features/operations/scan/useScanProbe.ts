// src/features/operations/scan/useScanProbe.ts
//
// 统一扫码探针 Hook：所有“只解析、不落账”的扫码入口都用这一套。
// - 后端统一走 /scan + ScanRequest(mode + barcode + warehouse_id + probe=true)
// - 前端拿到统一的 ScanStandardResult：status + item_id + batch/日期 + qty + raw

import { useState } from "react";
import { apiPost } from "../../../lib/api";
import type { ScanResponse } from "./api";

export type ScanProbeMode = "receive" | "pick" | "count" | "items";

export type ScanStatus = "OK" | "UNBOUND" | "ERROR";

export interface ScanStandardResult {
  status: ScanStatus;
  barcode: string;

  item_id?: number | null;
  qty?: number | null;
  batch_code?: string | null;
  production_date?: string | null;
  expiry_date?: string | null;

  raw: ScanResponse;
  message?: string;
}

export interface ScanProbeParams {
  barcode: string;
  warehouseId?: number;
  ctx?: {
    device_id?: string;
    operator?: string;
    // 允许携带更多上下文
    [k: string]: unknown;
  };
}

type ApiErrorShape = {
  message?: string;
};

/**
 * useScanProbe(mode):
 * - mode = "items" 时，实际仍走后端 mode="pick"，前端只拿解析结果。
 */
export function useScanProbe(mode: ScanProbeMode) {
  const [lastResult, setLastResult] = useState<ScanStandardResult | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const actualMode: "receive" | "pick" | "count" =
    mode === "items" ? "pick" : mode;

  async function probe(params: ScanProbeParams): Promise<ScanStandardResult> {
    const rawBarcode = params.barcode ?? "";
    const barcode = rawBarcode.trim();
    if (!barcode) {
      const empty: ScanStandardResult = {
        status: "ERROR",
        barcode: "",
        raw: {
          ok: false,
          committed: false,
          scan_ref: "",
          event_id: null,
          source: "scan_probe",
          evidence: [],
          errors: [{ stage: "probe", error: "empty barcode" }],
        },
        message: "条码不能为空",
      };
      setLastResult(empty);
      setError("条码不能为空");
      return empty;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        mode: actualMode,
        barcode,
        warehouse_id: params.warehouseId ?? 1,
        probe: true,
        ctx: params.ctx ?? { device_id: `probe-${mode}` },
      };

      const res = await apiPost<ScanResponse>("/scan", payload);

      let status: ScanStatus;
      let message: string | undefined;

      if (!res.ok || (res.errors && res.errors.length > 0)) {
        status = "ERROR";
        message =
          res.errors && res.errors.length > 0
            ? String(res.errors[0]?.error ?? "扫描失败")
            : "扫描失败";
      } else if (res.item_id && res.item_id > 0) {
        status = "OK";
      } else {
        status = "UNBOUND";
        message = "未解析出 item_id（可能未绑定条码）";
      }

      const std: ScanStandardResult = {
        status,
        barcode,
        item_id: res.item_id,
        qty: res.qty ?? null,
        batch_code: res.batch_code ?? null,
        // 目前 /scan 响应里没有日期字段，留好占位，方便后续扩展
        production_date: null,
        expiry_date: null,
        raw: res,
        message,
      };

      setLastResult(std);
      return std;
    } catch (e: unknown) {
      const err = e as ApiErrorShape;
      const msg = err?.message ?? "调用 /scan 失败";
      setError(msg);

      const std: ScanStandardResult = {
        status: "ERROR",
        barcode,
        item_id: undefined,
        qty: null,
        batch_code: null,
        production_date: null,
        expiry_date: null,
        raw: {
          ok: false,
          committed: false,
          scan_ref: "",
          event_id: null,
          source: "scan_probe_error",
          evidence: [],
          errors: [{ stage: "probe", error: msg }],
        },
        message: msg,
      };

      setLastResult(std);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return {
    lastResult,
    loading,
    error,
    probe,
  };
}
