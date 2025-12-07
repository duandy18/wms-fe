// src/features/diagnostics/ledger-cockpit/LedgerCockpitPage.tsx

import React, { useState } from "react";
import { SectionCard } from "../../../components/wmsdu/SectionCard";
import { apiPost } from "../../../lib/api";

type MovementSummaryRow = {
  count: number;
  total_delta: number;
};

type RefSummaryRow = {
  ref: string;
  cnt: number;
  total_delta: number;
};

type TraceSummaryRow = {
  trace_id: string;
  cnt: number;
  total_delta: number;
};

type LedgerReconcileSummary = {
  movement_type?: Record<string, MovementSummaryRow>;
  ref?: RefSummaryRow[];
  trace?: TraceSummaryRow[];
};

type ThreeBooksRow = {
  warehouse_id: number;
  item_id: number;
  batch_code: string;
  ledger_qty: number;
  stock_qty: number;
  snapshot_qty: number;
  diff_stock: number;
  diff_snapshot: number;
};

type ThreeBooksResponse = {
  books?: ThreeBooksRow[];
};

export const LedgerCockpitPage: React.FC = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [cut, setCut] = useState("");

  const [summary, setSummary] = useState<LedgerReconcileSummary | null>(null);
  const [three, setThree] = useState<ThreeBooksResponse | null>(null);

  async function loadSummary() {
    if (!from || !to) return;
    const res = await apiPost<LedgerReconcileSummary>(
      "/stock/ledger/reconcile-v2/summary",
      {
        time_from: `${from}T00:00:00Z`,
        time_to: `${to}T23:59:59Z`,
      },
    );
    setSummary(res);
  }

  async function loadThreeBooks() {
    if (!cut) return;
    const res = await apiPost<ThreeBooksResponse>(
      "/stock/ledger/reconcile-v2/three-books",
      {
        cut: `${cut}T23:59:59Z`,
      },
    );
    setThree(res);
  }

  return (
    <div className="px-6 lg:px-10 space-y-10">
      {/* ===================== 多维对账 ===================== */}
      <SectionCard
        title="Ledger Cockpit（台账控制中心）"
        description="多维对账：movement_type / ref / trace"
        className="p-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-xs mb-1">时间 从</div>
            <input
              type="date"
              className="border h-10 rounded px-2 w-full"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>

          <div>
            <div className="text-xs mb-1">时间 到</div>
            <input
              type="date"
              className="border h-10 rounded px-2 w-full"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <button
            onClick={loadSummary}
            className="h-10 bg-slate-900 text-white rounded"
          >
            加载多维对账
          </button>
        </div>

        {/* movement/ref/trace */}
        {!summary ? (
          <div className="text-xs text-slate-500">
            请选择时间窗口并点击“加载多维对账”
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
            {/* movement summary */}
            <div>
              <div className="font-bold mb-2">按 movement_type</div>
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-500 text-[11px]">
                    <th className="px-2 py-1 text-left">movement</th>
                    <th className="px-2 py-1 text-right">count</th>
                    <th className="px-2 py-1 text-right">sum(delta)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(summary.movement_type || {}).map(
                    ([mt, r]) => (
                      <tr key={mt} className="border-b last:border-0">
                        <td className="px-2 py-1">{mt}</td>
                        <td className="px-2 py-1 text-right">
                          {r.count}
                        </td>
                        <td
                          className={`px-2 py-1 text-right ${
                            r.total_delta > 0
                              ? "text-emerald-600"
                              : r.total_delta < 0
                              ? "text-rose-600"
                              : ""
                          }`}
                        >
                          {r.total_delta}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* ref summary */}
            <div>
              <div className="font-bold mb-2">按 ref（单据）</div>
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-500 text-[11px]">
                    <th className="px-2 py-1 text-left">ref</th>
                    <th className="px-2 py-1 text-right">count</th>
                    <th className="px-2 py-1 text-right">sum(delta)</th>
                  </tr>
                </thead>
                <tbody>
                  {(summary.ref ?? []).map((r) => (
                    <tr key={r.ref} className="border-b last:border-0">
                      <td className="px-2 py-1 break-all">{r.ref}</td>
                      <td className="px-2 py-1 text-right">
                        {r.cnt}
                      </td>
                      <td
                        className={`px-2 py-1 text-right ${
                          r.total_delta > 0
                            ? "text-emerald-600"
                            : r.total_delta < 0
                            ? "text-rose-600"
                            : ""
                        }`}
                      >
                        {r.total_delta}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* trace summary */}
            <div>
              <div className="font-bold mb-2">按 trace</div>
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-500 text-[11px]">
                    <th className="px-2 py-1 text-left">trace</th>
                    <th className="px-2 py-1 text-right">count</th>
                    <th className="px-2 py-1 text-right">sum(delta)</th>
                  </tr>
                </thead>
                <tbody>
                  {(summary.trace ?? []).map((r) => (
                    <tr key={r.trace_id} className="border-b last:border-0">
                      <td className="px-2 py-1 break-all">
                        <a
                          className="text-sky-700 underline"
                          href={`/trace?trace_id=${encodeURIComponent(
                            r.trace_id,
                          )}`}
                        >
                          {r.trace_id}
                        </a>
                      </td>
                      <td className="px-2 py-1 text-right">
                        {r.cnt}
                      </td>
                      <td
                        className={`px-2 py-1 text-right ${
                          r.total_delta > 0
                            ? "text-emerald-600"
                            : r.total_delta < 0
                            ? "text-rose-600"
                            : ""
                        }`}
                      >
                        {r.total_delta}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </SectionCard>

      {/* ===================== 三账一致性 ===================== */}
      <SectionCard
        title="三账一致性：ledger / stocks / snapshot v3"
        description="ledger-cut 与 stocks / snapshot 的差异对比"
        className="p-6 space-y-4"
      >
        <div className="flex gap-4 items-end">
          <div>
            <div className="text-xs mb-1">Cut 时间</div>
            <input
              type="date"
              className="border h-10 rounded px-2"
              value={cut}
              onChange={(e) => setCut(e.target.value)}
            />
          </div>

          <button
            onClick={loadThreeBooks}
            className="h-10 bg-indigo-700 text-white rounded px-4"
          >
            三账对账
          </button>
        </div>

        {!three ? (
          <div className="text-xs text-slate-500">尚无结果</div>
        ) : (
          <div className="text-xs bg-slate-50 p-4 rounded max-h-[60vh] overflow-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 text-[11px] text-slate-600 border-b">
                  <th className="px-2 py-1 text-left">WH</th>
                  <th className="px-2 py-1 text-left">Item</th>
                  <th className="px-2 py-1 text-left">Batch</th>
                  <th className="px-2 py-1 text-right">Ledger</th>
                  <th className="px-2 py-1 text-right">Stocks</th>
                  <th className="px-2 py-1 text-right">Snapshot</th>
                  <th className="px-2 py-1 text-right">Δ Stocks</th>
                  <th className="px-2 py-1 text-right">Δ Snapshot</th>
                </tr>
              </thead>
              <tbody>
                {(three.books ?? []).map((r, idx) => {
                  const diffStock = r.diff_stock;
                  const diffSnap = r.diff_snapshot;
                  return (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="px-2 py-1">{r.warehouse_id}</td>
                      <td className="px-2 py-1">{r.item_id}</td>
                      <td className="px-2 py-1">{r.batch_code}</td>
                      <td className="px-2 py-1 text-right">
                        {r.ledger_qty}
                      </td>
                      <td className="px-2 py-1 text-right">
                        {r.stock_qty}
                      </td>
                      <td className="px-2 py-1 text-right">
                        {r.snapshot_qty}
                      </td>
                      <td
                        className={`px-2 py-1 text-right ${
                          diffStock !== 0 ? "text-rose-600 font-bold" : ""
                        }`}
                      >
                        {diffStock}
                      </td>
                      <td
                        className={`px-2 py-1 text-right ${
                          diffSnap !== 0 ? "text-rose-600 font-bold" : ""
                        }`}
                      >
                        {diffSnap}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* ===================== 时间线跳转入口 ===================== */}
      <SectionCard
        title="事件时间线（Ledger Timeline）"
        description="查看事件顺序 / 并发 / 链路异常"
        className="p-6 space-y-3"
      >
        <a
          href="/tools/ledger-timeline"
          className="text-sky-700 underline text-sm"
        >
          打开 Ledger Timeline →
        </a>
      </SectionCard>
    </div>
  );
};

export default LedgerCockpitPage;
