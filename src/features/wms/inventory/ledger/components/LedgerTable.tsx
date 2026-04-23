// src/features/wms/inventory/ledger/components/LedgerTable.tsx
import React from "react";
import type { LedgerRow } from "../types";
import {
  actionLabel,
  actionPillClass,
  canonLabel,
  formatQtyWithUnit,
  movementLabel,
  reasonLabel,
  textOrDash,
} from "../ledgerDisplay";

type Props = {
  loading: boolean;
  rows: LedgerRow[];
};

export const LedgerTable: React.FC<Props> = ({ loading, rows }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="overflow-auto">
        <table className="min-w-[1260px] w-full text-sm">
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
              <th className="px-3 py-2 text-left">基础单位</th>
              <th className="px-3 py-2 text-right">变动</th>
              <th className="px-3 py-2 text-right">变动后</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="px-3 py-6 text-slate-500" colSpan={12}>
                  正在加载台账…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-slate-500" colSpan={12}>
                  当前条件下没有台账记录。
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const debugTitle = [
                  `reason=${reasonLabel(r.reason)} (${r.reason ?? "-"})`,
                  `reason_canon=${canonLabel(r.reason_canon ?? null)}`,
                  `movement_type=${movementLabel(r.movement_type ?? null)}`,
                  `sub_reason=${actionLabel(r.sub_reason ?? null)} (${r.sub_reason ?? "-"})`,
                ]
                  .filter(Boolean)
                  .join(" | ");

                return (
                  <tr key={r.id} className="border-b last:border-b-0 hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono text-[12px] text-slate-700">
                      {r.occurred_at}
                    </td>

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

                    <td className="max-w-[260px] truncate px-3 py-2" title={r.item_name ?? ""}>
                      {r.item_name ?? "-"}
                    </td>

                    <td className="px-3 py-2 font-mono text-[12px]">{r.batch_code ?? "-"}</td>

                    <td className="px-3 py-2">{textOrDash(r.base_uom_name)}</td>

                    <td
                      className={`px-3 py-2 text-right font-mono ${
                        r.delta >= 0 ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {formatQtyWithUnit(r.delta, r.base_uom_name)}
                    </td>

                    <td className="px-3 py-2 text-right font-mono">
                      {formatQtyWithUnit(r.after_qty, r.base_uom_name)}
                    </td>
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
