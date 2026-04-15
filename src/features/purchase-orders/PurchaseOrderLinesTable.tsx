// src/features/purchase-orders/PurchaseOrderLinesTable.tsx

import React from "react";
import type { PurchaseOrderDetail, PurchaseOrderDetailLine } from "./api";
import { StandardTable, type ColumnDef } from "../../components/wmsdu/StandardTable";

interface PurchaseOrderLinesTableProps {
  po: PurchaseOrderDetail;
  selectedLineId: number | null;
  onSelectLine: (lineId: number) => void;
  mode?: "default" | "inbound";
}

function safeInt(v: unknown, fallback: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.trunc(n);
}

function ratioSnapshot(line: PurchaseOrderDetailLine): number {
  return Math.max(safeInt(line.purchase_ratio_to_base_snapshot, 1), 1);
}

function orderedInputQty(line: PurchaseOrderDetailLine): number {
  return Math.max(safeInt(line.qty_ordered_input, 0), 0);
}

function orderedBaseQty(line: PurchaseOrderDetailLine): number {
  return Math.max(safeInt(line.qty_ordered_base, 0), 0);
}

function fmtMoney(v: unknown): string {
  if (v === null || v === undefined) return "—";
  const s = String(v).trim();
  return s ? s : "—";
}

function fmtDiscount(v: unknown): string {
  if (v === null || v === undefined) return "0";
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return String(n);
}

export const PurchaseOrderLinesTable: React.FC<PurchaseOrderLinesTableProps> = ({
  po,
  selectedLineId,
  onSelectLine,
  mode = "default",
}) => {
  const isInbound = mode === "inbound";

  const columns: ColumnDef<PurchaseOrderDetailLine>[] = [
    {
      key: "line_no",
      header: "行号",
      render: (line) => <span className="font-mono text-[12px] text-slate-500">{line.line_no}</span>,
    },
    {
      key: "item_id",
      header: "商品ID",
      render: (line) => <span className="font-mono">{line.item_id}</span>,
    },
    {
      key: "item_sku",
      header: "SKU",
      render: (line) => <span className="font-mono">{line.item_sku ?? "—"}</span>,
    },
    {
      key: "item_name",
      header: "商品名称",
      render: (line) => <span className="font-medium">{line.item_name ?? "—"}</span>,
    },
    {
      key: "spec_text",
      header: "规格",
      render: (line) => <span className="text-slate-700">{line.spec_text ?? "—"}</span>,
    },
    {
      key: "purchase_ratio_to_base_snapshot",
      header: "倍率",
      align: "right",
      render: (line) => <span className="font-mono">{ratioSnapshot(line)}</span>,
    },
    {
      key: "qty_ordered_input",
      header: "订购数量（输入）",
      align: "right",
      render: (line) => <span className="font-mono">{orderedInputQty(line)}</span>,
    },
    {
      key: "qty_ordered_base",
      header: "计划数量（base）",
      align: "right",
      render: (line) => <span className="font-mono">{orderedBaseQty(line)}</span>,
    },
    {
      key: "supply_price",
      header: "采购单价",
      align: "right",
      render: (line) => <span className="font-mono">{fmtMoney(line.supply_price)}</span>,
    },
    {
      key: "discount_amount",
      header: "折扣",
      align: "right",
      render: (line) => {
        const note = String(line.discount_note ?? "").trim();
        return (
          <div className="text-right">
            <div className="font-mono">{fmtDiscount(line.discount_amount)}</div>
            {note ? <div className="text-[11px] text-slate-500">{note}</div> : null}
          </div>
        );
      },
    },
    {
      key: "remark",
      header: "备注",
      render: (line) => <span className="text-slate-700">{line.remark ?? "—"}</span>,
    },
  ];

  const cardCls = isInbound
    ? "bg-white border border-slate-200 rounded-xl p-5 space-y-4"
    : "bg-white border border-slate-200 rounded-xl p-4 space-y-3";

  const titleCls = isInbound ? "text-base font-semibold text-slate-800" : "text-sm font-semibold text-slate-800";

  return (
    <section className={cardCls}>
      <h2 className={titleCls}>行明细</h2>

      <StandardTable<PurchaseOrderDetailLine>
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
