// src/features/diagnostics/ledger-timeline/LedgerTimelinePage.tsx

import React, { useState } from "react";
import { SectionCard } from "../../../components/wmsdu/SectionCard";
import { apiPost } from "../../../lib/api";

type LedgerTimelineRow = {
  id: number;
  occurred_at: string;
  movement_type: string;
  reason: string;
  item_id: number;
  batch_code: string | null;
  warehouse_id: number;
  delta: number;
  after_qty: number;
  ref?: string | null;
  trace_id?: string | null;
};

type LedgerTimelineResponse = {
  rows: LedgerTimelineRow[];
};

export const LedgerTimelinePage: React.FC = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [itemId, setItemId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [ref, setRef] = useState("");
  const [traceId, setTraceId] = useState("");

  const [rows, setRows] = useState<LedgerTimelineRow[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!from || !to) return;
    setLoading(true);

    const res = await apiPost<LedgerTimelineResponse>(
      "/stock/ledger/timeline",
      {
        time_from: `${from}T00:00:00Z`,
        time_to: `${to}T23:59:59Z`,
        item_id: itemId ? Number(itemId) : undefined,
        warehouse_id: warehouseId ? Number(warehouseId) : undefined,
        ref: ref || undefined,
        trace_id: traceId || undefined,
      },
    );

    setRows(res.rows || []);
    setLoading(false);
  }

  return (
    <div className="px-6 lg:px-10 space-y-8">
      <SectionCard
        title="Ledger Timeline（事件时间线）"
        description="按时间顺序输出库存事件，可按 item/ref/trace 精准定位"
        className="p-6 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-sm">
          <div>
            <div className="text-xs mb-1">时间 从</div>
            <input
              type="date"
              className="border h-10 rounded px-2"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>

          <div>
            <div className="text-xs mb-1">时间 到</div>
            <input
              type="date"
              className="border h-10 rounded px-2"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <div>
            <div className="text-xs mb-1">Item ID</div>
            <input
              className="border h-10 rounded px-2"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
            />
          </div>

          <div>
            <div className="text-xs mb-1">仓库 ID</div>
            <input
              className="border h-10 rounded px-2"
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
            />
          </div>

          <div>
            <div className="text-xs mb-1">ref / trace_id</div>
            <div className="flex gap-2">
              <input
                placeholder="ref"
                className="border h-10 rounded px-2 flex-1"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
              />
              <input
                placeholder="trace_id"
                className="border h-10 rounded px-2 flex-1"
                value={traceId}
                onChange={(e) => setTraceId(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button
          onClick={load}
          disabled={loading}
          className="px-6 py-2 bg-slate-900 text-white rounded"
        >
          {loading ? "加载中..." : "查询 Timeline"}
        </button>

        <div className="text-xs bg-slate-50 p-4 rounded max-h-[60vh] overflow-auto">
          {rows.length === 0 ? (
            <div className="text-slate-500">暂无事件</div>
          ) : (
            rows.map((r) => (
              <div key={r.id} className="border-b py-2">
                <div className="font-mono text-[11px] text-slate-600">
                  {r.occurred_at.replace("T", " ").replace("Z", "")}
                </div>
                <div className="text-sm">
                  <span className="font-semibold">
                    {r.movement_type}
                  </span>
                  {" / "}
                  {r.reason}
                </div>
                <div className="text-xs">
                  item={r.item_id}, batch={r.batch_code}, wh={r.warehouse_id}
                </div>
                <div className="text-xs">
                  delta={r.delta}, after={r.after_qty}
                </div>
                {(r.ref || r.trace_id) && (
                  <div className="text-[11px] mt-1 text-sky-700 font-mono">
                    ref={r.ref || "-"} | trace={r.trace_id || "-"}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </SectionCard>
    </div>
  );
};

export default LedgerTimelinePage;
