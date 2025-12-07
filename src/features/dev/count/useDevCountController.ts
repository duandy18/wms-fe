// src/features/dev/count/useDevCountController.ts
// =====================================================
//  Count Debug Panel - 核心中控
//  - 手工输入 item_id / warehouse_id / qty / batch
//  - 调用 scanCountV2(mode='count')
//  - 展示 ScanResponse + 历史列表
// =====================================================

import { useState } from "react";
import {
  scanCountV2,
  type ScanResponse,
  type ScanRequest,
} from "../../operations/scan/api";

import type {
  DevCountController,
  CountFormState,
  CountHistoryEntry,
} from "./types";

let nextHistoryId = 1;

const fmt = (d: Date) => d.toISOString().replace("T", " ").slice(0, 19);

const initialForm: CountFormState = {
  item_id: null,
  warehouse_id: 1,
  qty: null,
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

export function useDevCountController(): DevCountController {
  const [form, setForm] = useState<CountFormState>({ ...initialForm });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ScanResponse | null>(null);
  const [history, setHistory] = useState<CountHistoryEntry[]>([]);

  function updateForm<K extends keyof CountFormState>(
    key: K,
    value: CountFormState[K],
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
    const qty = form.qty ?? 0;

    if (!itemId || itemId <= 0) {
      setError("item_id 必须为正整数");
      return;
    }
    if (!whId || whId <= 0) {
      setError("warehouse_id 必须为正整数");
      return;
    }
    if (qty < 0) {
      setError("qty 不能为负数（代表盘点后的绝对量）");
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
    const baseReq: CountFormState = { ...form };

    try {
      const req: ScanRequest = {
        mode: "count",
        item_id: itemId,
        qty,
        warehouse_id: whId,
        batch_code: form.batch_code || undefined,
        production_date: form.production_date || undefined,
        expiry_date: form.expiry_date || undefined,
        ctx: {
          source: "devconsole/count",
        },
      };

      const resp = await scanCountV2(req);
      setLastResult(resp);

      const entry: CountHistoryEntry = {
        id: histId,
        ts: fmt(now),
        req: baseReq,
        resp,
        ok: resp.ok,
        error: resp.ok ? undefined : "scanCountV2 返回 ok=false",
      };
      setHistory((prev) => [entry, ...prev].slice(0, 50));
    } catch (err: unknown) {
      console.error("scanCountV2 failed", err);
      const msg =
        err instanceof Error ? err.message : "盘点请求失败";
      setError(msg);

      const entry: CountHistoryEntry = {
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
