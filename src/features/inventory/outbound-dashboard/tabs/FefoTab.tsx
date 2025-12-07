// src/features/inventory/outbound-dashboard/tabs/FefoTab.tsx
import React from "react";
import { SectionCard } from "../../../../components/wmsdu/SectionCard";
import { BarChartSimple } from "../../../../components/wmsdu/BarChartSimple";
import { DataTable, type ColumnDef } from "../../../../components/wmsdu/DataTable";
import {
  type FefoRiskResponse,
  type FefoItemRisk,
} from "../types";

type FefoTabProps = {
  data: FefoRiskResponse | null;
};

export const FefoTab: React.FC<FefoTabProps> = ({ data }) => {
  const rows = data?.items ?? [];

  const columns: ColumnDef<FefoItemRisk>[] = [
    { key: "item_id", header: "Item ID" },
    { key: "sku", header: "SKU" },
    { key: "name", header: "名称" },
    {
      key: "near_expiry_batches",
      header: "临期批次",
      align: "right",
    },
    {
      key: "fefo_hit_rate_7d",
      header: "7 日 FEFO 命中率",
      align: "right",
      render: (row) => `${row.fefo_hit_rate_7d.toFixed(1)}%`,
    },
    {
      key: "risk_score",
      header: "风险评分",
      align: "right",
    },
  ];

  const chartData = rows.slice(0, 10).map((r) => ({
    label: r.sku || String(r.item_id),
    value: r.risk_score,
  }));

  return (
    <div className="space-y-4 mt-4">
      <SectionCard title="Top 风险 SKU（风险评分）">
        <BarChartSimple data={chartData} height={260} />
      </SectionCard>

      <SectionCard title="FEFO 风险明细">
        <DataTable
          columns={columns}
          rows={rows}
          emptyText="近期没有 FEFO 风险数据。"
        />
      </SectionCard>
    </div>
  );
};
