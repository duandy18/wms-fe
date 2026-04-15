// src/features/purchase-orders/PurchaseOrderReceiptsPanel.tsx

import React, { useEffect, useState } from "react";
import {
  fetchPurchaseOrderCompletionDetail,
  type PurchaseOrderCompletionDetail,
  type PurchaseOrderCompletionEvent,
  type PurchaseOrderCompletionLine,
} from "./api";

function fmtDate(v: string | null | undefined): string {
  if (!v) return "—";
  return String(v).slice(0, 10);
}

function fmtDateTime(v: string | null | undefined): string {
  if (!v) return "—";
  return String(v).replace("T", " ").replace("Z", "");
}

export const PurchaseOrderReceiptsPanel: React.FC<{ poId: number }> = ({ poId }) => {
  const [detail, setDetail] = useState<PurchaseOrderCompletionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const data = await fetchPurchaseOrderCompletionDetail(poId);
        if (alive) setDetail(data);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "加载采购完成情况失败";
        if (alive) setErr(msg);
      } finally {
        if (alive) setLoading(false);
      }
    }

    void load();
    return () => {
      alive = false;
    };
  }, [poId]);

  const summary = detail?.summary ?? null;
  const lines: PurchaseOrderCompletionLine[] = detail?.lines ?? [];
  const events: PurchaseOrderCompletionEvent[] = detail?.receipt_events ?? [];

  const totalLines = lines.length;
  const totalEvents = events.length;

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">采购完成情况</h2>
        <div className="text-base text-slate-600">
          {loading ? (
            "加载中…"
          ) : err ? (
            <span className="text-red-600">{err}</span>
          ) : summary ? (
            `计划 ${summary.total_ordered_base} / 已收 ${summary.total_received_base} / 剩余 ${summary.total_remaining_base}`
          ) : (
            "暂无数据"
          )}
        </div>
      </div>

      {summary ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs text-slate-500">采购单号</div>
            <div className="mt-1 font-mono text-slate-900">{summary.po_no}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs text-slate-500">完成状态</div>
            <div className="mt-1 font-semibold text-slate-900">{summary.completion_status}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs text-slate-500">计划数量</div>
            <div className="mt-1 font-mono text-slate-900">{summary.total_ordered_base}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs text-slate-500">已收数量</div>
            <div className="mt-1 font-mono text-slate-900">{summary.total_received_base}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs text-slate-500">剩余数量</div>
            <div className="mt-1 font-mono text-slate-900">{summary.total_remaining_base}</div>
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">行级完成情况</h3>
          <div className="text-sm text-slate-500">{loading ? "加载中…" : `共 ${totalLines} 行`}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-base border-collapse">
            <thead>
              <tr className="text-slate-600 border-b">
                <th className="px-3 py-2 text-left">行号</th>
                <th className="px-3 py-2 text-right">商品ID</th>
                <th className="px-3 py-2 text-left">商品</th>
                <th className="px-3 py-2 text-right">计划</th>
                <th className="px-3 py-2 text-right">已收</th>
                <th className="px-3 py-2 text-right">剩余</th>
                <th className="px-3 py-2 text-left">状态</th>
                <th className="px-3 py-2 text-left">最近收货时间</th>
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-400">
                    {loading ? "加载中…" : "暂无行级完成情况"}
                  </td>
                </tr>
              ) : (
                lines.map((r) => (
                  <tr key={r.po_line_id} className="border-b last:border-b-0">
                    <td className="px-3 py-2 font-mono">{r.line_no}</td>
                    <td className="px-3 py-2 text-right font-mono">{r.item_id}</td>
                    <td className="px-3 py-2">
                      <div className="font-medium text-slate-900">{r.item_name ?? "—"}</div>
                      <div className="text-xs text-slate-500 font-mono">{r.item_sku ?? "—"}</div>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{r.qty_ordered_base}</td>
                    <td className="px-3 py-2 text-right font-mono">{r.qty_received_base}</td>
                    <td className="px-3 py-2 text-right font-mono">{r.qty_remaining_base}</td>
                    <td className="px-3 py-2">{r.line_completion_status}</td>
                    <td className="px-3 py-2 font-mono">{fmtDateTime(r.last_received_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">正式收货事实</h3>
          <div className="text-sm text-slate-500">{loading ? "加载中…" : `共 ${totalEvents} 条`}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-base border-collapse">
            <thead>
              <tr className="text-slate-600 border-b">
                <th className="px-3 py-2 text-left">事件号</th>
                <th className="px-3 py-2 text-left">时间</th>
                <th className="px-3 py-2 text-right">行号</th>
                <th className="px-3 py-2 text-right">商品ID</th>
                <th className="px-3 py-2 text-right">数量</th>
                <th className="px-3 py-2 text-left">批次</th>
                <th className="px-3 py-2 text-left">生产日期</th>
                <th className="px-3 py-2 text-left">到期日期</th>
                <th className="px-3 py-2 text-left">trace_id</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-400">
                    {loading ? "加载中…" : "暂无正式收货事实"}
                  </td>
                </tr>
              ) : (
                events.map((r, idx) => (
                  <tr key={`${r.event_id}-${r.po_line_id}-${idx}`} className="border-b last:border-b-0">
                    <td className="px-3 py-2 font-mono">{r.event_no}</td>
                    <td className="px-3 py-2 font-mono">{fmtDateTime(r.occurred_at)}</td>
                    <td className="px-3 py-2 text-right font-mono">{r.line_no}</td>
                    <td className="px-3 py-2 text-right font-mono">{r.item_id}</td>
                    <td className="px-3 py-2 text-right font-mono">{r.qty_base}</td>
                    <td className="px-3 py-2 font-mono">{r.lot_code ?? "—"}</td>
                    <td className="px-3 py-2 font-mono">{fmtDate(r.production_date)}</td>
                    <td className="px-3 py-2 font-mono">{fmtDate(r.expiry_date)}</td>
                    <td className="px-3 py-2 font-mono">{r.trace_id}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-sm text-slate-500">
        说明：本面板来自正式完成情况接口（/purchase-orders/{`{poId}`}/completion），计划合同与完成情况已分离。
      </p>
    </section>
  );
};
