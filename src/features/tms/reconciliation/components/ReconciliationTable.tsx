// src/features/tms/reconciliation/components/ReconciliationTable.tsx

import React from "react";
import type { ApprovedReasonCode, ShippingBillReconciliationRow } from "../types";

interface Props {
  rows: ShippingBillReconciliationRow[];
  loading: boolean;
  error: string;
  approvingId: number | null;
  onApprove: (row: ShippingBillReconciliationRow) => void | Promise<void>;
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

function statusText(status: ShippingBillReconciliationRow["status"]): string {
  if (status === "diff") return "差异";
  return "账单上有，我方缺记录";
}

function approvedReasonCodeText(value: ApprovedReasonCode | null): string {
  if (value === "matched") return "已平";
  if (value === "approved_bill_only") return "账单上有，我方缺记录";
  if (value === "resolved") return "已解决";
  return "-";
}

function actionText(status: ShippingBillReconciliationRow["status"]): string {
  return status === "diff" ? "确认已解决" : "确认我方缺记录";
}

const ReconciliationTable: React.FC<Props> = ({
  rows,
  loading,
  error,
  approvingId,
  onApprove,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {!error && loading ? <div className="text-sm text-slate-500">正在加载对账表…</div> : null}
      {!error && !loading && rows.length === 0 ? (
        <div className="text-sm text-slate-500">暂无对账记录。</div>
      ) : null}

      {!error && rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-slate-600">状态</th>
                <th className="px-3 py-2 text-left text-slate-600">承运商</th>
                <th className="px-3 py-2 text-left text-slate-600">运单号</th>
                <th className="px-3 py-2 text-right text-slate-600">物流记录ID</th>
                <th className="px-3 py-2 text-right text-slate-600">账单明细ID</th>
                <th className="px-3 py-2 text-right text-slate-600">重量差</th>
                <th className="px-3 py-2 text-right text-slate-600">成本差</th>
                <th className="px-3 py-2 text-right text-slate-600">调整金额</th>
                <th className="px-3 py-2 text-left text-slate-600">确认结果</th>
                <th className="px-3 py-2 text-left text-slate-600">备注</th>
                <th className="px-3 py-2 text-left text-slate-600">确认时间</th>
                <th className="px-3 py-2 text-left text-slate-600">创建时间</th>
                <th className="px-3 py-2 text-left text-slate-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const approving = approvingId === row.reconciliation_id;

                return (
                  <tr key={row.reconciliation_id} className="border-t border-slate-100">
                    <td className="px-3 py-2 text-xs">{statusText(row.status)}</td>
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
                    <td className="px-3 py-2 font-mono text-xs">{formatDateTime(row.approved_at)}</td>
                    <td className="px-3 py-2 font-mono text-xs">{formatDateTime(row.created_at)}</td>
                    <td className="px-3 py-2 text-xs">
                      <button
                        type="button"
                        className="rounded-lg border border-sky-300 px-3 py-1 text-xs text-sky-700 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={() => void onApprove(row)}
                        disabled={approvingId !== null}
                      >
                        {approving ? "处理中…" : actionText(row.status)}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
};

export default ReconciliationTable;
