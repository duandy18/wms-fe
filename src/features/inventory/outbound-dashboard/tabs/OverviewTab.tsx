// src/features/inventory/outbound-dashboard/tabs/OverviewTab.tsx
import React from "react";
import { SectionCard } from "../../../../components/wmsdu/SectionCard";
import { DataTable, type ColumnDef } from "../../../../components/wmsdu/DataTable";
import {
  type OutboundToday,
  type RangeResponse,
  type RangeDaySummary,
  type WarehouseResponse,
  type WarehouseMetric,
} from "../types";

type OverviewTabProps = {
  today: OutboundToday | null;
  range: RangeResponse | null;
  warehouses: WarehouseResponse | null;
};

export const OverviewTab: React.FC<OverviewTabProps> = ({
  today,
  range,
  warehouses,
}) => {
  const rangeRows = range?.days ?? [];
  const rangeColumns: ColumnDef<RangeDaySummary>[] = [
    { key: "day", header: "日期" },
    { key: "total_orders", header: "总单量", align: "right" },
    {
      key: "success_rate",
      header: "成功率",
      align: "right",
      render: (row) => `${row.success_rate.toFixed(1)}%`,
    },
    {
      key: "fallback_rate",
      header: "fallback 比例",
      align: "right",
      render: (row) => `${row.fallback_rate.toFixed(1)}%`,
    },
    {
      key: "fefo_hit_rate",
      header: "FEFO 命中率",
      align: "right",
      render: (row) => `${row.fefo_hit_rate.toFixed(1)}%`,
    },
  ];

  const whRows = warehouses?.warehouses ?? [];
  const whColumns: ColumnDef<WarehouseMetric>[] = [
    { key: "warehouse_id", header: "仓库 ID" },
    { key: "total_orders", header: "总单量", align: "right" },
    { key: "success_orders", header: "成功单量", align: "right" },
    {
      key: "success_rate",
      header: "成功率",
      align: "right",
      render: (row) => `${row.success_rate.toFixed(1)}%`,
    },
    { key: "pick_qty", header: "拣货件数", align: "right" },
  ];

  return (
    <div className="space-y-4 mt-4">
      <SectionCard
        title="最近 N 天摘要"
        description="按天汇总总单量、成功率、fallback 比例与 FEFO 命中率。"
      >
        <DataTable
          columns={rangeColumns}
          rows={rangeRows}
          emptyText="暂无摘要数据。"
        />
      </SectionCard>

      <SectionCard
        title="按仓库汇总"
        description="从仓库视角看出库表现。"
      >
        <DataTable
          columns={whColumns}
          rows={whRows}
          emptyText="当前日期没有按仓库拆分的出库记录。"
        />
      </SectionCard>

      {today && (
        <p className="text-[11px] text-slate-400">
          提示：详细趋势、按小时分布、失败诊断等维度请切换上方标签查看。
        </p>
      )}
    </div>
  );
};
