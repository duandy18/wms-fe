// src/features/diagnostics/intelligence-dashboard/BatchRiskCard.tsx
import React from "react";
import { SectionCard } from "../../../components/wmsdu/SectionCard";
import type { AgeingRow } from "./api";

type BatchRiskProps = { rows: AgeingRow[] };

export const BatchRiskCard: React.FC<BatchRiskProps> = ({ rows }) => {
  return (
    <SectionCard
      title="高风险批次（按过期天数升序）"
      description="最近 30 天内即将到期的批次"
      className="h-full p-6 space-y-4"
    >
      {rows.length === 0 ? (
        <div className="text-xs text-slate-500">暂无高风险批次。</div>
      ) : (
        <div className="text-xs">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b bg-slate-50 text-[11px] text-slate-500">
                <th className="px-2 py-1 text-left">WH</th>
                <th className="px-2 py-1 text-left">Item</th>
                <th className="px-2 py-1 text-left">Batch</th>
                <th className="px-2 py-1 text-right">D-left</th>
                <th className="px-2 py-1 text-right">Risk</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={`${r.warehouse_id}-${r.item_id}-${r.batch_code}`}
                  className="border-b last:border-0"
                >
                  <td className="px-2 py-1">{r.warehouse_id}</td>
                  <td className="px-2 py-1">{r.item_id}</td>
                  <td className="px-2 py-1">
                    {/* 点击 Batch → 跳转到 StockTool */}
                    <a
                      href={`/tools/stocks?warehouse_id=${r.warehouse_id}&item_id=${r.item_id}&batch_code=${encodeURIComponent(
                        r.batch_code,
                      )}`}
                      className="text-sky-700 hover:underline font-mono"
                    >
                      {r.batch_code}
                    </a>
                  </td>
                  <td className="px-2 py-1 text-right">
                    {r.days_left}
                  </td>
                  <td className="px-2 py-1 text-right">
                    <span
                      className={
                        r.risk_level === "HIGH"
                          ? "text-rose-600 font-semibold"
                          : r.risk_level === "MEDIUM"
                          ? "text-amber-600"
                          : "text-slate-700"
                      }
                    >
                      {r.risk_level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
};
