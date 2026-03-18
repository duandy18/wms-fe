// src/features/tms/reconciliation/components/ReconciliationTable.tsx

import React from "react";
import type { ShippingBillReconciliationRow } from "../types";

interface Props {
  rows: ShippingBillReconciliationRow[];
  loading: boolean;
  error: string;
  selectedId: number | null;
  onSelect: (reconciliationId: number) => void;
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
  if (status === "bill_only") return "仅账单";
  return "仅记录";
}

const ReconciliationTable: React.FC<Props> = ({
  rows,
  loading,
  error,
  selectedId,
  onSelect,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {!error && loading ? <div className="text-sm text-slate-500">正在加载异常列表…</div> : null}
      {!error && !loading && rows.length === 0 ? (
        <div className="text-sm text-slate-500">暂无异常记录。</div>
      ) : null}

      {!error && rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-slate-600">状态</th>
                <th className="px-3 py-2 text-left text-slate-600">承运商</th>
                <th className="px-3 py-2 text-left text-slate-600">运单号</th>
                <th className="px-3 py-2 text-right text-slate-600">计费重</th>
                <th className="px-3 py-2 text-right text-slate-600">台账重</th>
                <th className="px-3 py-2 text-right text-slate-600">重量差</th>
                <th className="px-3 py-2 text-right text-slate-600">账单实付</th>
                <th className="px-3 py-2 text-right text-slate-600">预估成本</th>
                <th className="px-3 py-2 text-right text-slate-600">成本差</th>
                <th className="px-3 py-2 text-left text-slate-600">创建时间</th>
                <th className="px-3 py-2 text-left text-slate-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isActive = selectedId === row.reconciliation_id;

                return (
                  <tr
                    key={row.reconciliation_id}
                    className={`border-t border-slate-100 ${isActive ? "bg-sky-50" : ""}`}
                  >
                    <td className="px-3 py-2 text-xs">{statusText(row.status)}</td>
                    <td className="px-3 py-2 text-xs">{row.carrier_code}</td>
                    <td className="px-3 py-2 font-mono text-xs">{row.tracking_no}</td>
                    <td className="px-3 py-2 text-right font-mono text-xs">
                      {formatNumber(row.billing_weight_kg)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-xs">
                      {formatNumber(row.gross_weight_kg)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-xs">
                      {formatNumber(row.weight_diff_kg)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-xs">
                      {formatMoney(row.bill_cost_real)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-xs">
                      {formatMoney(row.cost_estimated)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-xs">
                      {formatMoney(row.cost_diff)}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {formatDateTime(row.created_at)}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <button
                        type="button"
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                        onClick={() => onSelect(row.reconciliation_id)}
                      >
                        查看详情
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
