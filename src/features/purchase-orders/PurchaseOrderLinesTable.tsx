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

function formatShelfValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return String(Math.trunc(n));
}

function formatShelfUnitCn(u: unknown): string {
  if (!u) return "—";
  const s = String(u).toUpperCase();
  if (s === "MONTH") return "月";
  if (s === "DAY") return "天";
  return "—";
}

const StatusBadge: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  return enabled ? (
    <span className="inline-flex items-center rounded px-2 py-1 text-sm font-semibold bg-emerald-100 text-emerald-800">
      有效
    </span>
  ) : (
    <span className="inline-flex items-center rounded px-2 py-1 text-sm font-semibold bg-red-100 text-red-800">
      无效
    </span>
  );
};

function unitsPerCase(line: PurchaseOrderDetailLine): number {
  const n = Number(line.units_per_case ?? 1);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : 1;
}

function baseUomLabel(line: PurchaseOrderDetailLine): string {
  const a = (line.base_uom ?? "").trim();
  if (a) return a;
  const b = (line.uom ?? "").trim();
  if (b) return b;
  return "最小单位";
}

function purchaseUomLabel(line: PurchaseOrderDetailLine): string {
  const p = (line.purchase_uom ?? "").trim();
  return p || "采购单位";
}

function orderedBase(line: PurchaseOrderDetailLine): number {
  const upc = unitsPerCase(line);
  const orderedPurchase = Number(line.qty_ordered ?? 0);
  return Math.trunc(Number.isFinite(orderedPurchase) ? orderedPurchase : 0) * upc;
}

function receivedBase(line: PurchaseOrderDetailLine): number {
  // ✅ 约定：qty_received 在本系统中已为最小单位（base）
  const n = Number(line.qty_received ?? 0);
  return Math.trunc(Number.isFinite(n) ? n : 0);
}

function remainBase(line: PurchaseOrderDetailLine): number {
  return Math.max(orderedBase(line) - receivedBase(line), 0);
}

function computeWorkStatus(line: PurchaseOrderDetailLine): { text: string; className: string } {
  const o = orderedBase(line);
  const r = receivedBase(line);

  if (r <= 0) return { text: "未收", className: "text-slate-500" };
  if (r < o) return { text: "收货中", className: "text-amber-700" };
  return { text: "已收完", className: "text-emerald-700" };
}

function renderOrderedBase(line: PurchaseOrderDetailLine) {
  const baseQty = orderedBase(line);
  const upc = unitsPerCase(line);
  const baseUom = baseUomLabel(line);
  const puom = purchaseUomLabel(line);
  return (
    <div className="text-right">
      <div className="font-mono">
        {baseQty} <span className="text-slate-600">{baseUom}</span>
      </div>
      <div className="text-[11px] text-slate-500">
        （{Math.trunc(Number(line.qty_ordered ?? 0))} {puom} × {upc} {baseUom}/{puom}）
      </div>
    </div>
  );
}

function renderReceivedBase(line: PurchaseOrderDetailLine) {
  const rBase = receivedBase(line);
  const upc = unitsPerCase(line);
  const baseUom = baseUomLabel(line);
  const puom = purchaseUomLabel(line);

  const approxPurchase = Math.floor(rBase / upc);
  const hasFraction = rBase % upc !== 0;

  return (
    <div className="text-right">
      <div className="font-mono">
        {rBase} <span className="text-slate-600">{baseUom}</span>
      </div>
      <div className="text-[11px] text-slate-500">
        （≈{approxPurchase}{hasFraction ? "+" : ""} {puom}）
      </div>
    </div>
  );
}

function renderRemainBase(line: PurchaseOrderDetailLine) {
  const x = remainBase(line);
  const upc = unitsPerCase(line);
  const baseUom = baseUomLabel(line);
  const puom = purchaseUomLabel(line);

  const approxPurchase = Math.floor(x / upc);
  const hasFraction = x % upc !== 0;

  return (
    <div className="text-right">
      <div className="font-mono">
        {x} <span className="text-slate-600">{baseUom}</span>
      </div>
      <div className="text-[11px] text-slate-500">
        （≈{approxPurchase}{hasFraction ? "+" : ""} {puom}）
      </div>
    </div>
  );
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
      render: (line) => (
        <span className={`font-mono ${isInbound ? "text-[12px]" : "text-[11px]"} text-slate-500`}>
          {line.line_no}
        </span>
      ),
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
      key: "shelf_life_value",
      header: "默认有效期值",
      render: (line) => {
        if (!line.has_shelf_life) return "—";
        const sv = formatShelfValue(line.shelf_life_value);
        return (
          <span className="font-mono">
            {sv}
            {sv === "—" ? <span className="ml-2 text-[11px] text-amber-700">未配置</span> : null}
          </span>
        );
      },
    },
    {
      key: "shelf_life_unit",
      header: "单位",
      render: (line) => (!line.has_shelf_life ? "—" : formatShelfUnitCn(line.shelf_life_unit)),
    },
    {
      key: "enabled",
      header: "状态",
      render: (line) => (line.enabled == null ? "—" : <StatusBadge enabled={!!line.enabled} />),
    },

    {
      key: "qty_ordered_base",
      header: "订购数量（最小单位）",
      align: "right",
      render: (line) => renderOrderedBase(line),
    },
    {
      key: "qty_received_base",
      header: "已收数量（最小单位）",
      align: "right",
      render: (line) => renderReceivedBase(line),
    },
    {
      key: "qty_remaining_base",
      header: "剩余（最小单位）",
      align: "right",
      render: (line) => renderRemainBase(line),
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
