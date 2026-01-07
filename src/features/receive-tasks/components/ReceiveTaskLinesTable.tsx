// src/features/receive-tasks/components/ReceiveTaskLinesTable.tsx

import React from "react";
import {
  StandardTable,
  type ColumnDef,
} from "../../../components/wmsdu/StandardTable";
import type { ReceiveTaskLine } from "../api";

export const ReceiveTaskLinesTable: React.FC<{
  lines: ReceiveTaskLine[];
  isCommitted: boolean;
  updatingLineId: number | null;
  onChangeScanned: (line: ReceiveTaskLine, nextScanned: number) => void;
}> = ({ lines, isCommitted, updatingLineId, onChangeScanned }) => {
  const columns: ColumnDef<ReceiveTaskLine>[] = [
    {
      key: "item_id",
      header: "Item ID",
      render: (l) => <span className="font-mono text-[11px]">{l.item_id}</span>,
    },
    {
      key: "item_name",
      header: "商品名",
      render: (l) => l.item_name ?? "-",
    },
    {
      key: "expected_qty",
      header: "应收数量",
      align: "right",
      render: (l) => l.expected_qty ?? "-",
    },
    {
      key: "scanned_qty",
      header: "实收数量",
      align: "right",
      render: (l) => {
        const disabled = isCommitted || updatingLineId === l.id;
        return (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              disabled={disabled}
              className="rounded border px-1 text-xs disabled:opacity-50"
              onClick={() => onChangeScanned(l, Math.max(0, l.scanned_qty - 1))}
            >
              -
            </button>

            <input
              className="w-16 rounded border border-slate-300 px-1 py-0.5 text-right text-xs"
              type="number"
              value={l.scanned_qty}
              disabled={disabled}
              onChange={(e) => onChangeScanned(l, Number(e.target.value || "0"))}
            />

            <button
              type="button"
              disabled={disabled}
              className="rounded border px-1 text-xs disabled:opacity-50"
              onClick={() => onChangeScanned(l, l.scanned_qty + 1)}
            >
              +
            </button>
          </div>
        );
      },
    },
    {
      key: "variance",
      header: "差异(实收-应收)",
      align: "right",
      render: (l) => {
        if (l.expected_qty == null) return "-";
        const v = l.scanned_qty - l.expected_qty;
        const cls =
          v === 0
            ? "text-emerald-700"
            : v > 0
            ? "text-amber-700"
            : "text-rose-700";
        return <span className={cls}>{v}</span>;
      },
    },
    {
      key: "status",
      header: "状态",
      render: (l) => l.status,
    },
  ];

  return (
    <StandardTable<ReceiveTaskLine>
      columns={columns}
      data={lines}
      dense
      getRowKey={(l) => l.id}
      emptyText="暂无行数据"
      footer={<span className="text-xs text-slate-500">共 {lines.length} 行</span>}
    />
  );
};
