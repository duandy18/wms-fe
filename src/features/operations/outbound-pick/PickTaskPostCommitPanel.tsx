// src/features/operations/outbound-pick/PickTaskPostCommitPanel.tsx
//
// 提交后链路信息面板：
// - 显示本次出库的 trace_id
// - Trace 事件时间线（精简版）
// - Ledger 台账摘要（关键字段）
// - Snapshot 批次视图（当前任务第一个商品）

import React from "react";
import type {
  ItemDetailResponse,
  ItemSlice,
} from "../../inventory/snapshot/api";
import type { TraceEvent } from "../../diagnostics/trace/types";
import type { LedgerRow } from "../../diagnostics/ledger-tool/types";

type PickPostCommitInfo = {
  traceEvents: TraceEvent[];
  ledgerRows: LedgerRow[];
  snapshot: ItemDetailResponse | null;
};

type Props = {
  traceId: string | null;
  info: PickPostCommitInfo | null;
  loading: boolean;
  error: string | null;
};

type SliceWithExpire = ItemSlice & {
  expire_at?: string | null;
};

const formatTsValue = (ts: string | Date | null | undefined): string => {
  if (!ts) return "-";
  if (ts instanceof Date) {
    return ts.toISOString().replace("T", " ").replace("Z", "");
  }
  if (typeof ts === "string") {
    return ts.replace("T", " ").replace("Z", "");
  }
  return "-";
};

export const PickTaskPostCommitPanel: React.FC<Props> = ({
  traceId,
  info,
  loading,
  error,
}) => {
  const traceEvents = info?.traceEvents ?? [];
  const ledgerRows = info?.ledgerRows ?? [];
  const snapshot = info?.snapshot ?? null;

  return (
    <div className="space-y-4 text-xs text-slate-700">
      {/* TraceId */}
      <div className="space-y-1">
        <div className="text-[11px] text-slate-500">trace_id</div>
        {traceId ? (
          <div className="break-all font-mono text-[11px]">
            {traceId}
          </div>
        ) : (
          <div className="text-[11px] text-slate-400">
            尚未生成 trace_id。提交出库时会自动生成。
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
          加载提交后链路信息失败：{error}
        </div>
      )}

      {loading && (
        <div className="text-[11px] text-slate-500">
          正在加载 Trace / Ledger / Snapshot…
        </div>
      )}

      {!loading && !info && !error && (
        <div className="text-[11px] text-slate-500">
          尚未执行 commit，或 commit 后信息尚未加载。
        </div>
      )}

      {info && !loading && (
        <>
          {/* Trace 摘要 */}
          <section className="space-y-2">
            <div className="text-[11px] font-semibold text-slate-600">
              Trace 事件（最近 20 条）
            </div>
            {traceEvents.length === 0 ? (
              <div className="text-[11px] text-slate-500">
                未查询到 Trace 事件。
              </div>
            ) : (
              <div className="max-h-40 overflow-auto rounded border border-slate-100 bg-slate-50">
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
                      const ts = formatTsValue(ev.ts ?? null);
                      const source = ev.source || "-";
                      const kind = ev.kind || "-";
                      const summary = ev.summary || ev.message || "";

                      return (
                        <tr
                          key={idx}
                          className="border-t border-slate-100 align-top"
                        >
                          <td className="whitespace-nowrap px-2 py-1">
                            {ts}
                          </td>
                          <td className="whitespace-nowrap px-2 py-1">
                            {source}
                          </td>
                          <td className="whitespace-nowrap px-2 py-1">
                            {kind}
                          </td>
                          <td className="px-2 py-1">
                            {summary || (
                              <span className="text-slate-400">
                                无摘要
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Ledger 摘要 */}
          <section className="space-y-2">
            <div className="text-[11px] font-semibold text-slate-600">
              Ledger 出库明细（按 trace_id 查询，最多 100 条）
            </div>
            {ledgerRows.length === 0 ? (
              <div className="text-[11px] text-slate-500">
                未查询到与该 trace_id 对应的台账记录。
              </div>
            ) : (
              <div className="max-h-40 overflow-auto rounded border border-slate-100 bg-slate-50">
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
                      const ts = formatTsValue(
                        (r as LedgerRow).occurred_at ??
                          (r as LedgerRow).created_at ??
                          null,
                      );

                      return (
                        <tr
                          key={r.id}
                          className="border-t border-slate-100 align-top"
                        >
                          <td className="whitespace-nowrap px-2 py-1">
                            {ts}
                          </td>
                          <td className="px-2 py-1 text-right font-mono">
                            {r.warehouse_id ?? "-"}
                          </td>
                          <td className="px-2 py-1 text-right font-mono">
                            {r.item_id ?? "-"}
                          </td>
                          <td className="px-2 py-1 font-mono">
                            {r.batch_code ?? "-"}
                          </td>
                          <td className="px-2 py-1 text-right font-mono">
                            {r.delta}
                          </td>
                          <td className="px-2 py-1 text-right font-mono">
                            {r.after_qty}
                          </td>
                          <td className="px-2 py-1">
                            {r.reason ?? "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Snapshot 批次视图摘要 */}
          <section className="space-y-2">
            <div className="text-[11px] font-semibold text-slate-600">
              Snapshot 批次视图（当前任务第一个商品）
            </div>
            {!snapshot ? (
              <div className="text-[11px] text-slate-500">
                暂未加载 Snapshot，或当前任务没有任何行。
              </div>
            ) : (
              <>
                <div className="text-[11px] text-slate-600">
                  商品：
                  <span className="font-mono">
                    #{snapshot.item_id} {snapshot.item_name ?? ""}
                  </span>
                  ，总库存 on_hand=
                  {snapshot.totals?.on_hand_qty ?? 0}，可用=
                  {snapshot.totals?.available_qty ?? 0}
                </div>
                <div className="max-h-40 overflow-auto rounded border border-slate-100 bg-slate-50">
                  <table className="min-w-full border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600">
                        <th className="px-2 py-1 text-left">仓库</th>
                        <th className="px-2 py-1 text-left">批次</th>
                        <th className="px-2 py-1 text-left">expire</th>
                        <th className="px-2 py-1 text-right">on_hand</th>
                        <th className="px-2 py-1 text-right">reserved</th>
                        <th className="px-2 py-1 text-right">available</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(snapshot.slices || []).map(
                        (s: SliceWithExpire, idx: number) => (
                          <tr
                            key={idx}
                            className="border-t border-slate-100 align-top"
                          >
                            <td className="px-2 py-1">
                              {s.warehouse_name ?? s.warehouse_id ?? "-"}
                            </td>
                            <td className="px-2 py-1 font-mono">
                              {s.batch_code ?? "-"}
                            </td>
                            <td className="px-2 py-1">
                              {s.expiry_date ?? s.expire_at ?? "-"}
                            </td>
                            <td className="px-2 py-1 text-right font-mono">
                              {s.on_hand_qty}
                            </td>
                            <td className="px-2 py-1 text-right font-mono">
                              {s.reserved_qty}
                            </td>
                            <td className="px-2 py-1 text-right font-mono">
                              {s.available_qty}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
};
