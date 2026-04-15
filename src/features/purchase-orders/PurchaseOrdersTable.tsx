// 行级完成情况版本：采购页下半张卡一行 = 一条采购单行。

import React, { useMemo } from "react";
import type { PurchaseOrderCompletionListItem } from "./api";
import { StandardTable, type ColumnDef } from "../../components/wmsdu/StandardTable";

interface PurchaseOrdersTableProps {
  rows: PurchaseOrderCompletionListItem[];
  loading: boolean;
  error: string | null;
  onEditRow: (row: PurchaseOrderCompletionListItem) => void;
  selectedPoLineId: number | null;
}

const formatTs = (ts: string | null | undefined) =>
  ts ? ts.replace("T", " ").replace("Z", "") : "-";

const formatWarehouse = (warehouseId: number | null | undefined) =>
  warehouseId == null ? "-" : `仓库 ${warehouseId}`;

const completionBadge = (status: string) => {
  const base = "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium";
  switch (status) {
    case "NOT_RECEIVED":
      return <span className={`${base} bg-slate-100 text-slate-700`}>未收</span>;
    case "PARTIAL":
      return <span className={`${base} bg-amber-100 text-amber-800`}>部分完成</span>;
    case "RECEIVED":
      return <span className={`${base} bg-emerald-100 text-emerald-800`}>已完成</span>;
    default:
      return <span className={`${base} bg-slate-100 text-slate-700`}>{status}</span>;
  }
};

function formatPlanCell(row: PurchaseOrderCompletionListItem) {
  return (
    <div className="text-right">
      <div className="font-mono">
        {row.qty_ordered_input} {row.purchase_uom_name_snapshot}
      </div>
      <div className="text-[11px] text-slate-500">{row.qty_ordered_base} base</div>
    </div>
  );
}

function formatQtyBase(v: number) {
  return <span className="font-mono">{v}</span>;
}

export const PurchaseOrdersTable: React.FC<PurchaseOrdersTableProps> = ({
  rows,
  loading,
  error,
  onEditRow,
  selectedPoLineId,
}) => {
  const hasData = useMemo(() => rows.length > 0, [rows]);

  const columns: ColumnDef<PurchaseOrderCompletionListItem>[] = [
    {
      key: "po_no",
      header: "采购单号",
      render: (row) => <span className="font-mono text-[11px]">{row.po_no}</span>,
    },
    {
      key: "line_no",
      header: "行号",
      align: "right",
      render: (row) => <span className="font-mono">{row.line_no}</span>,
    },
    {
      key: "supplier_name",
      header: "供应商",
      render: (row) => row.supplier_name ?? "-",
    },
    {
      key: "warehouse_id",
      header: "仓库",
      render: (row) => formatWarehouse(row.warehouse_id),
    },
    {
      key: "purchaser",
      header: "采购人",
      render: (row) => row.purchaser ?? "-",
    },
    {
      key: "purchase_time",
      header: "采购时间",
      render: (row) => formatTs(row.purchase_time),
    },
    {
      key: "item_name",
      header: "商品",
      render: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.item_name ?? "-"}</div>
          <div className="text-[11px] text-slate-500">{row.item_sku ?? "-"}</div>
        </div>
      ),
    },
    {
      key: "spec_text",
      header: "规格",
      render: (row) => row.spec_text ?? "-",
    },
    {
      key: "purchase_uom_name_snapshot",
      header: "采购单位",
      render: (row) => row.purchase_uom_name_snapshot,
    },
    {
      key: "qty_ordered_input",
      header: "计划",
      align: "right",
      render: (row) => formatPlanCell(row),
    },
    {
      key: "qty_received_base",
      header: "已收",
      align: "right",
      render: (row) => formatQtyBase(row.qty_received_base),
    },
    {
      key: "qty_remaining_base",
      header: "剩余",
      align: "right",
      render: (row) => formatQtyBase(row.qty_remaining_base),
    },
    {
      key: "line_completion_status",
      header: "完成状态",
      render: (row) => completionBadge(row.line_completion_status),
    },
    {
      key: "last_received_at",
      header: "最近收货时间",
      render: (row) => formatTs(row.last_received_at),
    },
    {
      key: "actions",
      header: "操作",
      render: (row) => (
        <button
          type="button"
          className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
          onClick={(e) => {
            e.stopPropagation();
            onEditRow(row);
          }}
        >
          编辑
        </button>
      ),
    },
  ];

  let emptyText: React.ReactNode = "暂无数据";
  if (loading) {
    emptyText = "加载中…";
  } else if (error) {
    emptyText = <span className="text-red-600">加载失败：{error}</span>;
  }

  return (
    <StandardTable<PurchaseOrderCompletionListItem>
      title="采购计划完成情况"
      columns={columns}
      data={rows}
      dense
      getRowKey={(row) => row.po_line_id}
      emptyText={emptyText}
      onRowClick={(row) => onEditRow(row)}
      selectedKey={selectedPoLineId}
      footer={
        <span className="text-xs text-slate-500">共 {hasData ? rows.length : 0} 条记录</span>
      }
    />
  );
};
