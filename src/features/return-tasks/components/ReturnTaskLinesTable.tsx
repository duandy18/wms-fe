// src/features/return-tasks/components/ReturnTaskLinesTable.tsx

import React from "react";
import {
  StandardTable,
  type ColumnDef,
} from "../../../components/wmsdu/StandardTable";
import type { ReturnTaskLine } from "../api";

export const ReturnTaskLinesTable: React.FC<{
  lines: ReturnTaskLine[];
}> = ({ lines }) => {
  const columns: ColumnDef<ReturnTaskLine>[] = [
    {
      key: "item_id",
      header: "Item ID",
      render: (l) => <span className="font-mono text-[11px]">{l.item_id}</span>,
    },
    {
      key: "item_name",
      header: "商品名",
      render: (l) => l.item_name ?? "-",
    },
    {
      key: "expected_qty",
      header: "计划退货数量",
      align: "right",
      render: (l) => l.expected_qty ?? "-",
    },
    {
      key: "picked_qty",
      header: "已拣选数量",
      align: "right",
      render: (l) => l.picked_qty,
    },
    {
      key: "variance",
      header: "差异(拣选-计划)",
      align: "right",
      render: (l) => {
        if (l.expected_qty == null) return "-";
        const v = l.picked_qty - l.expected_qty;
        const cls =
          v === 0
            ? "text-emerald-700"
            : v > 0
            ? "text-amber-700"
            : "text-rose-700";
        return <span className={cls}>{v}</span>;
      },
    },
    {
      key: "status",
      header: "行状态",
      render: (l) => l.status,
    },
  ];

  return (
    <StandardTable<ReturnTaskLine>
      columns={columns}
      data={lines}
      dense
      getRowKey={(l) => l.id}
      emptyText="暂无行数据"
      footer={<span className="text-xs text-slate-500">共 {lines.length} 行</span>}
    />
  );
};
