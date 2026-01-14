// src/features/purchase-orders/PurchaseOrdersTable.tsx

import React, { useMemo } from "react";
import type { PurchaseOrderListItem } from "./api";
import { StandardTable, type ColumnDef } from "../../components/wmsdu/StandardTable";

interface PurchaseOrdersTableProps {
  orders: PurchaseOrderListItem[];
  loading: boolean;
  error: string | null;
  onRowClick: (id: number) => void;
  selectedPoId: number | null;
}

const formatMoney = (v: string | null | undefined) => (v == null ? "-" : v);

const statusBadge = (s: string) => {
  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium";
  switch (s) {
    case "CREATED":
      return <span className={`${base} bg-slate-100 text-slate-700`}>新建</span>;
    case "PARTIAL":
      return (
        <span className={`${base} bg-amber-100 text-amber-800`}>部分收货</span>
      );
    case "RECEIVED":
      return (
        <span className={`${base} bg-emerald-100 text-emerald-800`}>已收货</span>
      );
    case "CLOSED":
      return <span className={`${base} bg-slate-200 text-slate-800`}>已关闭</span>;
    default:
      return <span className={`${base} bg-slate-100 text-slate-700`}>{s}</span>;
  }
};

const formatTs = (ts: string | null | undefined) =>
  ts ? ts.replace("T", " ").replace("Z", "") : "-";

export const PurchaseOrdersTable: React.FC<PurchaseOrdersTableProps> = ({
  orders,
  loading,
  error,
  onRowClick,
  selectedPoId,
}) => {
  const hasData = useMemo(() => orders && orders.length > 0, [orders]);

  const totalQtyOrdered = (po: PurchaseOrderListItem) =>
    (po.lines ?? []).reduce((sum, l) => sum + Number(l.qty_ordered ?? 0), 0);

  const totalQtyReceived = (po: PurchaseOrderListItem) =>
    (po.lines ?? []).reduce((sum, l) => sum + Number(l.qty_received ?? 0), 0);

  const columns: ColumnDef<PurchaseOrderListItem>[] = [
    {
      key: "id",
      header: "ID",
      align: "right",
      render: (po) => <span className="font-mono text-[11px]">{po.id}</span>,
    },
    {
      key: "supplier_name",
      header: "供应商",
      render: (po) => po.supplier_name ?? po.supplier ?? "-",
    },
    {
      key: "purchaser",
      header: "采购人",
      render: (po) => po.purchaser ?? "-",
    },
    {
      key: "purchase_time",
      header: "采购时间",
      render: (po) => formatTs(po.purchase_time),
    },
    {
      key: "warehouse_id",
      header: "仓库",
      render: (po) => po.warehouse_id ?? "-",
    },
    {
      key: "line_count",
      header: "行数",
      align: "right",
      render: (po) => (po.lines ?? []).length,
    },
    {
      key: "qty_ordered",
      header: "订购数量",
      align: "right",
      render: (po) => totalQtyOrdered(po),
    },
    {
      key: "qty_received",
      header: "已收数量",
      align: "right",
      render: (po) => totalQtyReceived(po),
    },
    {
      key: "total_amount",
      header: "汇总金额",
      align: "right",
      render: (po) => formatMoney(po.total_amount),
    },
    {
      key: "status",
      header: "状态",
      render: (po) => statusBadge(po.status),
    },
    {
      key: "created_at",
      header: "创建时间",
      render: (po) => formatTs(po.created_at),
    },
  ];

  let emptyText: React.ReactNode = "暂无数据";
  if (loading) {
    emptyText = "加载中…";
  } else if (error) {
    emptyText = <span className="text-red-600">加载失败：{error}</span>;
  }

  return (
    <StandardTable<PurchaseOrderListItem>
      title="采购单列表"
      columns={columns}
      data={orders}
      dense
      getRowKey={(po) => po.id}
      emptyText={emptyText}
      onRowClick={(po) => onRowClick(po.id)}
      selectedKey={selectedPoId}
      footer={
        <span className="text-xs text-slate-500">
          共 {hasData ? orders.length : 0} 条记录
        </span>
      }
    />
  );
};
