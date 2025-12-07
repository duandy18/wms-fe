// src/features/dev/pick-tasks/DevPickTasksFefoCard.tsx

import React from "react";
import type { StockBatchRow } from "../DevPickTasksPanel";

interface Props {
  batchRows: StockBatchRow[];
  loading: boolean;
  error: string | null;
  activeItemId: number | null;
  activeWarehouseId: number | null;
  recommendedBatchCode: string | null;
  onUseRecommendedBatch: () => void;
}

export const DevPickTasksFefoCard: React.FC<Props> = ({
  batchRows,
  loading,
  error,
  activeItemId,
  activeWarehouseId,
  recommendedBatchCode,
  onUseRecommendedBatch,
}) => {
  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-700">
          FEFO 批次视图（即时库存）
        </h3>
        {recommendedBatchCode && (
          <button
            type="button"
            onClick={onUseRecommendedBatch}
            className="inline-flex items-center rounded border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
          >
            使用推荐批次：{recommendedBatchCode}
          </button>
        )}
      </div>

      {activeItemId && activeWarehouseId ? (
        <div className="text-[11px] text-slate-600">
          item_id=<span className="font-mono">{activeItemId}</span> ·
          warehouse_id=<span className="font-mono">
            {activeWarehouseId}
          </span>
        </div>
      ) : (
        <div className="text-[11px] text-slate-500">
          当前任务缺少 item_id 或 warehouse_id，暂不展示批次。
        </div>
      )}

      {error && (
        <div className="text-[11px] text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-[11px] text-slate-500">批次加载中…</div>
      ) : batchRows.length === 0 ? (
        <div className="text-[11px] text-slate-500">
          暂无库存批次（qty ≠ 0），或尚未创建任务。
        </div>
      ) : (
        <div className="max-h-40 overflow-auto rounded border border-slate-200 bg-white">
          <table className="min-w-full border-collapse text-[11px]">
            <thead className="bg-slate-100">
              <tr>
                <th className="border-b border-slate-200 px-2 py-1 text-left">
                  batch_code
                </th>
                <th className="border-b border-slate-200 px-2 py-1 text-right">
                  qty
                </th>
                <th className="border-b border-slate-200 px-2 py-1 text-left">
                  expiry_date
                </th>
                <th className="border-b border-slate-200 px-2 py-1 text-right">
                  days_to_expiry
                </th>
              </tr>
            </thead>
            <tbody>
              {batchRows.map((b, idx) => {
                const isRecommended =
                  recommendedBatchCode &&
                  b.batch_code === recommendedBatchCode;
                const days = b.days_to_expiry ?? null;
                const riskClass =
                  days !== null && days < 0
                    ? "text-red-700"
                    : days !== null && days <= 30
                    ? "text-amber-700"
                    : "text-slate-700";

                return (
                  <tr
                    key={`${b.batch_code}-${idx}`}
                    className={
                      (isRecommended
                        ? "bg-sky-50"
                        : idx % 2 === 0
                        ? "bg-white"
                        : "bg-slate-50") + " "
                    }
                  >
                    <td className="border-b border-slate-100 px-2 py-1 font-mono">
                      {b.batch_code ?? "—"}
                    </td>
                    <td className="border-b border-slate-100 px-2 py-1 text-right font-mono">
                      {b.qty}
                    </td>
                    <td className="border-b border-slate-100 px-2 py-1 font-mono">
                      {b.expiry_date ?? "—"}
                    </td>
                    <td
                      className={
                        "border-b border-slate-100 px-2 py-1 text-right font-mono " +
                        riskClass
                      }
                    >
                      {days ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
