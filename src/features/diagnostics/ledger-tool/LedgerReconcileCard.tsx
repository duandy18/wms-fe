// src/features/diagnostics/ledger-tool/LedgerReconcileCard.tsx
import React from "react";
import { SectionCard } from "../../../components/wmsdu/SectionCard";
import type { LedgerReconcileResult } from "./types";

type Props = {
  reconcile: LedgerReconcileResult | null;
};

export const LedgerReconcileCard: React.FC<Props> = ({ reconcile }) => {
  const hasRows = !!reconcile && reconcile.rows?.length > 0;

  return (
    <SectionCard
      title="台账对账结果（SUM(delta) vs stocks.qty）"
      description="仅展示在当前过滤条件 + 时间窗口内，台账累计变动与库存余额不一致的 (warehouse_id, item_id, batch_code)。"
      className="rounded-none p-6 md:p-7 space-y-4"
    >
      {reconcile ? (
        hasRows ? (
          <div className="overflow-x-auto text-sm">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b bg-slate-50 text-xs text-slate-500">
                  <th className="px-3 py-1 text-left">warehouse_id</th>
                  <th className="px-3 py-1 text-left">item_id</th>
                  <th className="px-3 py-1 text-left">batch_code</th>
                  <th className="px-3 py-1 text-right">ledger_sum_delta</th>
                  <th className="px-3 py-1 text-right">stock_qty</th>
                  <th className="px-3 py-1 text-right">diff</th>
                  <th className="px-3 py-1 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {reconcile.rows.map((r) => (
                  <tr
                    key={`${r.warehouse_id}-${r.item_id}-${r.batch_code}`}
                    className="border-b last:border-0"
                  >
                    <td className="px-3 py-1">{r.warehouse_id}</td>
                    <td className="px-3 py-1">{r.item_id}</td>
                    <td className="px-3 py-1">{r.batch_code}</td>
                    <td className="px-3 py-1 text-right">
                      {r.ledger_sum_delta}
                    </td>
                    <td className="px-3 py-1 text-right">{r.stock_qty}</td>
                    <td className="px-3 py-1 text-right">
                      <span
                        className={
                          r.diff === 0
                            ? "text-slate-700"
                            : "text-rose-600 font-semibold"
                        }
                      >
                        {r.diff}
                      </span>
                    </td>
                    <td className="px-3 py-1 text-right">
                      <div className="flex justify-end gap-1 text-[11px]">
                        <a
                          href={`/tools/stocks?item_id=${r.item_id}&warehouse_id=${r.warehouse_id}&batch_code=${encodeURIComponent(
                            r.batch_code,
                          )}`}
                          className="inline-flex items-center rounded border border-slate-300 px-2 py-0.5 text-[11px] text-slate-700 hover:bg-slate-50"
                        >
                          看库存
                        </a>
                        <a
                          href={`/tools/ledger?warehouse_id=${r.warehouse_id}&item_id=${r.item_id}&batch_code=${encodeURIComponent(
                            r.batch_code,
                          )}`}
                          className="inline-flex items-center rounded border border-slate-300 px-2 py-0.5 text-[11px] text-slate-700 hover:bg-slate-50"
                        >
                          批次流水
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-xs text-emerald-700">
            当前过滤条件 + 时间窗口下，台账与库存一致（无不平记录）。
          </div>
        )
      ) : (
        <div className="text-xs text-slate-500">
          尚未执行对账。请先点击顶部「对账」按钮，按当前过滤条件进行一次对账检查。
        </div>
      )}
    </SectionCard>
  );
};
