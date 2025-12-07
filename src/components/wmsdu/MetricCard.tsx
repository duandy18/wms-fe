// src/components/wmsdu/MetricCard.tsx

import React from "react";
import { Card } from "../ui/card";
import { cn } from "../../lib/utils";

type MetricCardProps = {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  variant?: "default" | "success" | "danger" | "muted";
  className?: string;
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  variant = "default",
  className,
}) => {
  let borderClass = "border-slate-200";
  if (variant === "success") borderClass = "border-emerald-500/40";
  if (variant === "danger") borderClass = "border-rose-500/40";

  return (
    <Card
      className={cn(
        "flex flex-col justify-center items-center rounded-xl border bg-white py-5 px-4 text-center shadow-sm",
        borderClass,
        className
      )}
    >
      {/* ⭐ 标题居中，字体更大 */}
      <div className="text-base font-semibold text-slate-700 mb-2 text-center">
        {title}
      </div>

      {/* ⭐ 数值居中（你说现在这样很好，保留） */}
      <div className="flex items-baseline justify-center gap-1">
        <div className="text-3xl font-bold text-slate-900">{value}</div>
        {unit && (
          <div className="text-base text-slate-500 font-medium">{unit}</div>
        )}
      </div>

      {/* ⭐ 副标题（可选） */}
      {subtitle && (
        <div className="mt-1 text-[11px] text-slate-500">{subtitle}</div>
      )}
    </Card>
  );
};
