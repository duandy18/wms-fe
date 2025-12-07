// src/features/diagnostics/intelligence-dashboard/PredictionCard.tsx
import React from "react";
import { SectionCard } from "../../../components/wmsdu/SectionCard";
import type { PredictionResult } from "./api";

type PredictionProps = {
  warehouseId: string;
  setWarehouseId: (v: string) => void;
  itemId: string;
  setItemId: (v: string) => void;
  days: string;
  setDays: (v: string) => void;
  prediction: PredictionResult | null;
  loading: boolean;
  onRun: () => void;
};

export const PredictionCard: React.FC<PredictionProps> = ({
  warehouseId,
  setWarehouseId,
  itemId,
  setItemId,
  days,
  setDays,
  prediction,
  loading,
  onRun,
}) => {
  return (
    <SectionCard
      title="库存预测（基于近 30 天出库）"
      description="简单的趋势外推：future_qty = current - avg_daily_outbound * days"
      className="h-full p-6 space-y-4"
    >
      <div className="flex flex-wrap gap-2 text-xs">
        <input
          className="border rounded h-9 px-2 w-24"
          placeholder="WH ID"
          value={warehouseId}
          onChange={(e) => setWarehouseId(e.target.value)}
        />
        <input
          className="border rounded h-9 px-2 w-28"
          placeholder="Item ID"
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
        />
        <input
          className="border rounded h-9 px-2 w-20"
          placeholder="天数"
          value={days}
          onChange={(e) => setDays(e.target.value)}
        />
        <button
          onClick={onRun}
          disabled={loading || !warehouseId || !itemId}
          className="inline-flex items-center rounded bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {loading ? "预测中..." : "预测"}
        </button>
      </div>

      {!prediction ? (
        <div className="text-xs text-slate-500">
          请输入仓库 ID 与 Item ID，并点击「预测」。
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-4 text-xs">
          <div>
            <div className="text-slate-500 mb-1">当前库存</div>
            <div className="font-mono text-lg">
              {prediction.current_qty}
            </div>
          </div>
          <div>
            <div className="text-slate-500 mb-1">日均出库</div>
            <div className="font-mono text-lg">
              {prediction.avg_daily_outbound.toFixed(1)}
            </div>
          </div>
          <div>
            <div className="text-slate-500 mb-1">
              未来 {prediction.days} 天预测库存
            </div>
            <div className="font-mono text-lg">
              {prediction.predicted_qty}
            </div>
          </div>
          <div>
            <div className="text-slate-500 mb-1">缺货风险</div>
            <div
              className={
                prediction.risk === "OOS"
                  ? "font-mono text-lg text-rose-600"
                  : "font-mono text-lg text-emerald-600"
              }
            >
              {prediction.risk}
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
};
