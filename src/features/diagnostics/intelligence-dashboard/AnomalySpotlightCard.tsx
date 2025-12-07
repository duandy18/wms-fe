// src/features/diagnostics/intelligence-dashboard/AnomalySpotlightCard.tsx
import React from "react";
import { SectionCard } from "../../../components/wmsdu/SectionCard";
import type { AnomalyResult } from "./api";

type AnomalyProps = { rows: AnomalyResult["ledger_vs_stocks"] };

export const AnomalySpotlightCard: React.FC<AnomalyProps> = ({ rows }) => {
  return (
    <SectionCard
      title="异常聚光灯（Ledger vs Stocks）"
      description="优先关注库存余额与台账不一致的记录（点击行可跳转到库存切片）"
      className="h-full p-6 space-y-4"
    >
      {rows.length === 0 ? (
        <div className="text-xs text-slate-500">
          当前未发现 mismatch（Ledger vs Stocks）。
        </div>
      ) : (
        <div className="text-xs">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b bg-slate-50 text-[11px] text-slate-500">
                <th className="px-2 py-1 text-left">WH</th>
                <th className="px-2 py-1 text-left">Item</th>
                <th className="px-2 py-1 text-left">Batch</th>
                <th className="px-2 py-1 text-right">Ledger</th>
                <th className="px-2 py-1 text-right">Stocks</th>
                <th className="px-2 py-1 text-right">Diff</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const href = `/tools/stocks?warehouse_id=${r.wh}&item_id=${r.item}&batch_code=${encodeURIComponent(
                  r.batch,
                )}`;
                return (
                  <tr
                    key={`${r.wh}-${r.item}-${r.batch}`}
                    className="border-b last:border-0 hover:bg-sky-50 cursor-pointer"
                    onClick={() => {
                      window.location.href = href;
                    }}
                  >
                    <td className="px-2 py-1">{r.wh}</td>
                    <td className="px-2 py-1">{r.item}</td>
                    <td className="px-2 py-1 font-mono text-[11px]">
                      {r.batch}
                    </td>
                    <td className="px-2 py-1 text-right">{r.ledger}</td>
                    <td className="px-2 py-1 text-right">{r.stocks}</td>
                    <td className="px-2 py-1 text-right text-rose-600 font-semibold">
                      {r.diff}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
};
