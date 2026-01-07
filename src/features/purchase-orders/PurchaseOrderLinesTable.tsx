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

  /**
   * default: 其它页面保持原样（dense）
   * inbound: 采购收货作业页（字号/行高更大，便于扫视）
   */
  mode?: "default" | "inbound";
}

const formatUnitExpr = (line: PurchaseOrderLine) => {
  if (!line.purchase_uom || !line.base_uom || !line.units_per_case) {
    return "-";
  }
  return `1${line.purchase_uom} = ${line.units_per_case}${line.base_uom}`;
};

/** 作业态（只给一线用） */
function computeWorkStatus(line: PurchaseOrderLine): {
  text: string;
  className: string;
} {
  const ordered = Number(line.qty_ordered ?? 0);
  const received = Number(line.qty_received ?? 0);

  if (received <= 0) {
    return { text: "未收", className: "text-slate-500" };
  }

  if (received < ordered) {
    return { text: "收货中", className: "text-amber-700" };
  }

  return { text: "已收完", className: "text-emerald-700" };
}

export const PurchaseOrderLinesTable: React.FC<PurchaseOrderLinesTableProps> = ({
  po,
  selectedLineId,
  onSelectLine,
  mode = "default",
}) => {
  const isInbound = mode === "inbound";

  const columns: ColumnDef<PurchaseOrderLine>[] = [
    {
      key: "line_no",
      header: "行号",
      render: (line) => (
        <span className={`font-mono ${isInbound ? "text-[12px]" : "text-[11px]"}`}>
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
      key: "work_status",
      header: "作业状态",
      render: (line) => {
        const s = computeWorkStatus(line);
        return <span className={s.className}>{s.text}</span>;
      },
    },
  ];

  const cardCls = isInbound
    ? "bg-white border border-slate-200 rounded-xl p-5 space-y-4"
    : "bg-white border border-slate-200 rounded-xl p-4 space-y-3";

  const titleCls = isInbound ? "text-base font-semibold text-slate-800" : "text-sm font-semibold text-slate-800";

  return (
    <section className={cardCls}>
      <h2 className={titleCls}>行明细</h2>

      <StandardTable<PurchaseOrderLine>
        columns={columns}
        data={po.lines}
        dense={!isInbound}
        getRowKey={(line) => line.id}
        emptyText="暂无行数据"
        selectedKey={selectedLineId}
        onRowClick={(line) => onSelectLine(line.id)}
        footer={
          <span className={isInbound ? "text-sm text-slate-500" : "text-xs text-slate-500"}>
            共 {po.lines.length} 行
          </span>
        }
      />
    </section>
  );
};
