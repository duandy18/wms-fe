// src/features/orders/components/OrdersTable.tsx
import React from "react";
import { StandardTable, type ColumnDef } from "../../../components/wmsdu/StandardTable";
import { manualAssignFulfillmentWarehouse, type OrderSummary, type WarehouseOption } from "../api/index";
import { formatTs, renderFulfillmentStatus, renderStatus } from "../ui/format";

function whLabel(id: number | null | undefined) {
  if (id == null) return "—";
  return `WH${id}`;
}

function assignModeBadge(modeRaw: string | null | undefined) {
  const mode = (modeRaw ?? "").toUpperCase();
  if (mode === "AUTO_FROM_SERVICE") {
    return (
      <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
        AUTO
      </span>
    );
  }
  if (mode === "MANUAL") {
    return (
      <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700">
        手工
      </span>
    );
  }
  return null;
}

function needManualAssign(r: OrderSummary) {
  return r.can_manual_assign_execution_warehouse === true;
}

function whOptionLabel(w: WarehouseOption) {
  const code = (w.code ?? "").trim();
  const name = (w.name ?? "").trim();
  if (code && name) return `${code} · ${name}`;
  if (code) return code;
  if (name) return name;
  return `#${w.id}`;
}

export const OrdersTable: React.FC<{
  rows: OrderSummary[];
  warehouses: WarehouseOption[];
  loading: boolean;
  onSelect: (row: OrderSummary) => void;
  onReload: () => void;
}> = ({ rows, warehouses, loading, onSelect, onReload }) => {
  const [rowSubmitting, setRowSubmitting] = React.useState<Record<number, boolean>>({});
  const [rowError, setRowError] = React.useState<Record<number, string | null>>({});

  async function handleManualAssign(row: OrderSummary, warehouseId: number) {
    setRowSubmitting((p) => ({ ...p, [row.id]: true }));
    setRowError((p) => ({ ...p, [row.id]: null }));

    try {
      await manualAssignFulfillmentWarehouse({
        platform: row.platform,
        shop_id: row.shop_id,
        ext_order_no: row.ext_order_no,
        warehouse_id: warehouseId,
        reason: "OPERATOR_CONFIRM_EXECUTION_WAREHOUSE",
        note: null,
      });
      onReload();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "人工指定执行仓失败";
      setRowError((p) => ({ ...p, [row.id]: msg }));
    } finally {
      setRowSubmitting((p) => ({ ...p, [row.id]: false }));
    }
  }

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
      header: "履约状态",
      render: (r) => (r.fulfillment_status ? renderFulfillmentStatus(r.fulfillment_status) : renderStatus(r.status)),
    },

    {
      key: "service_warehouse",
      header: "服务仓",
      render: (r) => <span className="font-mono text-[12px] text-slate-900">{whLabel(r.service_warehouse_id)}</span>,
    },

    {
      key: "execution_warehouse",
      header: "执行仓",
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

        if (needManualAssign(r)) {
          const submitting = rowSubmitting[r.id] === true;
          const err = rowError[r.id];

          return (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <select
                  className="h-8 rounded border border-slate-300 bg-white px-2 text-[12px] text-slate-700 disabled:bg-slate-50"
                  disabled={submitting || warehouses.length === 0}
                  defaultValue=""
                  onChange={(e) => {
                    const v = e.target.value;
                    if (!v) return;
                    const wid = Number(v);
                    if (!Number.isFinite(wid) || wid <= 0) return;
                    void handleManualAssign(r, wid);
                    e.currentTarget.value = "";
                  }}
                >
                  <option value="" disabled>
                    {warehouses.length === 0 ? "无候选仓" : "选择执行仓…"}
                  </option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={String(w.id)}>
                      {whOptionLabel(w)}
                    </option>
                  ))}
                </select>

                {submitting && <span className="text-[11px] text-slate-500">提交中…</span>}
              </div>

              {err && <span className="text-[11px] text-red-600">{err}</span>}
            </div>
          );
        }

        return <span className="text-[12px] text-slate-400">未指定</span>;
      },
    },

    { key: "created_at", header: "创建时间", render: (r) => formatTs(r.created_at) },

    {
      key: "actions",
      header: "操作",
      render: (r) => (
        <div className="flex items-center gap-2">
          {needManualAssign(r) && (
            <span className="rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
              {r.manual_assign_hint?.trim() || "待指定执行仓"}
            </span>
          )}
          <button type="button" className="text-xs text-sky-700 hover:underline" onClick={() => onSelect(r)}>
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
