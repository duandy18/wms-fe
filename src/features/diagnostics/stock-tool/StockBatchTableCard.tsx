// src/features/diagnostics/stock-tool/StockBatchTableCard.tsx
import React from "react";
import { SectionCard } from "../../../components/wmsdu/SectionCard";
import {
  StandardTable,
  type ColumnDef,
} from "../../../components/wmsdu/StandardTable";
import type { StockBatchRow } from "./types";

type StockBatchTableCardProps = {
  total: number;
  totalQty: number;
  rows: StockBatchRow[];
  focusBatchCode?: string;
  onExport: () => void;
};

export const StockBatchTableCard: React.FC<StockBatchTableCardProps> = ({
  total,
  totalQty,
  rows,
  focusBatchCode,
  onExport,
}) => {
  const columns: ColumnDef<StockBatchRow>[] = [
    { key: "warehouse_id", header: "仓库" },
    {
      key: "batch_code",
      header: "批次",
      render: (row) => {
        const isFocus =
          !!focusBatchCode && row.batch_code === focusBatchCode;
        return (
          <span
            className={
              "font-mono " +
              (isFocus
                ? "rounded bg-emerald-50 px-1 text-emerald-700"
                : "")
            }
          >
            {row.batch_code}
            {isFocus && (
              <span className="ml-1 rounded bg-emerald-500 px-1 text-[10px] text-white">
                focus
              </span>
            )}
          </span>
        );
      },
    },
    {
      key: "qty",
      header: "数量",
      align: "right",
    },
    {
      key: "production_date",
      header: "生产日期",
      render: (row) => row.production_date || "-",
    },
    {
      key: "expiry_date",
      header: "有效期",
      render: (row) => row.expiry_date || "-",
    },
    {
      key: "days_to_expiry",
      header: "剩余天数",
      align: "right",
      render: (row) =>
        typeof row.days_to_expiry === "number"
          ? row.days_to_expiry
          : "-",
    },
    {
      key: "actions",
      header: "操作",
      align: "right",
      render: (row) => (
        <div className="flex flex-wrap justify-end gap-1 text-[11px]">
          <a
            href={`/tools/ledger?warehouse_id=${row.warehouse_id}&item_id=${row.item_id}&batch_code=${encodeURIComponent(
              row.batch_code,
            )}`}
            className="inline-flex items-center rounded border border-slate-300 px-2 py-0.5 text-[11px] text-slate-700 hover:bg-slate-50"
          >
            看账本
          </a>
        </div>
      ),
    },
  ];

  return (
    <SectionCard
      title="按批次分布的库存视图"
      description={`批次数量：${total} 个批次，总数量：${totalQty}${
        focusBatchCode ? ` · focus 批次：${focusBatchCode}` : ""
      }`}
      className="rounded-none p-6 md:p-7 space-y-4 flex-1 flex flex-col min-h-[60vh]"
      headerRight={
        <button
          onClick={onExport}
          disabled={!rows || rows.length === 0}
          className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          导出 CSV
        </button>
      }
    >
      <div className="flex-1 min-h-0">
        <StandardTable<StockBatchRow>
          columns={columns}
          data={rows}
          dense
          getRowKey={(row, idx) =>
            `${row.warehouse_id}-${row.batch_code}-${idx}`
          }
          emptyText="暂无批次数据。请先填写 item_id 后查询。"
          footer={
            rows.length > 0 ? (
              <span className="text-xs text-slate-500">
                批次数量：{total}，总数量：{totalQty}
              </span>
            ) : undefined
          }
        />
      </div>
    </SectionCard>
  );
};
