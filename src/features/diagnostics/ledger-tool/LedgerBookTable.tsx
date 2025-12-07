// src/features/diagnostics/ledger-tool/LedgerBookTable.tsx
import React from "react";
import { SectionCard } from "../../../components/wmsdu/SectionCard";
import { DataTable } from "../../../components/wmsdu/DataTable";
import type { ColumnDef } from "../../../components/wmsdu/DataTable";
import type { LedgerList, LedgerRow } from "./types";

type Props = {
  result: LedgerList | null;
};

const columns: ColumnDef<LedgerRow>[] = [
  {
    key: "occurred_at",
    header: "业务时间(occurred_at)",
    render: (row) =>
      row.occurred_at
        ? String(row.occurred_at).replace("T", " ").replace("Z", "")
        : "-",
  },
  {
    key: "created_at",
    header: "写入时间(created_at)",
    render: (row) =>
      row.created_at
        ? String(row.created_at).replace("T", " ").replace("Z", "")
        : "-",
  },
  { key: "id", header: "ID", align: "right", width: 80 },
  {
    key: "warehouse_id",
    header: "仓库",
    align: "right",
    width: 80,
  },
  {
    key: "item_id",
    header: "商品ID",
    align: "right",
    width: 90,
  },
  {
    key: "batch_code",
    header: "批次",
    width: 120,
  },
  {
    key: "delta",
    header: "delta",
    align: "right",
    render: (row) => {
      const v = row.delta;
      const cls =
        v > 0
          ? "text-emerald-600 font-semibold"
          : v < 0
            ? "text-rose-600 font-semibold"
            : "text-slate-700";
      return <span className={cls}>{v}</span>;
    },
  },
  {
    key: "after_qty",
    header: "after_qty",
    align: "right",
  },
  {
    key: "reason",
    header: "原因(reason)",
    width: 120,
  },
  {
    key: "movement_type",
    header: "动作类型(movement_type)",
    width: 120,
    render: (row) => row.movement_type || "-",
  },
  {
    key: "ref",
    header: "ref",
    render: (row) => row.ref || "-",
    width: 220,
  },
  {
    key: "trace_id",
    header: "trace_id",
    render: (row) =>
      row.trace_id ? (
        <a
          href={`/trace?trace_id=${encodeURIComponent(
            row.trace_id,
          )}${row.ref ? `&focus_ref=${encodeURIComponent(row.ref)}` : ""}`}
          className="text-sky-700 hover:underline font-mono text-[11px]"
        >
          {row.trace_id}
        </a>
      ) : (
        "-"
      ),
    width: 260,
  },
  {
    key: "actions",
    header: "操作",
    width: 180,
    render: (row) => (
      <div className="flex flex-wrap justify-end gap-1 text-[11px]">
        <a
          href={`/tools/stocks?item_id=${row.item_id}&warehouse_id=${row.warehouse_id}&batch_code=${encodeURIComponent(
            row.batch_code,
          )}`}
          className="inline-flex items-center rounded border border-slate-300 px-2 py-0.5 text-[11px] text-slate-700 hover:bg-slate-50"
        >
          看库存
        </a>
        {row.trace_id && (
          <a
            href={`/trace?trace_id=${encodeURIComponent(
              row.trace_id,
            )}${row.ref ? `&focus_ref=${encodeURIComponent(row.ref)}` : ""}`}
            className="inline-flex items-center rounded border border-slate-300 px-2 py-0.5 text-[11px] text-slate-700 hover:bg-slate-50"
          >
            看 Trace
          </a>
        )}
      </div>
    ),
  },
];

export const LedgerBookTable: React.FC<Props> = ({ result }) => {
  const totalText = `共 ${result?.total ?? 0} 条记录（展示前 ${
    result?.items?.length ?? 0
  } 条）`;

  return (
    <SectionCard
      title="台账流水（总账视图）"
      description={totalText}
      className="rounded-none p-6 md:p-7 space-y-4 flex-1 flex flex-col min-h-[55vh]"
    >
      <div className="flex-1 min-h-0">
        <DataTable<LedgerRow>
          columns={columns}
          rows={result?.items ?? []}
          emptyText="当前时间窗口内没有台账流水。"
          className="h-full text-sm"
        />
      </div>
    </SectionCard>
  );
};
