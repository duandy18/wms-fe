// src/components/wmsdu/TrendChart.tsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export type TrendPoint = { label: string; value: number };

type TrendChartProps = {
  data: TrendPoint[];
  valueSuffix?: string; // "%", "单" 等
  height?: number;
};

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  valueSuffix = "",
  height = 160,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-xs text-slate-400">暂无趋势数据。</div>
    );
  }

  const chartData = data.map((d) => ({
    label: d.label,
    value: d.value,
  }));

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "#6b7280" }}
          />
          <YAxis
            width={32}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "#6b7280" }}
          />
          <Tooltip
            formatter={(value: number | string | undefined) => [
              `${value ?? 0}${valueSuffix}`,
              "值",
            ]}
            labelFormatter={(l) => `日期: ${l}`}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#0ea5e9"
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
