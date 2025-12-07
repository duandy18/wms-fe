// src/features/diagnostics/intelligence-dashboard/HealthScoreCard.tsx
import React from "react";
import { SectionCard } from "../../../components/wmsdu/SectionCard";
import type { Insights } from "./api";

type HealthScoreProps = {
  insights: Insights | null;
  overallScore: number | null;
};

export const HealthScoreCard: React.FC<HealthScoreProps> = ({
  insights,
  overallScore,
}) => {
  return (
    <SectionCard
      title="全局健康评分"
      description="综合 inventory / ledger / snapshot 的整体健康指数"
      className="h-full p-6 space-y-4"
    >
      {overallScore == null || !insights ? (
        <div className="text-xs text-slate-500">
          暂无数据，请点击右上角“刷新数据”。
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-4xl font-bold text-slate-900">
            {overallScore}
            <span className="text-base font-normal text-slate-500">
              /100
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <div className="text-slate-500 mb-1">库存结构健康</div>
              <div className="font-mono text-sm">
                {(insights.inventory_health_score * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-slate-500 mb-1">库存准确率</div>
              <div className="font-mono text-sm">
                {(insights.inventory_accuracy_score * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-slate-500 mb-1">快照准确率</div>
              <div className="font-mono text-sm">
                {(insights.snapshot_accuracy_score * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
};
