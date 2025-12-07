// src/features/purchase-orders/PurchaseOrderLinesTable.tsx

import React from "react";
import type { PurchaseOrderWithLines, PurchaseOrderLine } from "./api";
import {
  StandardTable,
  type ColumnDef,
} from "../../components/wmsdu/StandardTable";

interface PurchaseOrderLinesTableProps {
  po: PurchaseOrderWithLines;
  selectedLineId: number | null;
  onSelectLine: (lineId: number) => void;
}

const formatMoney = (v: string | null) =>
  v == null ? "-" : v;

const formatUnitExpr = (line: PurchaseOrderLine) => {
  if (!line.purchase_uom || !line.base_uom || !line.units_per_case) {
    return "-";
  }
  return `1${line.purchase_uom} = ${line.units_per_case}${line.base_uom}`;
};

export const PurchaseOrderLinesTable: React.FC<PurchaseOrderLinesTableProps> = ({
  po,
  selectedLineId,
  onSelectLine,
}) => {
  const columns: ColumnDef<PurchaseOrderLine>[] = [
    {
      key: "line_no",
      header: "行号",
      render: (line) => (
        <span className="font-mono text-[11px]">
          {line.line_no}
        </span>
      ),
    },
    {
      key: "item_id",
      header: "Item ID",
      render: (line) => line.item_id,
    },
    {
      key: "item_name",
      header: "商品名",
      render: (line) => line.item_name ?? "-",
    },
    {
      key: "spec_text",
      header: "规格",
      render: (line) => line.spec_text ?? "-",
    },
    {
      key: "unit_expr",
      header: "单位换算",
      render: (line) => formatUnitExpr(line),
    },
    {
      key: "qty_ordered",
      header: "订购数量",
      align: "right",
      render: (line) => line.qty_ordered,
    },
    {
      key: "qty_received",
      header: "已收数量",
      align: "right",
      render: (line) => line.qty_received,
    },
    {
      key: "remaining",
      header: "剩余",
      align: "right",
      render: (line) => line.qty_ordered - line.qty_received,
    },
    {
      key: "supply_price",
      header: "供货价",
      align: "right",
      render: (line) => formatMoney(line.supply_price),
    },
    {
      key: "line_amount",
      header: "行金额",
      align: "right",
      render: (line) => formatMoney(line.line_amount),
    },
    {
      key: "status",
      header: "状态",
      render: (line) => line.status,
    },
  ];

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <h2 className="text-sm font-semibold text-slate-800">行明细</h2>
      <p className="text-xs text-slate-500">
        每一行代表一个 SKU 的一组价格体系与数量体系，可单独收货。
      </p>

      <StandardTable<PurchaseOrderLine>
        columns={columns}
        data={po.lines}
        dense
        getRowKey={(line) => line.id}
        emptyText="暂无行数据"
        selectedKey={selectedLineId}
        onRowClick={(line) => onSelectLine(line.id)}
        footer={
          <span className="text-xs text-slate-500">
            共 {po.lines.length} 行
          </span>
        }
      />
    </section>
  );
};
