// src/components/wmsdu/MetricTrend.tsx
import React from "react";
import { cn } from "../../lib/utils";

type TrendPoint = {
  label: string; // 比如 "11-21"
  value: number; // 比如 95.3
};

type MetricTrendProps = {
  data: TrendPoint[];
  valueSuffix?: string; // 比如 "%"
  height?: number;      // 图表高度 px
  className?: string;
};

export const MetricTrend: React.FC<MetricTrendProps> = ({
  data,
  valueSuffix = "",
  height = 60,
  className,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={cn("text-xs text-slate-400", className)}>
        暂无趋势数据。
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value || 0)) || 1;

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className="flex items-end gap-1 border-b border-slate-100 pb-1"
        style={{ height }}
      >
        {data.map((d, idx) => {
          const h = Math.max(4, (d.value / max) * (height - 10));
          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center justify-end"
            >
              <div
                className={cn(
                  "w-full rounded-t bg-sky-500/70"
                )}
                style={{ height: h }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-slate-400">
        {data.map((d, idx) => (
          <div key={idx} className="flex-1 text-center truncate">
            {d.label}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-slate-500">
        <span>
          最低：{Math.min(...data.map((d) => d.value || 0)).toFixed(1)}
          {valueSuffix}
        </span>
        <span>
          最高：{Math.max(...data.map((d) => d.value || 0)).toFixed(1)}
          {valueSuffix}
        </span>
      </div>
    </div>
  );
};
