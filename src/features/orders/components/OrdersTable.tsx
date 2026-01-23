// src/features/orders/components/OrdersTable.tsx
import React from "react";
import { StandardTable, type ColumnDef } from "../../../components/wmsdu/StandardTable";

import type { OrderSummary, WarehouseOption } from "../api/index";
import { formatTs, renderFulfillmentStatus, renderStatus } from "../ui/format";

import type { OrderWarehouseAvailabilityCell, OrderWarehouseAvailabilityLine } from "../api/types";
import { useOrdersExplainMap } from "./orders-table/useOrdersExplainMap";
import { assignModeBadge, isNeedManualAssign, whLabel } from "./orders-table/utils";

function buildCellMap(matrix: OrderWarehouseAvailabilityCell[]) {
  const m = new Map<number, Map<number, OrderWarehouseAvailabilityCell>>();
  for (const c of matrix || []) {
    const wid = Number(c.warehouse_id);
    const iid = Number(c.item_id);
    if (!Number.isFinite(wid) || !Number.isFinite(iid)) continue;
    if (!m.has(wid)) m.set(wid, new Map());
    m.get(wid)!.set(iid, c);
  }
  return m;
}

function lineLabel(ln: OrderWarehouseAvailabilityLine) {
  const t = (ln.title ?? "").trim();
  const sku = (ln.sku_id ?? "").trim();
  if (sku && t) return `${sku} · ${t}`;
  if (sku) return sku;
  if (t) return t;
  return `商品#${ln.item_id}`;
}

function renderOrderLines(lines: OrderWarehouseAvailabilityLine[]) {
  if (!lines.length) return <span className="text-slate-400">—</span>;
  return (
    <div className="space-y-1">
      {lines.map((ln) => (
        <div key={ln.item_id} className="flex items-center justify-between gap-2">
          <span className="truncate">{lineLabel(ln)}</span>
          <span className="font-mono text-slate-800">× {ln.req_qty}</span>
        </div>
      ))}
    </div>
  );
}

function renderWarehouseAvail(lines: OrderWarehouseAvailabilityLine[], cellMap: Map<number, OrderWarehouseAvailabilityCell>) {
  if (!lines.length) return <span className="text-slate-400">—</span>;

  return (
    <div className="space-y-1">
      {lines.map((ln) => {
        const cell = cellMap.get(ln.item_id);
        if (!cell) return <div key={ln.item_id} className="text-slate-400">—</div>;

        const status = (cell.status ?? "").toUpperCase();
        const shortage = Number(cell.shortage ?? 0) || 0;
        const available = Number(cell.available ?? 0) || 0;

        return (
          <div key={ln.item_id} className="flex items-center justify-between gap-2">
            <span className="font-mono text-slate-900">{available}</span>
            {status === "SHORTAGE" && shortage > 0 ? (
              <span className="rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[11px] font-medium text-red-700">
                缺 {shortage}
              </span>
            ) : (
              <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700">
                够
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export const OrdersTable: React.FC<{
  rows: OrderSummary[];
  warehouses: WarehouseOption[];
  loading: boolean;
  onReload: () => void;
  onOpenManual: (row: OrderSummary) => void;
}> = ({ rows, warehouses, loading, onOpenManual }) => {
  const { explainMap, explainWarehouseIds } = useOrdersExplainMap({
    rows,
    warehouses,
    enabled: true,
    concurrency: 6,
  });

  const whA = explainWarehouseIds[0] ?? null;
  const whB = explainWarehouseIds[1] ?? null;

  const columns: ColumnDef<OrderSummary>[] = [
    { key: "platform", header: "平台", render: (r) => r.platform },
    { key: "shop_id", header: "店铺", render: (r) => r.shop_id },
    {
      key: "ext_order_no",
      header: "外部订单号",
      render: (r) => <span className="font-mono text-[11px]">{r.ext_order_no}</span>,
    },
    {
      key: "fulfillment_status",
      header: "发货状态",
      render: (r) => (r.fulfillment_status ? renderFulfillmentStatus(r.fulfillment_status) : renderStatus(r.status)),
    },
    {
      key: "service_warehouse",
      header: "默认仓库",
      render: (r) => <span className="font-mono text-[12px] text-slate-900">{whLabel(r.service_warehouse_id)}</span>,
    },
    {
      key: "execution_warehouse",
      header: "发货仓库",
      render: (r) => {
        const execId = r.warehouse_id ?? null;
        if (execId != null) {
          const badge = assignModeBadge(r.warehouse_assign_mode);
          return (
            <span className="inline-flex items-center gap-2">
              <span className="font-mono text-[12px] text-slate-900">{whLabel(execId)}</span>
              {badge}
            </span>
          );
        }
        return <span className="text-[12px] text-slate-400">未选择</span>;
      },
    },
    {
      key: "order_lines",
      header: "订单行（SKU×数量）",
      render: (r) => {
        const st = explainMap[r.id];
        if (!st) return <span className="text-slate-400">—</span>;
        if (st.loading) return <span className="text-slate-400">加载中…</span>;
        if (st.error) return <span className="text-red-600 text-[11px]">失败</span>;
        const lines = st.data?.lines ?? [];
        return renderOrderLines(lines);
      },
    },
    ...(whA
      ? ([
          {
            key: `wh_${whA}`,
            header: `WH${whA} 可用`,
            render: (r: OrderSummary) => {
              const st = explainMap[r.id];
              if (!st) return <span className="text-slate-400">—</span>;
              if (st.loading) return <span className="text-slate-400">…</span>;
              if (st.error) return <span className="text-red-600 text-[11px]">!</span>;
              const lines = st.data?.lines ?? [];
              const byWh = buildCellMap(st.data?.matrix ?? []).get(whA);
              if (!byWh) return <span className="text-slate-400">—</span>;
              return renderWarehouseAvail(lines, byWh);
            },
          },
        ] as ColumnDef<OrderSummary>[])
      : []),
    ...(whB
      ? ([
          {
            key: `wh_${whB}`,
            header: `WH${whB} 可用`,
            render: (r: OrderSummary) => {
              const st = explainMap[r.id];
              if (!st) return <span className="text-slate-400">—</span>;
              if (st.loading) return <span className="text-slate-400">…</span>;
              if (st.error) return <span className="text-red-600 text-[11px]">!</span>;
              const lines = st.data?.lines ?? [];
              const byWh = buildCellMap(st.data?.matrix ?? []).get(whB);
              if (!byWh) return <span className="text-slate-400">—</span>;
              return renderWarehouseAvail(lines, byWh);
            },
          },
        ] as ColumnDef<OrderSummary>[])
      : []),
    { key: "created_at", header: "创建时间", render: (r) => formatTs(r.created_at) },
    {
      key: "actions",
      header: "操作",
      render: (r) => (
        <div className="flex items-center gap-2">
          {isNeedManualAssign(r) ? (
            <button
              type="button"
              className="rounded-md border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
              onClick={() => onOpenManual(r)}
            >
              去处理
            </button>
          ) : (
            <span className="text-[12px] text-slate-400">—</span>
          )}
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
        emptyText={loading ? "加载中…" : "暂无订单"}
        footer={
          <span className="text-xs text-slate-500">
            共 {rows.length} 条记录（当前页）{explainWarehouseIds.length > 2 ? ` · 候选仓>2，仅展示前2列` : ""}
          </span>
        }
      />
    </section>
  );
};
