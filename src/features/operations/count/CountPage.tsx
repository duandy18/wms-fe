// src/features/operations/count/CountPage.tsx
//
// v2 盘点 Cockpit：
// - 左侧：手工盘点表单 + 扫码台 (/scan, mode=count)
// - 右侧：实时库存 / 批次（来自 snapshot）+ Trace 时间线（按 scan_ref）
// -------------------------------------------------------------------

import React, { useEffect, useMemo, useState } from "react";
import { scanCountV2 } from "../scan/api";
import type { ScanResponse } from "../scan/api";
import { makeCountScanRequest } from "../scan/scanRequest";

import ApiBadge from "../../../components/common/ApiBadge";
import { ScanConsole } from "../../../components/scan/ScanConsole";

import type { ParsedBarcode } from "../scan/barcodeParser";

import { apiGet } from "../../../lib/api";
import {
  fetchItemDetail,
  type ItemDetailResponse,
  type ItemSlice,
} from "../../inventory/snapshot/api";

import { TraceTimeline } from "../../diagnostics/trace/TraceTimeline";
import type { TraceEvent } from "../../diagnostics/trace/types";

// 本地表单状态（与 ScanRequest 对齐）
type FormState = {
  item_id: number;
  actual: number; // 盘点后的最终数量（绝对量）
  warehouse_id?: number;
  batch_code: string;
  production_date?: string;
  expiry_date?: string;
};

type HistoryEntry = {
  id: number;
  kind: "form" | "scan";
  req: Partial<FormState>;
  resp: ScanResponse | null;
  error: string | null;
};

type TraceResponse = {
  trace_id: string;
  warehouse_id?: number | null;
  events: TraceEvent[];
};

type ApiErrorShape = {
  message?: string;
};

// 直接从 scanCountV2 推导 payload 类型，避免 any
type ScanCountPayload = Parameters<typeof scanCountV2>[0];

// 扩展 ItemSlice：允许存在 expire_at
type SliceWithExpire = ItemSlice & {
  expire_at?: string | null;
};

let nextId = 1;

const CountPage: React.FC = () => {
  const [form, setForm] = useState<FormState>(() => ({
    item_id: 0,
    actual: 0,
    warehouse_id: 1,
    batch_code: "",
  }));

  const [scanMode, setScanMode] = useState<"fill" | "auto">("fill");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // snapshot 状态
  const [itemDetail, setItemDetail] = useState<ItemDetailResponse | null>(null);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);

  // trace 状态
  const [traceEvents, setTraceEvents] = useState<TraceEvent[]>([]);
  const [traceLoading, setTraceLoading] = useState(false);
  const [traceError, setTraceError] = useState<string | null>(null);
  const [lastScanRef, setLastScanRef] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const isDateMissing = useMemo(
    () => !form.production_date && !form.expiry_date,
    [form.production_date, form.expiry_date],
  );

  // ---------------- snapshot: 加载某个 item 的批次明细 ----------------
  async function loadSnapshot() {
    if (!form.item_id || form.item_id <= 0) {
      setItemDetail(null);
      return;
    }
    setSnapshotLoading(true);
    setSnapshotError(null);
    try {
      const detail = await fetchItemDetail(form.item_id);
      setItemDetail(detail);
    } catch (err: unknown) {
      const e = err as ApiErrorShape;
      console.error("loadSnapshot failed:", e);
      setSnapshotError(e?.message ?? "加载库存详情失败");
      setItemDetail(null);
    } finally {
      setSnapshotLoading(false);
    }
  }

  useEffect(() => {
    void loadSnapshot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.item_id]);

  // ---------------- Trace: 按 scan_ref 拉事件时间线 ----------------
  async function loadTrace(traceId: string) {
    setTraceLoading(true);
    setTraceError(null);
    try {
      const resp = await apiGet<TraceResponse>(
        `/debug/trace/${encodeURIComponent(traceId)}`,
      );
      setTraceEvents(resp.events || []);
    } catch (err: unknown) {
      const e = err as ApiErrorShape;
      console.error("loadTrace failed:", e);
      setTraceError(e?.message ?? "加载 Trace 失败");
      setTraceEvents([]);
    } finally {
      setTraceLoading(false);
    }
  }

  // ---------------- 执行一次盘点（手工 / 扫码） ----------------
  async function execute(kind: "form" | "scan", reqBody: ScanCountPayload) {
    const id = nextId++;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await scanCountV2(reqBody);
      setResult(res);

      setHistory((prev) => [
        { id, kind, req: { ...form }, resp: res, error: null },
        ...prev,
      ]);

      const ok = res.ok !== false;
      const scanRef = res.scan_ref;
      if (ok && scanRef) {
        setLastScanRef(scanRef);
        await Promise.all([loadTrace(scanRef), loadSnapshot()]);
      }
    } catch (err: unknown) {
      const e = err as ApiErrorShape;
      const msg = e?.message ?? "盘点失败";
      setError(msg);
      setHistory((prev) => [
        { id, kind, req: { ...form }, resp: null, error: msg },
        ...prev,
      ]);
    } finally {
      setLoading(false);
    }
  }

  // ---------------- 表单提交：按 item+batch+actual 盘点 ----------------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!form.item_id || form.item_id <= 0) {
      setError("item_id 必须为正整数");
      return;
    }
    if (form.actual < 0) {
      setError("actual 必须 ≥ 0");
      return;
    }
    if (!form.batch_code.trim()) {
      setError("batch_code 必填");
      return;
    }
    if (isDateMissing) {
      setError("盘盈为入库行为，必须提供 production_date 或 expiry_date");
      return;
    }

    const req = makeCountScanRequest(
      {
        item_id: form.item_id,
        actual: form.actual,
        warehouse_id: form.warehouse_id,
        batch_code: form.batch_code.trim(),
        production_date: form.production_date || undefined,
        expiry_date: form.expiry_date || undefined,
        ctx: { device_id: "count-page" },
      },
      "count-page",
    );

    await execute("form", req as ScanCountPayload);
  }

  // ---------------- 扫码台：按条码盘点 ----------------
  async function handleScanConsole(barcode: string) {
    const req: ScanCountPayload = {
      mode: "count",
      warehouse_id: form.warehouse_id ?? 1,
      barcode,
      ctx: { device_id: "scan-console-count" },
    } as ScanCountPayload;
    await execute("scan", req);
  }

  // 扫码解析填表（只在 scanMode=fill 时有用）
  const handleScanParsed = (parsed: ParsedBarcode) => {
    setForm((prev) => ({
      ...prev,
      item_id: parsed.item_id ?? prev.item_id,
      actual: parsed.qty ?? prev.actual,
      batch_code: parsed.batch_code ?? prev.batch_code,
      warehouse_id: parsed.warehouse_id ?? prev.warehouse_id,
      production_date: parsed.production_date ?? prev.production_date,
      expiry_date: parsed.expiry_date ?? prev.expiry_date,
    }));
  };

  function handleReset() {
    setForm({
      item_id: 0,
      actual: 0,
      warehouse_id: 1,
      batch_code: "",
      production_date: "",
      expiry_date: "",
    } as FormState);
    setResult(null);
    setError(null);
    setTraceEvents([]);
    setLastScanRef(null);
  }

  // FEFO 排序（容忍 ItemSlice 上没有 expire_at 字段）
  function sortFEFO(slices: ItemSlice[]) {
    return [...slices].sort((a, b) => {
      const sa = a as SliceWithExpire;
      const sb = b as SliceWithExpire;
      const da = sa.expire_at ? Date.parse(sa.expire_at) : Infinity;
      const db = sb.expire_at ? Date.parse(sb.expire_at) : Infinity;
      return da - db;
    });
  }

  return (
    <div className="space-y-6 p-6">
      {/* 头部 */}
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            盘点 / 库存校正（v2 /scan count）
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            使用统一 ScanRequest 调用 <code>/scan</code>（mode=
            <code>count</code>），输入 actual 为盘点后的绝对量，后端自动计算 delta、
            写 COUNT 台账，并挂入 trace 链路。
          </p>
        </div>
        <ApiBadge method="POST" path="/scan" />
      </header>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* 左侧：表单 + 扫码台 + 响应 + 历史 */}
        <div className="space-y-4">
          {/* 表单 */}
          <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-800">
              手工盘点（按 item + batch + actual）
            </h2>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-600">item_id</label>
                  <input
                    className="rounded-lg border px-3 py-2 text-sm"
                    value={form.item_id || ""}
                    onChange={(e) =>
                      update("item_id", Number(e.target.value || 0))
                    }
                    placeholder="商品编码"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-600">
                    actual（盘点后的最终数量）
                  </label>
                  <input
                    className="rounded-lg border px-3 py-2 text-sm"
                    value={form.actual}
                    onChange={(e) =>
                      update("actual", Number(e.target.value || 0))
                    }
                    placeholder="盘点后绝对量"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-600">
                    warehouse_id
                  </label>
                  <input
                    className="rounded-lg border px-3 py-2 text-sm"
                    value={form.warehouse_id ?? ""}
                    onChange={(e) =>
                      update("warehouse_id", Number(e.target.value || 0))
                    }
                    placeholder="例如 1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-600">batch_code</label>
                  <input
                    className="rounded-lg border px-3 py-2 text-sm"
                    value={form.batch_code}
                    onChange={(e) => update("batch_code", e.target.value)}
                    placeholder="批次编码"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-600">
                    production_date（选一）
                  </label>
                  <input
                    type="date"
                    className="rounded-lg border px-3 py-2 text-sm"
                    value={form.production_date || ""}
                    onChange={(e) =>
                      update(
                        "production_date",
                        e.target.value || undefined,
                      )
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-600">
                    expiry_date（选一）
                  </label>
                  <input
                    type="date"
                    className="rounded-lg border px-3 py-2 text-sm"
                    value={form.expiry_date || ""}
                    onChange={(e) =>
                      update("expiry_date", e.target.value || undefined)
                    }
                  />
                </div>
              </div>

              <div className="mt-2 flex items-center gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-slate-900 px-5 py-2 text-sm text-white disabled:opacity-60"
                >
                  {loading ? "提交中…" : "提交盘点结果"}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-xs text-slate-700"
                >
                  重置
                </button>
                {error && (
                  <span className="text-xs text-red-600">{error}</span>
                )}
              </div>
            </form>
          </section>

          {/* 扫码台 */}
          <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-800">
              盘点扫码台（mode=count）
            </h2>
            <p className="text-xs text-slate-500">
              扫码将以 mode=count 调用 /scan，按当前仓库和批次进行盘点。
            </p>

            <div className="mb-2 flex items-center gap-3 text-xs">
              <span className="text-slate-600">扫码模式：</span>
              <label className="flex cursor-pointer items-center gap-1">
                <input
                  type="radio"
                  name="scan-mode-count"
                  value="fill"
                  checked={scanMode === "fill"}
                  onChange={() => setScanMode("fill")}
                />
                扫描填表
              </label>
              <label className="flex cursor-pointer items-center gap-1">
                <input
                  type="radio"
                  name="scan-mode-count"
                  value="auto"
                  checked={scanMode === "auto"}
                  onChange={() => setScanMode("auto")}
                />
                扫描即执行
              </label>
            </div>

            <div className="rounded-lg border border-dashed border-slate-300 p-2">
              <ScanConsole
                title="盘点扫码台"
                modeLabel="盘点（count）"
                scanMode={scanMode}
                onScan={handleScanConsole}
                onParsedFields={handleScanParsed}
              />
            </div>
          </section>

          {/* 最近响应 */}
          <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-800">
              最近一次 ScanResponse
            </h2>
            {result ? (
              <>
                <div className="text-xs text-slate-700">
                  scan_ref:{" "}
                  <span className="font-mono">{result.scan_ref}</span>{" "}
                  · ok={String(result.ok)} · committed=
                  {String(result.committed)} · source={result.source}
                </div>
                <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-all rounded bg-slate-50 p-3 text-[11px]">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </>
            ) : (
              <div className="text-xs text-slate-500">
                暂无结果，提交一次盘点请求后会显示。
              </div>
            )}
          </section>

          {/* 历史 */}
          <section className="space-y-1 rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-800">
              最近盘点记录（最多 10 条）
            </h2>
            {history.length === 0 ? (
              <div className="text-xs text-slate-500">暂无历史。</div>
            ) : (
              <ul className="space-y-1 text-[11px] text-slate-700">
                {history.slice(0, 10).map((h) => (
                  <li key={h.id} className="border-b border-slate-100 pb-1">
                    #{h.id.toString().padStart(3, "0")} ·{h.kind}· wh=
                    {h.req.warehouse_id} item={h.req.item_id} batch=
                    {h.req.batch_code ?? "-"} actual={h.req.actual} ·{" "}
                    {h.error ? (
                      <span className="text-red-600">错误：{h.error}</span>
                    ) : (
                      <span className="text-emerald-600">OK</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* 右侧：库存 snapshot + TraceTimeline */}
        <div className="space-y-6">
          {/* 库存 snapshot */}
          <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-800">
              库存与批次（FEFO）
            </h2>

            {snapshotError && (
              <div className="text-xs text-red-600">
                加载失败：{snapshotError}
              </div>
            )}

            {snapshotLoading ? (
              <div className="text-xs text-slate-500">加载中…</div>
            ) : itemDetail ? (
              <>
                <div className="text-xs text-slate-600">
                  总可用量：
                  {itemDetail.totals.available_qty}（on_hand=
                  {itemDetail.totals.on_hand_qty}）
                </div>
                <div className="space-y-2">
                  {sortFEFO(itemDetail.slices).map(
                    (s: SliceWithExpire, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs"
                      >
                        <div className="flex justify-between">
                          <span className="font-mono">{s.batch_code}</span>
                          <span className="font-semibold">
                            可用：{s.available_qty}
                          </span>
                        </div>
                        <div className="text-slate-600">
                          expire: {s.expire_at ?? "-"}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </>
            ) : (
              <div className="text-xs text-slate-500">
                无数据。先选择一个 item 并加载库存。
              </div>
            )}
          </section>

          {/* Trace 时间线 */}
          <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-800">
              Trace 事件时间线
            </h2>

            {lastScanRef && (
              <div className="font-mono text-[11px] text-slate-500">
                {lastScanRef}
              </div>
            )}

            {traceError && (
              <div className="text-xs text-red-600">
                Trace 加载失败：{traceError}
              </div>
            )}

            {traceLoading ? (
              <div className="text-xs text-slate-500">Trace 加载中…</div>
            ) : traceEvents.length > 0 ? (
              <TraceTimeline events={traceEvents} />
            ) : (
              <div className="text-xs text-slate-500">
                尚无 Trace 数据。成功执行一次盘点后会自动展示。
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default CountPage;
