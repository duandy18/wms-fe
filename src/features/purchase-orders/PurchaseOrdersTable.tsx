// src/features/purchase-orders/PurchaseOrdersTable.tsx

import React, { useMemo } from "react";
import type { PurchaseOrderListItem, PurchaseOrderListLine } from "./api";
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
  const base = "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium";
  switch (s) {
    case "CREATED":
      return <span className={`${base} bg-slate-100 text-slate-700`}>新建</span>;
    case "PARTIAL":
      return <span className={`${base} bg-amber-100 text-amber-800`}>部分收货</span>;
    case "RECEIVED":
      return <span className={`${base} bg-emerald-100 text-emerald-800`}>已收货</span>;
    case "CLOSED":
      return <span className={`${base} bg-slate-200 text-slate-800`}>已关闭</span>;
    default:
      return <span className={`${base} bg-slate-100 text-slate-700`}>{s}</span>;
  }
};

const formatTs = (ts: string | null | undefined) => (ts ? ts.replace("T", " ").replace("Z", "") : "-");

function safeInt(v: unknown, fallback: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.trunc(n);
}

type ListLineV2 = PurchaseOrderListLine & {
  uom_snapshot?: string | null;
  case_ratio_snapshot?: number | null;
  case_uom_snapshot?: string | null;
  qty_ordered_case_input?: number | null;

  qty_ordered_base?: number | null;
  qty_received_base?: number | null;

  base_uom?: string | null;
};

function lineCaseRatio(l: ListLineV2): number {
  const r = safeInt(l.case_ratio_snapshot, 0);
  return r > 0 ? r : 1;
}

function lineBaseUom(l: ListLineV2): string {
  const v = String(l.base_uom ?? "").trim();
  if (v) return v;
  const snap = String(l.uom_snapshot ?? "").trim();
  return snap || "最小单位";
}

function linePurchaseUom(l: ListLineV2): string {
  const v = String(l.case_uom_snapshot ?? "").trim();
  return v || "采购单位";
}

function lineOrderedBase(l: ListLineV2): number {
  const qob = l.qty_ordered_base;
  return qob != null ? Math.max(safeInt(qob, 0), 0) : 0;
}

function lineReceivedBase(l: ListLineV2): number {
  const qrb = l.qty_received_base;
  return qrb != null ? Math.max(safeInt(qrb, 0), 0) : 0;
}

function lineOrderedPurchase(l: ListLineV2): number {
  const ci = l.qty_ordered_case_input;
  if (ci != null) return Math.max(safeInt(ci, 0), 0);

  const base = lineOrderedBase(l);
  const r = lineCaseRatio(l);
  if (r > 1 && base > 0 && base % r === 0) return Math.floor(base / r);
  if (r === 1) return base;
  return 0;
}

function sumQtyBase(po: PurchaseOrderListItem, kind: "ordered" | "received") {
  const lines = (po.lines ?? []) as ListLineV2[];

  let baseUom = "";
  let purchaseUom = "";

  let totalBase = 0;

  let totalPurchaseOrdered = 0;

  let approxPurchaseReceived = 0;
  let hasFraction = false;
  let hasAnyRatio = false;

  for (const l of lines) {
    const ratio = lineCaseRatio(l);
    if (ratio !== 1) hasAnyRatio = true;

    if (!baseUom) baseUom = lineBaseUom(l);
    if (!purchaseUom) purchaseUom = linePurchaseUom(l);

    if (kind === "ordered") {
      const base = lineOrderedBase(l);
      totalBase += base;
      totalPurchaseOrdered += lineOrderedPurchase(l);
      continue;
    }

    const receivedBase = lineReceivedBase(l);
    totalBase += receivedBase;

    const div = Math.floor(receivedBase / ratio);
    approxPurchaseReceived += div;
    if (receivedBase % ratio !== 0) hasFraction = true;
  }

  return {
    totalBase,
    baseUom: baseUom || "最小单位",
    purchaseUom: purchaseUom || "采购单位",
    hasAnyRatio,
    totalPurchaseOrdered,
    approxPurchaseReceived,
    hasFraction,
  };
}

export const PurchaseOrdersTable: React.FC<PurchaseOrdersTableProps> = ({
  orders,
  loading,
  error,
  onRowClick,
  selectedPoId,
}) => {
  const hasData = useMemo(() => orders && orders.length > 0, [orders]);

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
      key: "qty_ordered_base",
      header: "订购数量（base）",
      align: "right",
      render: (po) => {
        const x = sumQtyBase(po, "ordered");
        return (
          <div className="text-right">
            <div className="font-mono">
              {x.totalBase} <span className="text-slate-600">{x.baseUom}</span>
            </div>
            <div className="text-[11px] text-slate-500">
              （{x.totalPurchaseOrdered} {x.purchaseUom}
              {x.hasAnyRatio ? " · 含换算" : ""}）
            </div>
          </div>
        );
      },
    },
    {
      key: "qty_received_base",
      header: "已收数量（base）",
      align: "right",
      render: (po) => {
        const x = sumQtyBase(po, "received");
        return (
          <div className="text-right">
            <div className="font-mono">
              {x.totalBase} <span className="text-slate-600">{x.baseUom}</span>
            </div>
            <div className="text-[11px] text-slate-500">
              （≈{x.approxPurchaseReceived}
              {x.hasFraction ? "+" : ""} {x.purchaseUom}）
            </div>
          </div>
        );
      },
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
