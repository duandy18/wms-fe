// src/features/tms/reconciliation/components/ReconciliationHistoryTable.tsx

import React from "react";
import type { ApprovedReasonCode, ShippingBillReconciliationHistoryRow } from "../types";

interface Props {
  rows: ShippingBillReconciliationHistoryRow[];
  loading: boolean;
  error: string;
}

function formatNumber(value: number | null): string {
  return value == null ? "-" : String(value);
}

function formatMoney(value: number | null): string {
  return value == null ? "-" : `￥${value.toFixed(2)}`;
}

function formatDateTime(value: string | null): string {
  if (!value) return "-";
  return value.replace("T", " ").replace("Z", "");
}

function resultStatusText(value: ShippingBillReconciliationHistoryRow["result_status"]): string {
  if (value === "matched") return "已平";
  if (value === "approved_bill_only") return "账单上有，我方缺记录";
  return "已解决";
}

function approvedReasonCodeText(value: ApprovedReasonCode): string {
  if (value === "matched") return "已平";
  if (value === "approved_bill_only") return "账单上有，我方缺记录";
  return "已解决";
}

const ReconciliationHistoryTable: React.FC<Props> = ({ rows, loading, error }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {!error && loading ? <div className="text-sm text-slate-500">正在加载历史表…</div> : null}
      {!error && !loading && rows.length === 0 ? (
        <div className="text-sm text-slate-500">暂无历史记录。</div>
      ) : null}

      {!error && rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-slate-600">归档结果</th>
                <th className="px-3 py-2 text-left text-slate-600">承运商</th>
                <th className="px-3 py-2 text-left text-slate-600">运单号</th>
                <th className="px-3 py-2 text-right text-slate-600">物流记录ID</th>
                <th className="px-3 py-2 text-right text-slate-600">账单明细ID</th>
                <th className="px-3 py-2 text-right text-slate-600">重量差</th>
                <th className="px-3 py-2 text-right text-slate-600">成本差</th>
                <th className="px-3 py-2 text-right text-slate-600">调整金额</th>
                <th className="px-3 py-2 text-left text-slate-600">确认原因</th>
                <th className="px-3 py-2 text-left text-slate-600">备注</th>
                <th className="px-3 py-2 text-left text-slate-600">归档时间</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 text-xs">{resultStatusText(row.result_status)}</td>
                  <td className="px-3 py-2 text-xs">{row.carrier_code}</td>
                  <td className="px-3 py-2 font-mono text-xs">{row.tracking_no}</td>
                  <td className="px-3 py-2 text-right font-mono text-xs">
                    {row.shipping_record_id ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs">
                    {row.carrier_bill_item_id}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs">
                    {formatNumber(row.weight_diff_kg)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs">
                    {formatMoney(row.cost_diff)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs">
                    {formatMoney(row.adjust_amount)}
                  </td>
                  <td className="px-3 py-2 text-xs">{approvedReasonCodeText(row.approved_reason_code)}</td>
                  <td className="px-3 py-2 text-xs">{row.approved_reason_text ?? "-"}</td>
                  <td className="px-3 py-2 font-mono text-xs">{formatDateTime(row.archived_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
};

export default ReconciliationHistoryTable;
