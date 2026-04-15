// src/features/purchase-orders/PurchaseOrderReceiptsPanel.tsx

import React, { useEffect, useState } from "react";
import {
  fetchPurchaseOrderCompletionDetail,
  type PurchaseOrderCompletionDetail,
  type PurchaseOrderCompletionEvent,
} from "./api";

function fmtDate(v: string | null | undefined): string {
  if (!v) return "—";
  return String(v).slice(0, 10);
}

function fmtDateTime(v: string | null | undefined): string {
  if (!v) return "—";
  return String(v).replace("T", " ").replace("Z", "");
}

function formatCompletionStatus(v: string | null | undefined): string {
  const s = String(v || "").trim().toUpperCase();
  switch (s) {
    case "NOT_RECEIVED":
      return "未收";
    case "PARTIAL":
      return "部分完成";
    case "RECEIVED":
      return "已完成";
    default:
      return s || "—";
  }
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
        const msg = e instanceof Error ? e.message : "加载正式收货事实失败";
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
  const events: PurchaseOrderCompletionEvent[] = detail?.receipt_events ?? [];
  const totalEvents = events.length;

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">正式收货事实</h2>
          <p className="mt-1 text-sm text-slate-500">
            本区只展示正式采购入库事件；采购完成情况大卡与行级完成情况已从详情页收口。
          </p>
        </div>

        <div className="text-sm text-slate-600">
          {loading ? (
            "加载中…"
          ) : err ? (
            <span className="text-red-600">{err}</span>
          ) : summary ? (
            <>
              计划 {summary.total_ordered_base} / 已收 {summary.total_received_base} / 剩余{" "}
              {summary.total_remaining_base} / 状态 {formatCompletionStatus(summary.completion_status)}
            </>
          ) : (
            "暂无摘要"
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-slate-800">事件列表</div>
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
                <td colSpan={9} className="px-3 py-8 text-center text-slate-400">
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
    </section>
  );
};
