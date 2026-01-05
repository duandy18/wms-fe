// src/features/operations/inbound/scan-work/ScanHistoryCard.tsx

import React, { useMemo } from "react";
import type { InboundCockpitController, InboundScanHistoryEntry } from "../types";

function formatTs(ts: string | null | undefined): string {
  return ts ? ts.replace("T", " ").replace("Z", "") : "-";
}

function statusLabel(x: InboundScanHistoryEntry): string {
  return x.ok ? "成功" : "失败";
}

export const ScanHistoryCard: React.FC<{
  c: InboundCockpitController;
  limit?: number;
}> = ({ c, limit = 10 }) => {
  const items = useMemo(() => {
    const h = c.history ?? [];
    return h.slice(0, limit);
  }, [c.history, limit]);

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">最近扫码</h2>
        <span className="text-[11px] text-slate-500">最近 {items.length} 条</span>
      </div>

      {items.length === 0 ? (
        <div className="text-xs text-slate-500">暂无扫码记录。</div>
      ) : (
        <ul className="space-y-2 text-xs">
          {items.map((x) => {
            const badgeCls = x.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800";

            return (
              <li key={x.id} className="rounded-lg border border-slate-200 p-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-700">{x.barcode || "（空）"}</span>
                  <span className="text-[11px] text-slate-500">{formatTs(x.ts)}</span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] ${badgeCls}`}>
                    {statusLabel(x)}
                  </span>

                  <span className="text-[11px] text-slate-600">
                    本次累加：<span className="font-mono">{x.qty}</span>
                  </span>
                </div>

                {!x.ok && x.error ? (
                  <div className="mt-1 text-slate-600">{x.error}</div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
