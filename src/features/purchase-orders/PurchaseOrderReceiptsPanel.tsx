// src/features/purchase-orders/PurchaseOrderReceiptsPanel.tsx

import React, { useEffect, useMemo, useState } from "react";
import {
  fetchPurchaseOrderReceipts,
  type PurchaseOrderReceiptEvent,
} from "./api";

function fmtDate(v: string | null | undefined): string {
  if (!v) return "—";
  return String(v).slice(0, 10);
}

function fmtDateTime(v: string | null | undefined): string {
  if (!v) return "—";
  // 兼容 "2026-01-14T10:00:00Z"
  return String(v).replace("T", " ").replace("Z", "");
}

export const PurchaseOrderReceiptsPanel: React.FC<{ poId: number }> = ({ poId }) => {
  const [rows, setRows] = useState<PurchaseOrderReceiptEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const data = await fetchPurchaseOrderReceipts(poId);
        if (alive) setRows(Array.isArray(data) ? data : []);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "加载历史收货失败";
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

  const totalQty = useMemo(() => {
    return rows.reduce((s, r) => s + Number(r.qty ?? 0), 0);
  }, [rows]);

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">历史收货（事实）</h2>
        <div className="text-base text-slate-600">
          {loading ? (
            "加载中…"
          ) : err ? (
            <span className="text-red-600">{err}</span>
          ) : (
            `共 ${rows.length} 笔，数量合计 ${totalQty}`
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-base border-collapse">
          <thead>
            <tr className="text-slate-600 border-b">
              <th className="px-3 py-2 text-left">序号</th>
              <th className="px-3 py-2 text-left">时间</th>
              <th className="px-3 py-2 text-right">行号</th>
              <th className="px-3 py-2 text-right">商品ID</th>
              <th className="px-3 py-2 text-right">数量</th>
              <th className="px-3 py-2 text-left">批次</th>
              <th className="px-3 py-2 text-left">生产日期</th>
              <th className="px-3 py-2 text-left">到期日期</th>
              <th className="px-3 py-2 text-right">收后库存</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-slate-400">
                  {loading ? "加载中…" : "暂无收货记录"}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={`${r.ref}-${r.ref_line}`} className="border-b last:border-b-0">
                  <td className="px-3 py-2 font-mono">{r.ref_line}</td>
                  <td className="px-3 py-2">{fmtDateTime(r.occurred_at)}</td>
                  <td className="px-3 py-2 text-right font-mono">
                    {r.line_no ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-right font-mono">{r.item_id}</td>
                  <td className="px-3 py-2 text-right font-mono">{r.qty}</td>
                  <td className="px-3 py-2 font-mono">{r.batch_code}</td>
                  <td className="px-3 py-2 font-mono">{fmtDate(r.production_date)}</td>
                  <td className="px-3 py-2 font-mono">{fmtDate(r.expiry_date)}</td>
                  <td className="px-3 py-2 text-right font-mono">{r.after_qty}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-slate-500">
        说明：本表来自后端事实层（/purchase-orders/{poId}/receipts），用于审计与回看。
      </p>
    </section>
  );
};
