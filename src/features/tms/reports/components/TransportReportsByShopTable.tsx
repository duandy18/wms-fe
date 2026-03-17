// src/features/tms/reports/components/TransportReportsByShopTable.tsx

import React from "react";
import type { ShippingByShopRow } from "../types";

function formatMoney(value: number): string {
  return `￥${value.toFixed(2)}`;
}

interface Props {
  rows: ShippingByShopRow[];
}

const TransportReportsByShopTable: React.FC<Props> = ({ rows }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-800">按店铺统计</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left text-slate-600">平台</th>
              <th className="px-3 py-2 text-left text-slate-600">店铺</th>
              <th className="px-3 py-2 text-right text-slate-600">单量</th>
              <th className="px-3 py-2 text-right text-slate-600">总费用</th>
              <th className="px-3 py-2 text-right text-slate-600">均单费用</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={`${row.platform}-${row.shop_id}-${idx}`} className="border-t border-slate-100">
                <td className="px-3 py-2 text-xs">{row.platform}</td>
                <td className="px-3 py-2 text-xs">{row.shop_id}</td>
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

export default TransportReportsByShopTable;
