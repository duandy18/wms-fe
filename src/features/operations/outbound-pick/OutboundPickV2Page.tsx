// src/features/operations/outbound-pick/OutboundPickV2Page.tsx
//
// v2 拣货出库（工具版，中控）
// - 状态 & 后端交互：scanPickV2 / snapshot / trace
// - UI 交由各 Panel 负责：Form + Scan + Result + History + Sidebar
// - 表单提交：真实调用 /scan(mode=pick) 扣库存
// - 扫码台：probe=true，只做条码解析（验证条码与链路），不扣库存

import React, { useCallback, useEffect, useState } from "react";
import { scanPickV2 } from "../scan/api";
import type { ScanRequest, ScanResponse } from "../scan/api";

import { apiGet } from "../../../lib/api";
import {
  fetchItemDetail,
  type ItemDetailResponse,
} from "../../inventory/snapshot/api";

import type { TraceEvent } from "../../diagnostics/trace/types";

import {
  OutboundPickFormPanel,
  type FormState,
} from "./OutboundPickFormPanel";
import { OutboundPickScanPanel } from "./OutboundPickScanPanel";
import { OutboundPickResultPanel } from "./OutboundPickResultPanel";
import {
  OutboundPickHistoryPanel,
  type HistoryEntry,
} from "./OutboundPickHistoryPanel";
import { OutboundPickSidebar } from "./OutboundPickSidebar";

type TraceResponse = {
  trace_id: string;
  warehouse_id?: number | null;
  events: TraceEvent[];
};

type ScanResponseExtended = ScanResponse & {
  ok?: boolean;
  scan_ref?: string | null;
};

type ApiErrorShape = {
  message?: string;
};

let nextId = 1;

const OutboundPickV2Page: React.FC = () => {
  // ---------------- 表单 & 执行状态（中控） ----------------
  const [form, setForm] = useState<FormState>({
    warehouseId: 1,
    itemId: 3001,
    qty: 1,
    batchCode: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [lastResp, setLastResp] = useState<ScanResponse | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // ---------------- snapshot 状态 ----------------
  const [itemDetail, setItemDetail] = useState<ItemDetailResponse | null>(
    null,
  );
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);

  const loadSnapshot = useCallback(async () => {
    if (!form.itemId) return;

    setSnapshotLoading(true);
    setSnapshotError(null);

    try {
      const detail = await fetchItemDetail(form.itemId);
      setItemDetail(detail);
    } catch (err: unknown) {
      const e = err as ApiErrorShape;
      console.error("loadSnapshot failed:", e);
      setSnapshotError(e?.message ?? "加载库存详情失败");
      setItemDetail(null);
    } finally {
      setSnapshotLoading(false);
    }
  }, [form.itemId]);

  useEffect(() => {
    void loadSnapshot();
  }, [loadSnapshot]);

  // ---------------- trace 状态 ----------------
  const [traceEvents, setTraceEvents] = useState<TraceEvent[]>([]);
  const [traceLoading, setTraceLoading] = useState(false);
  const [traceError, setTraceError] = useState<string | null>(null);
  const [lastScanRef, setLastScanRef] = useState<string | null>(null);

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
      console.error("loadTrace error:", e);
      setTraceError(e?.message ?? "加载 Trace 失败");
      setTraceEvents([]);
    } finally {
      setTraceLoading(false);
    }
  }

  // ---------------- 中控：构建 & 执行 scan 请求 ----------------
  async function execute(kind: "form" | "scan", req: ScanRequest) {
    const id = nextId++;
    setLoading(true);
    setError(null);

    try {
      const resp = await scanPickV2(req);
      setLastResp(resp);

      setHistory((prev) => [
        { id, kind, req, resp, error: null },
        ...prev,
      ]);

      const extended = resp as ScanResponseExtended;
      const ok = extended.ok !== false;
      const scanRef = extended.scan_ref ?? undefined;

      if (ok && scanRef && !req.probe) {
        // 只有真正扣库（非 probe）时才自动加载 Trace / Snapshot
        setLastScanRef(scanRef);
        await loadTrace(scanRef);
        await loadSnapshot();
      }
    } catch (err: unknown) {
      const e = err as ApiErrorShape;
      const msg = e?.message ?? "拣货失败";
      setError(msg);

      setHistory((prev) => [
        { id, kind, req, resp: null, error: msg },
        ...prev,
      ]);
    } finally {
      setLoading(false);
    }
  }

  // ---------------- 中控：更新表单字段 ----------------
  function updateForm(patch: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  // ---------------- 手工提交：按 item + batch + qty 真正扣库 ----------------
  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();

    if (!form.warehouseId) return setError("warehouse_id 必填");
    if (!form.itemId) return setError("item_id 必填");
    if (!form.qty || form.qty <= 0) return setError("qty 必须 > 0");
    if (!form.batchCode.trim()) return setError("batch_code 必须填写");

    const req: ScanRequest = {
      mode: "pick",
      warehouse_id: form.warehouseId,
      item_id: form.itemId,
      qty: form.qty,
      batch_code: form.batchCode.trim(),
      ctx: { device_id: "pick-form" },
    };

    await execute("form", req);
  };

  // ---------------- 扫码：probe 模式，只做解析（不动账） ----------------
  async function handleScanConsole(barcode: string) {
    const value = barcode.trim();
    if (!value) return;

    const req: ScanRequest = {
      mode: "pick",
      warehouse_id: form.warehouseId,
      barcode: value,
      probe: true,
      ctx: { device_id: "pick-scan" },
    };

    await execute("scan", req);
  }

  return (
    <div className="p-6 space-y-6">
      {/* 头部 */}
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">
          拣货出库（v2 /scan pick）
        </h1>
        <p className="text-sm text-slate-600">
          手工表单：以 item + batch + qty 作为出库动作，真实扣库存。扫码区：以
          probe 模式调用 /scan pick，仅用于验证条码与链路（不动账）。
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-6 items-start">
        {/* 左侧：Form + Scan + Result + 历史 */}
        <div className="space-y-4">
          <OutboundPickFormPanel
            form={form}
            loading={loading}
            error={error}
            batchSlices={itemDetail?.slices ?? []}
            onChangeField={updateForm}
            onSubmit={handleSubmit}
          />

          <OutboundPickScanPanel onScanConsole={handleScanConsole} />

          <OutboundPickResultPanel result={lastResp} />

          <OutboundPickHistoryPanel history={history} />
        </div>

        {/* 右侧：库存 snapshot + TraceTimeline */}
        <OutboundPickSidebar
          itemDetail={itemDetail}
          snapshotLoading={snapshotLoading}
          snapshotError={snapshotError}
          traceEvents={traceEvents}
          traceLoading={traceLoading}
          traceError={traceError}
          lastScanRef={lastScanRef}
        />
      </div>
    </div>
  );
};

export default OutboundPickV2Page;
