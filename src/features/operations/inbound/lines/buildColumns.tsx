// src/features/operations/inbound/lines/buildColumns.tsx

import React from "react";
import type { ColumnDef } from "../../../../components/wmsdu/StandardTable";
import type { ReceiveTaskLine } from "../../../receive-tasks/api";
import { formatUnitExpr, hasAnyDate, needsBatch } from "./lineUtils";

export function buildInboundLinesColumns(args: {
  taskStatus: string | null;
  metaMode?: "edit" | "hint";
  onMetaBlur: (
    line: ReceiveTaskLine,
    patch: {
      batch_code?: string;
      production_date?: string;
      expiry_date?: string;
    },
  ) => void;
}): ColumnDef<ReceiveTaskLine>[] {
  const { taskStatus, metaMode = "edit", onMetaBlur } = args;
  const disabled = taskStatus === "COMMITTED";

  return [
    {
      key: "item",
      header: "商品",
      render: (l) => (
        <div className="flex flex-col py-1">
          <span className="text-lg font-semibold text-slate-900">
            {l.item_name ?? "（未命名商品）"}
          </span>
          <span className="text-base text-slate-500">
            {l.spec_text ?? "-"}
          </span>
        </div>
      ),
    },
    {
      key: "uom",
      header: "单位",
      render: (l) => (
        <span className="text-base text-slate-800">
          {formatUnitExpr(l)}
        </span>
      ),
    },
    {
      key: "batch",
      header: "批次",
      render: (l) =>
        metaMode === "edit" ? (
          <input
            className="w-40 rounded-lg border border-slate-300 px-4 py-2 text-base font-mono"
            defaultValue={l.batch_code ?? ""}
            disabled={disabled}
            onBlur={(e) =>
              onMetaBlur(l, { batch_code: e.target.value })
            }
          />
        ) : (
          <span className="font-mono">
            {l.batch_code ?? "-"}
          </span>
        ),
    },
    {
      key: "production_date",
      header: "生产日期",
      render: (l) =>
        metaMode === "edit" ? (
          <input
            type="date"
            className="w-44 rounded-lg border border-slate-300 px-4 py-2 text-base"
            defaultValue={l.production_date ?? ""}
            disabled={disabled}
            onBlur={(e) =>
              onMetaBlur(l, {
                production_date: e.target.value,
              })
            }
          />
        ) : (
          <span>{l.production_date ?? "-"}</span>
        ),
    },
    {
      key: "expiry_date",
      header: "到期日期",
      render: (l) =>
        metaMode === "edit" ? (
          <input
            type="date"
            className="w-44 rounded-lg border border-slate-300 px-4 py-2 text-base"
            defaultValue={l.expiry_date ?? ""}
            disabled={disabled}
            onBlur={(e) =>
              onMetaBlur(l, { expiry_date: e.target.value })
            }
          />
        ) : (
          <span>{l.expiry_date ?? "-"}</span>
        ),
    },
    {
      key: "expected_qty",
      header: "应收",
      align: "right",
      render: (l) => (
        <span className="font-mono text-lg">
          {l.expected_qty ?? "-"}
        </span>
      ),
    },
    {
      key: "scanned_qty",
      header: "实收",
      align: "right",
      render: (l) => (
        <span className="font-mono text-lg">
          {l.scanned_qty ?? 0}
        </span>
      ),
    },
    {
      key: "variance",
      header: "差异",
      align: "right",
      render: (l) => {
        if (l.expected_qty == null) return "-";
        const v =
          (l.scanned_qty ?? 0) - (l.expected_qty ?? 0);
        const cls =
          v === 0
            ? "text-emerald-700"
            : v > 0
            ? "text-amber-700"
            : "text-rose-700";
        return (
          <span className={`font-mono text-lg ${cls}`}>
            {v}
          </span>
        );
      },
    },
    {
      key: "hint",
      header: "提示",
      render: (l) => {
        if (needsBatch(l)) {
          return (
            <span className="text-base text-amber-700">
              需要补录批次/日期
            </span>
          );
        }
        if (hasAnyDate(l)) {
          return (
            <span className="text-base text-emerald-700">
              已补录
            </span>
          );
        }
        return (
          <span className="text-base text-slate-400">
            -
          </span>
        );
      },
    },
  ];
}
