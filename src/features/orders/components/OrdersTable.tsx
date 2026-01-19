// src/features/orders/components/OrdersTable.tsx
import React from "react";
import { StandardTable, type ColumnDef } from "../../../components/wmsdu/StandardTable";
import type { OrderSummary } from "../api";
import { formatTs, renderStatus } from "../ui/format";

export const OrdersTable: React.FC<{
  rows: OrderSummary[];
  loading: boolean;
  onSelect: (row: OrderSummary) => void;
}> = ({ rows, loading, onSelect }) => {
  const columns: ColumnDef<OrderSummary>[] = [
    { key: "platform", header: "平台", render: (r) => r.platform },
    { key: "shop_id", header: "店铺", render: (r) => r.shop_id },
    {
      key: "ext_order_no",
      header: "外部订单号",
      render: (r) => <span className="font-mono text-[11px]">{r.ext_order_no}</span>,
    },
    { key: "status", header: "状态", render: (r) => renderStatus(r.status) },
    {
      key: "warehouse_id",
      header: "仓库",
      render: (r) => r.warehouse_id ?? "-",
    },
    { key: "created_at", header: "创建时间", render: (r) => formatTs(r.created_at) },
    {
      key: "actions",
      header: "操作",
      render: (r) => (
        <button
          type="button"
          className="text-xs text-sky-700 hover:underline"
          onClick={() => onSelect(r)}
        >
          查看详情
        </button>
      ),
    },
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <StandardTable<OrderSummary>
        columns={columns}
        data={rows}
        dense
        getRowKey={(r) => r.id}
        emptyText={loading ? "加载中…" : "暂无订单，可以先在 DevConsole 或平台回放生成一些订单。"}
        footer={<span className="text-xs text-slate-500">共 {rows.length} 条记录（当前页）</span>}
      />
    </section>
  );
};
