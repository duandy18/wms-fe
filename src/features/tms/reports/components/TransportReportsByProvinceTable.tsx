// src/features/tms/reports/components/TransportReportsByProvinceTable.tsx

import React from "react";
import type { ShippingByProvinceRow } from "../types";

function formatMoney(value: number): string {
  return `￥${value.toFixed(2)}`;
}

interface Props {
  rows: ShippingByProvinceRow[];
}

const TransportReportsByProvinceTable: React.FC<Props> = ({ rows }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-800">按省份统计</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left text-slate-600">省份</th>
              <th className="px-3 py-2 text-right text-slate-600">单量</th>
              <th className="px-3 py-2 text-right text-slate-600">总费用</th>
              <th className="px-3 py-2 text-right text-slate-600">均单费用</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={`${row.province ?? "null"}-${idx}`} className="border-t border-slate-100">
                <td className="px-3 py-2 text-xs">{row.province ?? "-"}</td>
                <td className="px-3 py-2 text-right font-mono text-xs">{row.ship_cnt}</td>
                <td className="px-3 py-2 text-right font-mono text-xs">{formatMoney(row.total_cost)}</td>
                <td className="px-3 py-2 text-right font-mono text-xs">{formatMoney(row.avg_cost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TransportReportsByProvinceTable;
