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

function caseRatio(line: PurchaseOrderDetailLine): number {
  const r = safeInt((line as { case_ratio_snapshot?: number | null }).case_ratio_snapshot, 0);
  return r > 0 ? r : 1;
}

function baseUomLabel(line: PurchaseOrderDetailLine): string {
  const a = String((line as { base_uom?: string | null }).base_uom ?? "").trim();
  if (a) return a;

  const snap = String((line as { uom_snapshot?: string | null }).uom_snapshot ?? "").trim();
  if (snap) return snap;

  const b = String((line as { uom?: string | null }).uom ?? "").trim();
  if (b) return b;

  return "最小单位";
}

function purchaseUomLabel(line: PurchaseOrderDetailLine): string {
  const p = String((line as { case_uom_snapshot?: string | null }).case_uom_snapshot ?? "").trim();
  return p || "采购单位";
}

function orderedBaseQty(line: PurchaseOrderDetailLine): number {
  const n = safeInt((line as { qty_ordered_base?: number | null }).qty_ordered_base, 0);
  return Math.max(n, 0);
}

function orderedPurchaseQty(line: PurchaseOrderDetailLine): number {
  // 主线：输入痕迹优先
  const caseInput = (line as { qty_ordered_case_input?: number | null }).qty_ordered_case_input;
  if (caseInput != null) return Math.max(safeInt(caseInput, 0), 0);

  // 若能整除倍率，用 base 推导；否则返回 0（避免制造虚假的“件数”）
  const base = orderedBaseQty(line);
  const r = caseRatio(line);
  if (r > 1 && base > 0 && base % r === 0) return Math.floor(base / r);

  if (r === 1) return base;

  return 0;
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

  // ✅ 入库模式：只保留 PO 行合同事实列（不混执行/主数据百科）
  const inboundColumns: ColumnDef<PurchaseOrderDetailLine>[] = [
    {
      key: "line_no",
      header: "行号",
      render: (line) => <span className="font-mono text-[12px] text-slate-500">{line.line_no}</span>,
    },
    {
      key: "item_sku",
      header: "SKU",
      render: (line) => <span className="font-mono">{line.item_sku ?? line.sku ?? "—"}</span>,
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

    // ✅ 换算（快照解释器）
    {
      key: "case_ratio_snapshot",
      header: "换算",
      align: "right",
      render: (line) => (
        <div className="text-right">
          <div className="font-mono">
            {caseRatio(line)}{" "}
            <span className="text-slate-600">
              {baseUomLabel(line)}/{purchaseUomLabel(line)}
            </span>
          </div>
        </div>
      ),
    },

    {
      key: "qty_ordered_case_input",
      header: "订购数量（case）",
      align: "right",
      render: (line) => (
        <div className="text-right">
          <div className="font-mono">
            {orderedPurchaseQty(line)} <span className="text-slate-600">{purchaseUomLabel(line)}</span>
          </div>
        </div>
      ),
    },
    {
      key: "qty_ordered_base",
      header: "订购数量（base）",
      align: "right",
      render: (line) => (
        <div className="text-right">
          <div className="font-mono">
            {orderedBaseQty(line)} <span className="text-slate-600">{baseUomLabel(line)}</span>
          </div>
        </div>
      ),
    },
    {
      key: "supply_price",
      header: "采购单价",
      align: "right",
      render: (line) => <span className="font-mono">{fmtMoney((line as { supply_price?: unknown }).supply_price)}</span>,
    },
    {
      key: "discount_amount",
      header: "折扣",
      align: "right",
      render: (line) => {
        const amt = fmtDiscount((line as { discount_amount?: unknown }).discount_amount);
        const note = String((line as { discount_note?: unknown }).discount_note ?? "").trim();
        return (
          <div className="text-right">
            <div className="font-mono">{amt}</div>
            {note ? <div className="text-[11px] text-slate-500">{note}</div> : null}
          </div>
        );
      },
    },
    {
      key: "remark",
      header: "备注",
      render: (line) => <span className="text-slate-700">{(line as { remark?: string | null }).remark ?? "—"}</span>,
    },
  ];

  // default 模式：保留原有百科列，但数量/换算展示切到 Phase2 字段
  const defaultColumns: ColumnDef<PurchaseOrderDetailLine>[] = [
    {
      key: "line_no",
      header: "行号",
      render: (line) => <span className="font-mono text-[11px] text-slate-500">{line.line_no}</span>,
    },
    {
      key: "sku",
      header: "SKU",
      render: (line) => <span className="font-mono">{line.sku ?? line.item_sku ?? "—"}</span>,
    },
    {
      key: "item_id",
      header: "商品ID",
      render: (line) => <span className="font-mono">{line.item_id}</span>,
    },
    {
      key: "primary_barcode",
      header: "主条码",
      render: (line) => <span className="font-mono">{line.primary_barcode ?? "—"}</span>,
    },
    {
      key: "item_name",
      header: "商品名称",
      render: (line) => <span className="font-medium">{line.item_name ?? "—"}</span>,
    },
    { key: "brand", header: "品牌", render: (line) => line.brand ?? "—" },
    { key: "category", header: "品类", render: (line) => line.category ?? "—" },
    { key: "supplier_name", header: "供货商", render: (line) => line.supplier_name ?? "—" },
    {
      key: "weight_kg",
      header: "单位净重(kg)",
      render: (line) => <span className="font-mono">{line.weight_kg ?? "—"}</span>,
    },
    { key: "uom", header: "最小包装单位", render: (line) => baseUomLabel(line) },
    {
      key: "has_shelf_life",
      header: "有效期",
      render: (line) => (line.has_shelf_life == null ? "—" : line.has_shelf_life ? "有" : "无"),
    },
    {
      key: "qty_ordered_base",
      header: "订购数量（base）",
      align: "right",
      render: (line) => {
        const baseQty = orderedBaseQty(line);
        const ratio = caseRatio(line);
        const baseUom = baseUomLabel(line);
        const puom = purchaseUomLabel(line);
        const caseQty = orderedPurchaseQty(line);

        return (
          <div className="text-right">
            <div className="font-mono">
              {baseQty} <span className="text-slate-600">{baseUom}</span>
            </div>
            <div className="text-[11px] text-slate-500">
              （{caseQty} {puom} × {ratio} {baseUom}/{puom}）
            </div>
          </div>
        );
      },
    },
  ];

  const columns = isInbound ? inboundColumns : defaultColumns;

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
