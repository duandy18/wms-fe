// src/features/operations/inbound/lines/buildColumns.tsx

import React from "react";
import type { ColumnDef } from "../../../../components/wmsdu/StandardTable";
import type { ReceiveTaskLine } from "../../../receive-tasks/api";
import { formatUnitExpr, hasAnyDate, needsBatch } from "./lineUtils";

export function buildInboundLinesColumns(args: {
  taskStatus: string | null;
  onMetaBlur: (
    line: ReceiveTaskLine,
    patch: { batch_code?: string; production_date?: string; expiry_date?: string },
  ) => void;
}): ColumnDef<ReceiveTaskLine>[] {
  const { taskStatus, onMetaBlur } = args;
  const disabled = taskStatus === "COMMITTED";

  return [
    {
      key: "item",
      header: "商品",
      render: (l) => (
        <div className="flex flex-col py-1">
          <span className="text-lg font-semibold text-slate-900">
            {l.item_name ?? "(未命名商品)"}
          </span>
          <span className="text-base text-slate-500">{l.spec_text ?? "-"}</span>
        </div>
      ),
    },
    {
      key: "ids",
      header: "ID / SKU",
      render: (l) => (
        <div className="flex flex-col py-1 text-sm text-slate-600">
          <span className="font-mono">Item: {l.item_id}</span>
          {l.item_sku && <span className="font-mono">SKU: {l.item_sku}</span>}
        </div>
      ),
    },
    {
      key: "uom",
      header: "单位",
      render: (l) => <span className="text-base text-slate-800">{formatUnitExpr(l)}</span>,
    },
    {
      key: "batch",
      header: "批次",
      render: (l) => (
        <input
          className="w-40 rounded-lg border border-slate-300 px-4 py-2 text-base font-mono"
          defaultValue={l.batch_code ?? ""}
          disabled={disabled}
          placeholder='批次编码（无保质期可留空，系统将用 "NOEXP"）'
          onBlur={(e) => onMetaBlur(l, { batch_code: e.target.value })}
        />
      ),
    },
    {
      key: "production_date",
      header: "生产日期",
      render: (l) => (
        <input
          type="date"
          className="w-44 rounded-lg border border-slate-300 px-4 py-2 text-base"
          defaultValue={l.production_date ?? ""}
          disabled={disabled}
          onBlur={(e) => onMetaBlur(l, { production_date: e.target.value })}
        />
      ),
    },
    {
      key: "expiry_date",
      header: "到期日期",
      render: (l) => (
        <input
          type="date"
          className="w-44 rounded-lg border border-slate-300 px-4 py-2 text-base"
          defaultValue={l.expiry_date ?? ""}
          disabled={disabled}
          onBlur={(e) => onMetaBlur(l, { expiry_date: e.target.value })}
        />
      ),
    },
    {
      key: "expected_qty",
      header: "应收",
      align: "right",
      render: (l) => <span className="font-mono text-lg">{l.expected_qty ?? "-"}</span>,
    },
    {
      key: "scanned_qty",
      header: "实收（累计）",
      align: "right",
      render: (l) => <span className="font-mono text-lg">{l.scanned_qty ?? 0}</span>,
    },
    {
      key: "variance",
      header: "差异(实收-应收)",
      align: "right",
      render: (l) => {
        if (l.expected_qty == null) return "-";
        const scanned = l.scanned_qty ?? 0;
        const expected = l.expected_qty ?? 0;
        const v = scanned - expected;
        const cls =
          v === 0 ? "text-emerald-700" : v > 0 ? "text-amber-700" : "text-rose-700";
        return <span className={`font-mono text-lg ${cls}`}>{v}</span>;
      },
    },
    {
      key: "status",
      header: "行状态",
      render: (l) => <span className="text-base text-slate-800">{l.status}</span>,
    },
    {
      key: "hint",
      header: "提示",
      render: (l) => {
        if (needsBatch(l)) {
          return (
            <span className="text-base text-amber-700">
              已有实收数量，但批次为空。若为无保质期商品可留空（系统将用 NOEXP）；
              若为有保质期商品必须填写真实批次。
            </span>
          );
        }

        const scanned = l.scanned_qty ?? 0;
        if (scanned !== 0) {
          if (hasAnyDate(l)) {
            return (
              <span className="text-base text-emerald-700">
                批次已填，日期已填（或部分已填）。
              </span>
            );
          }
          return (
            <span className="text-base text-slate-600">
              批次已填，日期为空：无保质期商品无需日期；有保质期商品提交时会要求至少填一项日期。
            </span>
          );
        }

        return <span className="text-base text-slate-400">尚未实收，无需填写批次/日期。</span>;
      },
    },
  ];
}
