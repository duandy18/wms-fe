// src/features/orders/components/OrdersTable.tsx
import React from "react";
import { StandardTable, type ColumnDef } from "../../../components/wmsdu/StandardTable";
import type { OrderSummary } from "../api/index";
import { formatTs, renderFulfillmentStatus, renderStatus } from "../ui/format";

function whLabel(id: number | null | undefined) {
  if (id == null) return "-";
  return `WH${id}`;
}

function renderWarehouseCell(r: OrderSummary) {
  const execId = r.warehouse_id ?? null;
  const serviceId = r.service_warehouse_id ?? null;

  if (execId != null) {
    return (
      <div className="flex flex-col">
        <span className="text-[11px] text-slate-500">执行仓</span>
        <span className="font-mono text-[12px] text-slate-900">{whLabel(execId)}</span>
      </div>
    );
  }

  if (serviceId != null) {
    return (
      <div className="flex flex-col">
        <span className="text-[11px] text-slate-500">服务仓</span>
        <span className="font-mono text-[12px] text-slate-900">{whLabel(serviceId)}</span>
      </div>
    );
  }

  return <span className="text-slate-400">-</span>;
}

function needManualAssign(r: OrderSummary) {
  const fs = (r.fulfillment_status ?? "").toUpperCase();
  return fs === "SERVICE_ASSIGNED" && r.warehouse_id == null;
}

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

    // ✅ Phase 5.2：优先展示 fulfillment_status（履约状态），缺失则降级显示旧 status
    {
      key: "fulfillment_status",
      header: "履约",
      render: (r) => (r.fulfillment_status ? renderFulfillmentStatus(r.fulfillment_status) : renderStatus(r.status)),
    },

    // ✅ Phase 5.2：仓库列语义分裂（执行仓 vs 服务仓）
    {
      key: "warehouse",
      header: "仓库",
      render: (r) => renderWarehouseCell(r),
    },

    { key: "created_at", header: "创建时间", render: (r) => formatTs(r.created_at) },

    {
      key: "actions",
      header: "操作",
      render: (r) => (
        <div className="flex items-center gap-2">
          {needManualAssign(r) && (
            <span className="rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
              需指定执行仓
            </span>
          )}
          <button
            type="button"
            className="text-xs text-sky-700 hover:underline"
            onClick={() => onSelect(r)}
          >
            查看详情
          </button>
        </div>
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
