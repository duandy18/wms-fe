// src/features/inventory/ledger/components/LedgerTable.tsx
import React from "react";
import type { LedgerRow } from "../types";

type Props = {
  loading: boolean;
  rows: LedgerRow[];
};

function actionLabel(subReason: string | null): string {
  const x = (subReason ?? "").toUpperCase();
  if (!x) return "—";
  if (x === "PO_RECEIPT") return "采购入库";
  if (x === "RETURN_RECEIPT") return "退货入库";
  if (x === "COUNT_ADJUST") return "盘点确认";
  if (x === "ORDER_SHIP") return "订单出库";
  if (x === "INTERNAL_SHIP") return "内部出库";
  if (x === "RETURN_TO_VENDOR") return "退供应商出库";
  return subReason ?? "—";
}

function actionPillClass(subReason: string | null): string {
  const x = (subReason ?? "").toUpperCase();
  if (x === "PO_RECEIPT" || x === "RETURN_RECEIPT") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (x === "ORDER_SHIP" || x === "INTERNAL_SHIP" || x === "RETURN_TO_VENDOR") {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }
  if (x === "COUNT_ADJUST") {
    return "bg-slate-50 text-slate-700 border-slate-200";
  }
  return "bg-slate-50 text-slate-600 border-slate-200";
}

function canonLabel(v: string | null): string {
  const x = (v ?? "").toUpperCase();
  if (x === "RECEIPT") return "入库";
  if (x === "SHIPMENT") return "出库";
  if (x === "ADJUSTMENT") return "调整";
  return v ?? "-";
}

function movementLabel(v: string | null): string {
  const x = (v ?? "").toUpperCase();
  if (x === "INBOUND") return "入库";
  if (x === "OUTBOUND") return "出库";
  if (x === "COUNT") return "盘点";
  if (x === "ADJUST") return "调整";
  return v ?? "-";
}

export const LedgerTable: React.FC<Props> = ({ loading, rows }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="overflow-auto">
        <table className="min-w-[1180px] w-full text-sm">
          <thead className="sticky top-0 bg-slate-50 text-slate-700">
            <tr className="border-b">
              <th className="px-3 py-2 text-left">时间</th>
              <th className="px-3 py-2 text-left">动作</th>
              <th className="px-3 py-2 text-left">关联单据</th>
              <th className="px-3 py-2 text-right">单据行号</th>
              <th className="px-3 py-2 text-left">追溯号</th>
              <th className="px-3 py-2 text-right">仓库</th>
              <th className="px-3 py-2 text-right">商品ID</th>
              <th className="px-3 py-2 text-left">商品名</th>
              <th className="px-3 py-2 text-left">批次</th>
              <th className="px-3 py-2 text-right">变动</th>
              <th className="px-3 py-2 text-right">变动后</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="px-3 py-6 text-slate-500" colSpan={11}>
                  正在加载台账…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-slate-500" colSpan={11}>
                  当前条件下没有台账记录。
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const debugTitle = [
                  r.reason ? `reason=${r.reason}` : "",
                  `reason_canon=${canonLabel(r.reason_canon)}`,
                  `movement_type=${movementLabel(r.movement_type)}`,
                  r.sub_reason ? `sub_reason=${r.sub_reason}` : "",
                ]
                  .filter(Boolean)
                  .join(" | ");

                return (
                  <tr key={r.id} className="border-b last:border-b-0 hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono text-[12px] text-slate-700">{r.occurred_at}</td>

                    <td className="px-3 py-2" title={debugTitle}>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[12px] font-medium ${actionPillClass(
                          r.sub_reason ?? null,
                        )}`}
                      >
                        {actionLabel(r.sub_reason ?? null)}
                      </span>
                    </td>

                    <td className="px-3 py-2 font-mono text-[12px]">{r.ref ?? "-"}</td>
                    <td className="px-3 py-2 text-right font-mono">{r.ref_line ?? "-"}</td>
                    <td className="px-3 py-2 font-mono text-[12px]">{r.trace_id ?? "-"}</td>

                    <td className="px-3 py-2 text-right font-mono">{r.warehouse_id}</td>
                    <td className="px-3 py-2 text-right font-mono">{r.item_id}</td>

                    <td className="px-3 py-2 truncate max-w-[260px]" title={r.item_name ?? ""}>
                      {r.item_name ?? "-"}
                    </td>

                    <td className="px-3 py-2 font-mono text-[12px]">{r.batch_code ?? "-"}</td>

                    <td
                      className={`px-3 py-2 text-right font-mono ${
                        r.delta >= 0 ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {r.delta}
                    </td>

                    <td className="px-3 py-2 text-right font-mono">{r.after_qty}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
