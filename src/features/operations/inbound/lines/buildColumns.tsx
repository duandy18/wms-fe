// src/features/operations/inbound/lines/buildColumns.tsx

import React from "react";
import type { ColumnDef } from "../../../../components/wmsdu/StandardTable";
import type { ReceiveTaskLine } from "../../../receive-tasks/api";
import { formatUnitExpr, hasAnyDate, needsBatch } from "./lineUtils";
import { SupplementLink } from "../SupplementLink";

function fmt(v: string | null | undefined): string {
  return v && v.trim() ? v : "-";
}

export function buildInboundLinesColumns(args: {
  taskStatus: string | null;
  onMetaBlur: (
    line: ReceiveTaskLine,
    patch: { batch_code?: string; production_date?: string; expiry_date?: string },
  ) => void;
}): ColumnDef<ReceiveTaskLine>[] {
  const { taskStatus, onMetaBlur: _onMetaBlur } = args;
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
          <span className="text-base text-slate-500">{l.spec_text ?? "-"}</span>
        </div>
      ),
    },
    {
      key: "code",
      header: "商品编码",
      render: (l) => (
        <div className="flex flex-col py-1 text-sm text-slate-600">
          {l.item_sku ? (
            <span className="font-mono">{l.item_sku}</span>
          ) : (
            <span className="text-slate-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: "uom",
      header: "单位",
      render: (l) => (
        <span className="text-base text-slate-800">{formatUnitExpr(l)}</span>
      ),
    },
    {
      key: "batch",
      header: "批次",
      render: (l) => (
        <span className={`text-base ${disabled ? "text-slate-500" : "text-slate-800"}`}>
          {fmt(l.batch_code)}
        </span>
      ),
    },
    {
      key: "production_date",
      header: "生产日期",
      render: (l) => (
        <span className={`text-base ${disabled ? "text-slate-500" : "text-slate-800"}`}>
          {fmt(l.production_date)}
        </span>
      ),
    },
    {
      key: "expiry_date",
      header: "到期日期",
      render: (l) => (
        <span className={`text-base ${disabled ? "text-slate-500" : "text-slate-800"}`}>
          {fmt(l.expiry_date)}
        </span>
      ),
    },
    {
      key: "expected_qty",
      header: "应收",
      align: "right",
      render: (l) => (
        <span className="font-mono text-lg">{l.expected_qty ?? "-"}</span>
      ),
    },
    {
      key: "scanned_qty",
      header: "实收（累计）",
      align: "right",
      render: (l) => (
        <span className="font-mono text-lg">{l.scanned_qty ?? 0}</span>
      ),
    },
    {
      key: "variance",
      header: "差异",
      align: "right",
      render: (l) => {
        if (l.expected_qty == null) return "-";
        const scanned = l.scanned_qty ?? 0;
        const expected = l.expected_qty ?? 0;
        const v = scanned - expected;
        const cls =
          v === 0
            ? "text-emerald-700"
            : v > 0
            ? "text-amber-700"
            : "text-rose-700";
        return <span className={`font-mono text-lg ${cls}`}>{v}</span>;
      },
    },
    {
      key: "status",
      header: "行状态",
      render: (l) => (
        <span className="text-base text-slate-800">{l.status}</span>
      ),
    },
    {
      key: "hint",
      header: "提示",
      render: (l) => {
        const scanned = l.scanned_qty ?? 0;

        if (scanned === 0) {
          return <span className="text-base text-slate-400">未收货</span>;
        }

        if (needsBatch(l)) {
          return (
            <span className="text-base text-amber-700">
              需要补录批次/日期（
              <SupplementLink source="purchase">去补录</SupplementLink>）
            </span>
          );
        }

        if (hasAnyDate(l)) {
          return <span className="text-base text-emerald-700">已补录</span>;
        }

        return (
          <span className="text-base text-slate-600">
            批次已填，日期未填（如需补录{" "}
            <SupplementLink source="purchase">去补录</SupplementLink>）
          </span>
        );
      },
    },
  ];
}
