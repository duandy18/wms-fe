// src/components/wmsdu/BarChartSimple.tsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export type BarPoint = { label: string; value: number };

type BarChartSimpleProps = {
  data: BarPoint[];
  valueSuffix?: string;
  height?: number;
};

export const BarChartSimple: React.FC<BarChartSimpleProps> = ({
  data,
  valueSuffix = "",
  height = 180,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-xs text-slate-400">暂无图表数据。</div>
    );
  }

  const chartData = data.map((d) => ({
    label: d.label,
    value: d.value,
  }));

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart
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
            formatter={(value: number | string) => [
              `${value}${valueSuffix}`,
              "值",
            ]}
            labelFormatter={(l) => `${l}`}
          />
          <Bar dataKey="value" fill="#38bdf8" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
