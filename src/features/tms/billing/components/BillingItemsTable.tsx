// src/features/tms/billing/components/BillingItemsTable.tsx

import React from "react";
import type { CarrierBillItem } from "../types";

function formatMoney(value: number | null): string {
  return value == null ? "-" : `￥${value.toFixed(2)}`;
}

function formatDateTime(value: string | null): string {
  if (!value) return "-";
  return value.replace("T", " ").replace("Z", "");
}

interface Props {
  rows: CarrierBillItem[];
  loading: boolean;
  error: string;
}

const BillingItemsTable: React.FC<Props> = ({ rows, loading, error }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {!error && loading ? <div className="text-sm text-slate-500">正在加载快递账单…</div> : null}
      {!error && !loading && rows.length === 0 ? (
        <div className="text-sm text-slate-500">暂无快递账单。</div>
      ) : null}

      {!error && rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-slate-600">批次 ID</th>
                <th className="px-3 py-2 text-left text-slate-600">批次号</th>
                <th className="px-3 py-2 text-left text-slate-600">承运商</th>
                <th className="px-3 py-2 text-left text-slate-600">运单号</th>
                <th className="px-3 py-2 text-left text-slate-600">业务时间</th>
                <th className="px-3 py-2 text-right text-slate-600">计费重</th>
                <th className="px-3 py-2 text-right text-slate-600">运费</th>
                <th className="px-3 py-2 text-right text-slate-600">附加费</th>
                <th className="px-3 py-2 text-right text-slate-600">总额</th>
                <th className="px-3 py-2 text-left text-slate-600">目的省</th>
                <th className="px-3 py-2 text-left text-slate-600">目的市</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{row.import_batch_id}</td>
                  <td className="px-3 py-2 text-xs">{row.import_batch_no}</td>
                  <td className="px-3 py-2 text-xs">{row.carrier_code}</td>
                  <td className="px-3 py-2 font-mono text-xs">{row.tracking_no}</td>
                  <td className="px-3 py-2 font-mono text-xs">{formatDateTime(row.business_time)}</td>
                  <td className="px-3 py-2 text-right font-mono text-xs">{row.billing_weight_kg ?? "-"}</td>
                  <td className="px-3 py-2 text-right font-mono text-xs">{formatMoney(row.freight_amount)}</td>
                  <td className="px-3 py-2 text-right font-mono text-xs">{formatMoney(row.surcharge_amount)}</td>
                  <td className="px-3 py-2 text-right font-mono text-xs">{formatMoney(row.total_amount)}</td>
                  <td className="px-3 py-2 text-xs">{row.destination_province ?? "-"}</td>
                  <td className="px-3 py-2 text-xs">{row.destination_city ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
};

export default BillingItemsTable;
