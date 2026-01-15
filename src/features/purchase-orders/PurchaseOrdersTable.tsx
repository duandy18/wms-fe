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

function safeInt(v: unknown, fallback: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.trunc(n);
}

// 列表态行：后端刚补的字段（可选，兼容旧数据）
type ListLineWithUom = PurchaseOrderListLine & {
  units_per_case?: number | null;
  base_uom?: string | null;
  purchase_uom?: string | null;
};

function lineUnitsPerCase(l: ListLineWithUom): number {
  const n = safeInt(l.units_per_case ?? 1, 1);
  return n > 0 ? n : 1;
}

function lineBaseUom(l: ListLineWithUom): string {
  const v = String(l.base_uom ?? "").trim();
  return v || "最小单位";
}

function linePurchaseUom(l: ListLineWithUom): string {
  const v = String(l.purchase_uom ?? "").trim();
  return v || "采购单位";
}

function sumQtyBase(po: PurchaseOrderListItem, kind: "ordered" | "received") {
  const lines = (po.lines ?? []) as ListLineWithUom[];

  let baseUom = "";
  let purchaseUom = "";

  let totalBase = 0;

  // 仅用于“订购”的采购单位合计（因为订购口径本来就是采购单位）
  let totalPurchaseOrdered = 0;

  // 用于“已收”的采购单位近似合计（因为已收是 base，需要除以 upc）
  let approxPurchaseReceived = 0;
  let hasFraction = false;

  let hasAnyUpc = false;

  for (const l of lines) {
    const upc = lineUnitsPerCase(l);
    if (upc !== 1) hasAnyUpc = true;

    if (!baseUom) baseUom = lineBaseUom(l);
    if (!purchaseUom) purchaseUom = linePurchaseUom(l);

    if (kind === "ordered") {
      const qPurchase = safeInt(l.qty_ordered ?? 0, 0); // 采购单位
      totalPurchaseOrdered += qPurchase;
      totalBase += qPurchase * upc; // 订购换算到 base
      continue;
    }

    // ✅ 已收：qty_received 已经是 base units（不要再乘 upc）
    const receivedBase = safeInt(l.qty_received ?? 0, 0);
    totalBase += receivedBase;

    // 采购单位近似解释：如果不能整除则标记 "+"
    const div = Math.floor(receivedBase / upc);
    approxPurchaseReceived += div;
    if (receivedBase % upc !== 0) hasFraction = true;
  }

  return {
    totalBase,
    baseUom: baseUom || "最小单位",
    purchaseUom: purchaseUom || "采购单位",
    hasAnyUpc,

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
      header: "订购数量（最小单位）",
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
              {x.hasAnyUpc ? " · 含换算" : ""}）
            </div>
          </div>
        );
      },
    },

    {
      key: "qty_received_base",
      header: "已收数量（最小单位）",
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
