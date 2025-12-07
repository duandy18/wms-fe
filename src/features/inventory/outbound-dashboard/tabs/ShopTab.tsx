// src/features/inventory/outbound-dashboard/tabs/ShopTab.tsx
import React from "react";
import { SectionCard } from "../../../../components/wmsdu/SectionCard";
import { DataTable, type ColumnDef } from "../../../../components/wmsdu/DataTable";
import { type ShopResponse, type ShopMetric } from "../types";

type ShopTabProps = {
  data: ShopResponse | null;
};

export const ShopTab: React.FC<ShopTabProps> = ({ data }) => {
  const rows = data?.shops ?? [];
  const columns: ColumnDef<ShopMetric>[] = [
    { key: "shop_id", header: "店铺 ID" },
    { key: "total_orders", header: "总单量", align: "right" },
    { key: "success_orders", header: "成功单量", align: "right" },
    {
      key: "success_rate",
      header: "成功率",
      align: "right",
      render: (row) => `${row.success_rate.toFixed(1)}%`,
    },
    { key: "fallback_times", header: "fallback 次数", align: "right" },
    {
      key: "fallback_rate",
      header: "fallback 比例",
      align: "right",
      render: (row) => `${row.fallback_rate.toFixed(1)}%`,
    },
  ];

  return (
    <div className="mt-4">
      <SectionCard
        title="按店铺拆分出库指标"
        description="观察各店铺的订单量、成功率与 fallback 表现。"
      >
        <DataTable
          columns={columns}
          rows={rows}
          emptyText="当前日期没有按店铺拆分的出库记录。"
        />
      </SectionCard>
    </div>
  );
};
