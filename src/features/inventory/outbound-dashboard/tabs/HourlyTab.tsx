// src/features/inventory/outbound-dashboard/tabs/HourlyTab.tsx
import React from "react";
import { SectionCard } from "../../../../components/wmsdu/SectionCard";
import { BarChartSimple } from "../../../../components/wmsdu/BarChartSimple";
import { DataTable, type ColumnDef } from "../../../../components/wmsdu/DataTable";
import { type OutboundToday, type DistributionPoint } from "../types";

type HourlyTabProps = {
  today: OutboundToday | null;
};

export const HourlyTab: React.FC<HourlyTabProps> = ({ today }) => {
  if (!today || !today.distribution || today.distribution.length === 0) {
    return (
      <div className="mt-4 text-xs text-slate-400">
        当前日期暂无按小时分布数据。
      </div>
    );
  }

  const chartData = today.distribution.map((d) => ({
    label: d.hour,
    value: d.orders,
  }));

  const columns: ColumnDef<DistributionPoint>[] = [
    { key: "hour", header: "小时", align: "center" },
    { key: "orders", header: "订单量", align: "right" },
    { key: "pick_qty", header: "拣货件数", align: "right" },
  ];

  return (
    <div className="space-y-4 mt-4">
      <SectionCard title="订单量（小时分布）">
        <BarChartSimple data={chartData} valueSuffix="单" height={260} />
      </SectionCard>

      <SectionCard title="明细表">
        <DataTable
          columns={columns}
          rows={today.distribution}
          emptyText="暂无分布数据。"
        />
      </SectionCard>
    </div>
  );
};
