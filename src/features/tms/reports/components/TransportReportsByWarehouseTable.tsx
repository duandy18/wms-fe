// src/features/tms/reports/components/TransportReportsByWarehouseTable.tsx

import React from "react";
import type { ShippingByWarehouseRow } from "../types";

function formatMoney(value: number): string {
  return `￥${value.toFixed(2)}`;
}

interface Props {
  rows: ShippingByWarehouseRow[];
}

const TransportReportsByWarehouseTable: React.FC<Props> = ({ rows }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-800">按仓库统计</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left text-slate-600">仓库ID</th>
              <th className="px-3 py-2 text-right text-slate-600">单量</th>
              <th className="px-3 py-2 text-right text-slate-600">总费用</th>
              <th className="px-3 py-2 text-right text-slate-600">均单费用</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={`${row.warehouse_id ?? "null"}-${idx}`} className="border-t border-slate-100">
                <td className="px-3 py-2 font-mono text-xs">{row.warehouse_id ?? "-"}</td>
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

export default TransportReportsByWarehouseTable;
