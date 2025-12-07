// src/features/diagnostics/intelligence-dashboard/WarehouseEfficiencyCard.tsx
import React from "react";
import { SectionCard } from "../../../components/wmsdu/SectionCard";
import type { Insights } from "./api";

type WarehouseEffProps = { insights: Insights | null };

export const WarehouseEfficiencyCard: React.FC<WarehouseEffProps> = ({
  insights,
}) => {
  return (
    <SectionCard
      title="仓库效率指数"
      description="基于台账事件中出库事件占比估算仓库作业效率"
      className="h-full p-6 space-y-4"
    >
      {!insights ? (
        <div className="text-xs text-slate-500">暂无数据。</div>
      ) : (
        <div className="space-y-3 text-xs">
          <div>
            <div className="text-slate-500 mb-1">出库事件占比</div>
            <div className="font-mono text-lg">
              {(insights.warehouse_efficiency * 100).toFixed(1)}%
            </div>
          </div>
          <div className="text-slate-500">
            出库事件占比越高，代表当前阶段「履约/发货」动作较多；若长期过低，可能表示系统更多停留在入库/调整阶段，需要进一步分析业务节奏。
          </div>
        </div>
      )}
    </SectionCard>
  );
};
