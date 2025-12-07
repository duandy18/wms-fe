// src/features/diagnostics/ledger-tool/LedgerTableCard.tsx
import React from "react";
import { SectionCard } from "../../../components/wmsdu/SectionCard";
import { DataTable } from "../../../components/wmsdu/DataTable";
import type { ColumnDef } from "../../../components/wmsdu/DataTable";
import type { LedgerList, LedgerRow } from "./types";

type Props = {
  result: LedgerList | null;
  onExport: () => void;
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
    width: 220,
    render: (row) => {
      const wh = row.warehouse_id;
      const item = row.item_id;
      const batch = row.batch_code || "";

      const stockHref = `/tools/stocks?item_id=${item}&warehouse_id=${wh}&batch_code=${encodeURIComponent(
        batch,
      )}`;
      const lifelineHref = `${stockHref}#lifeline`;

      return (
        <div className="flex flex-wrap justify-end gap-1 text-[11px]">
          <a
            href={stockHref}
            className="inline-flex items-center rounded border border-slate-300 px-2 py-0.5 text-[11px] text-slate-700 hover:bg-slate-50"
          >
            看库存
          </a>
          <a
            href={lifelineHref}
            className="inline-flex items-center rounded border border-slate-300 px-2 py-0.5 text-[11px] text-slate-700 hover:bg-slate-50"
          >
            批次生命周期
          </a>
        </div>
      );
    },
  },
];

export const LedgerTableCard: React.FC<Props> = ({ result, onExport }) => {
  const totalText = `共 ${result?.total ?? 0} 条记录（展示前 ${
    result?.items?.length ?? 0
  } 条）`;

  return (
    <SectionCard
      title="台账明细"
      description={totalText}
      className="rounded-none p-6 md:p-7 space-y-4 flex-1 flex flex-col min-h-[55vh]"
      headerRight={
        <button
          onClick={onExport}
          disabled={!result || !result.items?.length}
          className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          导出当前页 CSV
        </button>
      }
    >
      <div className="flex-1 min-h-0">
        <DataTable<LedgerRow>
          columns={columns}
          rows={result?.items ?? []}
          emptyText="暂无台账数据。请先设置过滤条件后查询。若不设置任何过滤，仅按时间窗口，则为“台账总账视图”。"
          className="h-full text-sm"
        />
      </div>
    </SectionCard>
  );
};
