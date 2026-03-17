// src/features/tms/records/components/ShippingLedgerTable.tsx

import React from "react";
import type { ShippingLedgerRow } from "../types";

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  return value.replace("T", " ").replace("Z", "");
}

function formatMoney(value: number | null | undefined): string {
  if (value == null) return "-";
  return `￥${value.toFixed(2)}`;
}

interface ShippingLedgerTableProps {
  rows: ShippingLedgerRow[];
  loading: boolean;
  error: string;
}

const ShippingLedgerTable: React.FC<ShippingLedgerTableProps> = ({
  rows,
  loading,
  error,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {!error && loading ? (
        <div className="text-sm text-slate-500">正在加载发货记录…</div>
      ) : null}

      {!error && !loading && rows.length === 0 ? (
        <div className="text-sm text-slate-500">暂无发货记录记录。</div>
      ) : null}

      {!error && rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">发货时间</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">订单号</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">运单号</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">承运商代码</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">承运商名称</th>
                <th className="px-3 py-2 text-right font-semibold text-slate-600">仓库ID</th>
                <th className="px-3 py-2 text-right font-semibold text-slate-600">承运商ID</th>
                <th className="px-3 py-2 text-right font-semibold text-slate-600">毛重(kg)</th>
                <th className="px-3 py-2 text-right font-semibold text-slate-600">预估费用</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">目的省</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">目的市</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs text-slate-700">
                    {formatDateTime(row.created_at)}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-700">
                    {row.order_ref}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-700">
                    {row.tracking_no ?? "-"}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-700">
                    {row.carrier_code ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-700">
                    {row.carrier_name ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs text-slate-700">
                    {row.warehouse_id ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs text-slate-700">
                    {row.shipping_provider_id ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs text-slate-700">
                    {row.gross_weight_kg ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs text-slate-700">
                    {formatMoney(row.cost_estimated)}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-700">
                    {row.dest_province ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-700">
                    {row.dest_city ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
};

export default ShippingLedgerTable;
