// src/features/inventory/outbound-dashboard/tabs/WarehouseTab.tsx
import React from "react";
import { SectionCard } from "../../../../components/wmsdu/SectionCard";
import { DataTable, type ColumnDef } from "../../../../components/wmsdu/DataTable";
import {
  type WarehouseResponse,
  type WarehouseMetric,
} from "../types";

type WarehouseTabProps = {
  data: WarehouseResponse | null;
};

export const WarehouseTab: React.FC<WarehouseTabProps> = ({ data }) => {
  const rows = data?.warehouses ?? [];
  const columns: ColumnDef<WarehouseMetric>[] = [
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
    <div className="mt-4">
      <SectionCard
        title="按仓库拆分出库指标"
        description="观察各仓的订单量、成功率与拣货件数。"
      >
        <DataTable
          columns={columns}
          rows={rows}
          emptyText="当前日期没有按仓库拆分的出库记录。"
        />
      </SectionCard>
    </div>
  );
};
