// src/features/dev/inbound/DevInboundPostCommitCard.tsx
// commit 后情报卡片：Trace 事件 + Ledger 明细 + Snapshot 批次视图

import React from "react";
import type { DevInboundController } from "./types";
import type { TraceEvent } from "../../diagnostics/trace/types";
import type { LedgerRow } from "../../diagnostics/ledger-tool/types";
import type { ItemDetailResponse, ItemSlice } from "../../inventory/snapshot/api";

interface Props {
  c: DevInboundController;
}

// 为了展示用的“宽松视图类型”，在核心 DTO 基础上补充可选字段
type TraceEventView = TraceEvent & {
  timestamp?: string | null;
  created_at?: string | null;
  time?: string | null;
  module?: string | null;
  service?: string | null;
  event_type?: string | null;
};

type LedgerRowView = LedgerRow & {
  occurred_at?: string | null;
  created_at?: string | null;
  ts?: string | null;
};

type SnapshotSliceView = ItemSlice & {
  expire_at?: string | null; // 兼容 exp 字段名
};

type SnapshotRowView = ItemDetailResponse & {
  slices?: SnapshotSliceView[];
};

const formatTsValue = (ts: string | Date | null | undefined): string => {
  if (!ts) return "-";
  if (ts instanceof Date) {
    return ts.toISOString().replace("T", " ").replace("Z", "");
  }
  return ts.replace("T", " ").replace("Z", "");
};

export const DevInboundPostCommitCard: React.FC<Props> = ({ c }) => {
  const info = c.postCommit;

  const traceEvents: TraceEventView[] = (info?.traceEvents ?? []) as TraceEventView[];
  const ledgerRows: LedgerRowView[] = (info?.ledgerRows ?? []) as LedgerRowView[];
  const snapshot = (info?.snapshot ?? null) as SnapshotRowView | null;

  const slices: SnapshotSliceView[] = Array.isArray(snapshot?.slices)
    ? [...(snapshot.slices as SnapshotSliceView[])].sort((a, b) => {
        const da = a.expire_at ? Date.parse(a.expire_at) : Number.POSITIVE_INFINITY;
        const db = b.expire_at ? Date.parse(b.expire_at) : Number.POSITIVE_INFINITY;
        return da - db;
      })
    : [];

  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">
          落账情报（Trace / Ledger / Snapshot）
        </h2>
        {c.loadingPostCommit && (
          <span className="text-[11px] text-slate-500">
            正在加载 Trace / Ledger / Snapshot…
          </span>
        )}
      </div>

      {!info ? (
        <div className="text-xs text-slate-500">
          还没有可展示的落账信息。执行一次 commit 后，这里会展示
          <span className="mx-1 font-mono">Trace / Ledger / Snapshot</span>
          的摘要。
        </div>
      ) : (
        <>
          {/* Trace 摘要 */}
          <div className="space-y-2">
            <div className="text-xs text-slate-600">
              当前 trace_id：
              {c.traceId ? (
                <span className="ml-1 font-mono">{c.traceId}</span>
              ) : (
                <span className="ml-1 text-slate-400">(未知)</span>
              )}
            </div>
            {traceEvents.length === 0 ? (
              <div className="text-xs text-slate-500">
                Trace 中暂未查询到事件。可前往 Trace 页面进一步确认。
              </div>
            ) : (
              <div className="max-h-40 overflow-y-auto rounded border border-slate-100 bg-slate-50">
                <table className="min-w-full border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600">
                      <th className="px-2 py-1 text-left">时间</th>
                      <th className="px-2 py-1 text-left">来源</th>
                      <th className="px-2 py-1 text-left">类型</th>
                      <th className="px-2 py-1 text-left">摘要</th>
                    </tr>
                  </thead>
                  <tbody>
                    {traceEvents.slice(-20).map((ev, idx) => {
                      const tsRaw = ev.ts ?? ev.timestamp ?? ev.created_at ?? ev.time ?? null;
                      const ts = formatTsValue(tsRaw);
                      const source = ev.source ?? ev.module ?? ev.service ?? "-";
                      const kind = ev.kind ?? ev.event_type ?? ev.type ?? "UNKNOWN";
                      const summary = ev.summary ?? ev.message ?? "";

                      return (
                        <tr key={idx} className="border-t border-slate-100 align-top">
                          <td className="whitespace-nowrap px-2 py-1">{ts}</td>
                          <td className="whitespace-nowrap px-2 py-1">{source}</td>
                          <td className="whitespace-nowrap px-2 py-1">{kind}</td>
                          <td className="px-2 py-1">
                            {summary || <span className="text-slate-400">无摘要</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Ledger 摘要 */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-700">
              Ledger 收货明细（按 trace_id 查询，最多 100 条）
            </div>
            {ledgerRows.length === 0 ? (
              <div className="text-xs text-slate-500">
                未查询到与该 trace_id 对应的台账记录。
              </div>
            ) : (
              <div className="max-h-40 overflow-y-auto rounded border border-slate-100 bg-slate-50">
                <table className="min-w-full border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600">
                      <th className="px-2 py-1 text-left">时间</th>
                      <th className="px-2 py-1 text-right">仓库</th>
                      <th className="px-2 py-1 text-right">Item</th>
                      <th className="px-2 py-1 text-left">批次</th>
                      <th className="px-2 py-1 text-right">Δqty</th>
                      <th className="px-2 py-1 text-right">after_qty</th>
                      <th className="px-2 py-1 text-left">reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerRows.map((r) => {
                      const tsRaw = r.occurred_at ?? r.created_at ?? r.ts;
                      const ts = formatTsValue(tsRaw);

                      return (
                        <tr key={r.id} className="border-t border-slate-100 align-top">
                          <td className="whitespace-nowrap px-2 py-1">{ts}</td>
                          <td className="px-2 py-1 text-right font-mono">
                            {r.warehouse_id ?? "-"}
                          </td>
                          <td className="px-2 py-1 text-right font-mono">
                            {r.item_id ?? "-"}
                          </td>
                          <td className="px-2 py-1 font-mono">{r.batch_code ?? "-"}</td>
                          <td className="px-2 py-1 text-right font-mono">{r.delta}</td>
                          <td className="px-2 py-1 text-right font-mono">{r.after_qty}</td>
                          <td className="px-2 py-1">{r.reason ?? "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Snapshot 摘要 */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-700">
              Snapshot 批次视图（示例：当前任务第一行的商品）
            </div>
            {!snapshot ? (
              <div className="text-xs text-slate-500">
                暂未加载 Snapshot，或当前任务没有任何行。
              </div>
            ) : (
              <>
                <div className="text-xs text-slate-600">
                  商品：
                  <span className="font-mono">
                    #{snapshot.item_id} {snapshot.item_name ?? ""}
                  </span>
                  ，总库存 on_hand={snapshot.totals.on_hand_qty}，可用=
                  {snapshot.totals.available_qty}
                </div>
                {slices.length === 0 ? (
                  <div className="text-xs text-slate-500">未查询到任何批次切片。</div>
                ) : (
                  <div className="max-h-40 overflow-y-auto rounded border border-slate-100 bg-slate-50">
                    <table className="min-w-full border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600">
                          <th className="px-2 py-1 text-left">仓库</th>
                          <th className="px-2 py-1 text-left">池</th>
                          <th className="px-2 py-1 text-left">批次</th>
                          <th className="px-2 py-1 text-left">expire</th>
                          <th className="px-2 py-1 text-right">on_hand</th>
                          <th className="px-2 py-1 text-right">available</th>
                        </tr>
                      </thead>
                      <tbody>
                        {slices.map((s, idx) => (
                          <tr key={idx} className="border-t border-slate-100 align-top">
                            <td className="px-2 py-1">
                              {s.warehouse_name ?? s.warehouse_id ?? "-"}
                            </td>
                            <td className="px-2 py-1">{s.pool ?? "-"}</td>
                            <td className="px-2 py-1 font-mono">{s.batch_code ?? "-"}</td>
                            <td className="px-2 py-1">{s.expire_at ?? "-"}</td>
                            <td className="px-2 py-1 text-right font-mono">{s.on_hand_qty}</td>
                            <td className="px-2 py-1 text-right font-mono">
                              {s.available_qty}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
};
