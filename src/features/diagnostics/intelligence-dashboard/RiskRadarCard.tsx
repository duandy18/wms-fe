// src/features/diagnostics/intelligence-dashboard/RiskRadarCard.tsx
import React from "react";
import { SectionCard } from "../../../components/wmsdu/SectionCard";
import type { Insights, AnomalyResult, AutohealResult } from "./api";

type RiskRadarProps = {
  insights: Insights | null;
  ageingCount: number;
  anomaly: AnomalyResult | null;
  autoheal: AutohealResult | null;
};

export const RiskRadarCard: React.FC<RiskRadarProps> = ({
  insights,
  ageingCount,
  anomaly,
  autoheal,
}) => {
  const ledgerStockAnom = anomaly?.ledger_vs_stocks?.length ?? 0;
  const ledgerSnapAnom = anomaly?.ledger_vs_snapshot?.length ?? 0;
  const autohealCount = autoheal?.count ?? 0;
  const batchRiskScore = insights?.batch_risk_score ?? 0;

  return (
    <SectionCard
      title="风险雷达"
      description="聚合展示库存相关的主要风险维度"
      className="h-full p-6 space-y-4"
    >
      {!insights ? (
        <div className="text-xs text-slate-500">暂无数据。</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <div className="text-slate-500">批次风险指数</div>
            <div className="font-mono text-sm">
              {(batchRiskScore * 100).toFixed(1)}%
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-slate-500">未来 30 天风险批次</div>
            <div className="font-mono text-sm">{ageingCount}</div>
          </div>
          <div className="space-y-1">
            <div className="text-slate-500">Ledger vs Stocks 异常</div>
            <div className="font-mono text-sm">{ledgerStockAnom}</div>
          </div>
          <div className="space-y-1">
            <div className="text-slate-500">Ledger vs Snapshot 异常</div>
            <div className="font-mono text-sm">{ledgerSnapAnom}</div>
          </div>
          <div className="space-y-1">
            <div className="text-slate-500">需要校正的槽位数</div>
            <div className="font-mono text-sm">{autohealCount}</div>
          </div>
        </div>
      )}
    </SectionCard>
  );
};
