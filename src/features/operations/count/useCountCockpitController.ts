// src/features/operations/count/useCountCockpitController.ts
// =====================================================
//  Count Cockpit - 中控（v2）
//  核心变化：
//  - 不再手写 ScanRequest，而是复用 makeCountScanRequest
//  - 与 ScanCountPage 完全走同一条 /scan(mode='count') 链路
//  - 前端做最小日期校验：expiry_date >= production_date
// =====================================================

import { useState } from "react";
import {
  scanCountV2,
  type ScanResponse,
} from "../scan/api";
import { makeCountScanRequest } from "../scan/scanRequest";

import type {
  CountCockpitController,
  CountCockpitFormState,
  CountCockpitHistoryEntry,
} from "./types";

let nextHistoryId = 1;
const fmt = (d: Date) => d.toISOString().replace("T", " ").slice(0, 19);

const initialForm: CountCockpitFormState = {
  item_id: null,
  warehouse_id: 1,
  qty: null, // 语义：盘点后的“绝对量”（actual）
  batch_code: "",
  production_date: undefined,
  expiry_date: undefined,
};

function isInvalidDateRange(prod?: string, exp?: string): boolean {
  if (!prod || !exp) return false;
  const p = new Date(prod);
  const e = new Date(exp);
  if (Number.isNaN(p.getTime()) || Number.isNaN(e.getTime())) return false;
  return e < p;
}

type ApiErrorShape = {
  message?: string;
};

export function useCountCockpitController(): CountCockpitController {
  const [form, setForm] = useState<CountCockpitFormState>({ ...initialForm });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ScanResponse | null>(null);
  const [history, setHistory] = useState<CountCockpitHistoryEntry[]>([]);

  function updateForm<K extends keyof CountCockpitFormState>(
    key: K,
    value: CountCockpitFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setForm({ ...initialForm });
    setError(null);
  }

  async function submit() {
    const itemId = form.item_id ?? 0;
    const whId = form.warehouse_id ?? 0;
    const actual = form.qty ?? 0; // 语义上就是“盘点后的绝对量”

    if (!itemId || itemId <= 0) {
      setError("item_id 必须为正整数");
      return;
    }
    if (!whId || whId <= 0) {
      setError("warehouse_id 必须为正整数");
      return;
    }
    if (actual < 0) {
      setError("qty / actual 不能为负数（代表盘点后的绝对量）");
      return;
    }

    // ★ 前端最小校验：若同时填写了生产日期和到期日期，则要求到期日 >= 生产日
    if (isInvalidDateRange(form.production_date, form.expiry_date)) {
      setError("到期日期（expiry_date）不能早于生产日期（production_date）。");
      return;
    }

    setLoading(true);
    setError(null);

    const now = new Date();
    const histId = nextHistoryId++;
    const baseReq: CountCockpitFormState = { ...form };

    try {
      // ✅ 关键：复用 makeCountScanRequest，与 ScanCountPage 完全对齐
      const scanReq = makeCountScanRequest(
        {
          item_id: itemId,
          actual,
          warehouse_id: whId,
          batch_code: form.batch_code?.trim() || undefined,
          production_date: form.production_date || undefined,
          expiry_date: form.expiry_date || undefined,
          ctx: {
            source: "operations/count-cockpit",
          },
        },
        "count-cockpit", // trace / scan_ref 上的 source，用于后端审计与排错
      );

      const resp = await scanCountV2(scanReq);
      setLastResult(resp);

      const entry: CountCockpitHistoryEntry = {
        id: histId,
        ts: fmt(now),
        req: baseReq,
        resp,
        ok: resp.ok,
        error: resp.ok ? undefined : "scanCountV2 返回 ok=false",
      };
      setHistory((prev) => [entry, ...prev].slice(0, 50));
    } catch (err: unknown) {
      const e = err as ApiErrorShape;
      console.error("scanCountV2 (count-cockpit) failed", e);
      const msg = e?.message ?? "盘点请求失败";
      setError(msg);

      const entry: CountCockpitHistoryEntry = {
        id: histId,
        ts: fmt(now),
        req: baseReq,
        resp: null,
        ok: false,
        error: msg,
      };
      setHistory((prev) => [entry, ...prev].slice(0, 50));
    } finally {
      setLoading(false);
    }
  }

  return {
    form,
    loading,
    error,
    lastResult,
    history,
    updateForm,
    resetForm,
    submit,
  };
}
