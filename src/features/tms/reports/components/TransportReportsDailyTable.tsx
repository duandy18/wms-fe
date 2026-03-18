// src/features/tms/reports/components/TransportReportsDailyTable.tsx

import React from "react";
import type { CostAnalysisByTimeRow } from "../types";

function formatMoney(value: number): string {
  return `￥${value.toFixed(2)}`;
}

interface Props {
  rows: CostAnalysisByTimeRow[];
}

const TransportReportsDailyTable: React.FC<Props> = ({ rows }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-800">按时间统计</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left text-slate-600">日期</th>
              <th className="px-3 py-2 text-right text-slate-600">票数</th>
              <th className="px-3 py-2 text-right text-slate-600">总成本</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr key={row.bucket} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{row.bucket}</td>
                  <td className="px-3 py-2 text-right font-mono text-xs">
                    {row.ticket_count}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs">
                    {formatMoney(row.total_cost)}
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-t border-slate-100">
                <td
                  colSpan={3}
                  className="px-3 py-6 text-center text-sm text-slate-500"
                >
                  暂无数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TransportReportsDailyTable;
