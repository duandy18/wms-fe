// src/features/inventory/outbound-dashboard/tabs/TrendsTab.tsx
import React from "react";
import { SectionCard } from "../../../../components/wmsdu/SectionCard";
import { TrendChart } from "../../../../components/wmsdu/TrendChart";
import { type RangeResponse, type RangeDaySummary } from "../types";

type TrendsTabProps = {
  range: RangeResponse | null;
};

export const TrendsTab: React.FC<TrendsTabProps> = ({ range }) => {
  if (!range || !range.days || range.days.length === 0) {
    return (
      <div className="mt-4 text-xs text-slate-400">暂无趋势数据。</div>
    );
  }

  const mk = (getter: (d: RangeDaySummary) => number) =>
    range.days.map((d) => ({
      label: d.day.slice(5),
      value: getter(d),
    }));

  const successTrend = mk((d) => d.success_rate);
  const fefoTrend = mk((d) => d.fefo_hit_rate);
  const fallbackTrend = mk((d) => d.fallback_rate);

  return (
    <div className="space-y-4 mt-4">
      <SectionCard title="成功率（%）" description="最近 N 天出库成功率。">
        <TrendChart data={successTrend} valueSuffix="%" height={260} />
      </SectionCard>

      <SectionCard title="FEFO 命中率（%）" description="最近 N 天 FEFO 命中率。">
        <TrendChart data={fefoTrend} valueSuffix="%" height={260} />
      </SectionCard>

      <SectionCard title="fallback 比例（%）" description="最近 N 天走兜底路由的比例。">
        <TrendChart data={fallbackTrend} valueSuffix="%" height={260} />
      </SectionCard>
    </div>
  );
};
