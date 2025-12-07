// src/features/purchase-orders/DailyReportTable.tsx

import React from "react";
import type { DailyReportRow } from "./reportsApi";
import {
  StandardTable,
  type ColumnDef,
} from "../../components/wmsdu/StandardTable";

interface DailyReportTableProps {
  rows: DailyReportRow[];
  totalAmount: number;
}

const parseMoney = (v: string | null | undefined): number => {
  if (!v) return 0;
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
};

const formatMoney = (n: number): string =>
  n.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const DailyReportTable: React.FC<DailyReportTableProps> = ({
  rows,
  totalAmount,
}) => {
  const handleExportCsv = () => {
    const header = [
      "日期",
      "单据数",
      "订购件数",
      "折算最小单位数",
      "金额合计",
    ];

    const dataRows = rows.map((r) => [
      r.day,
      String(r.order_count),
      String(r.total_qty_cases),
      String(r.total_units),
      r.total_amount ?? "",
    ]);

    const sumRow = ["", "", "", "合计", totalAmount.toFixed(2)];

    const csvLines = [header, ...dataRows, sumRow]
      .map((cols) =>
        cols
          .map((c) => {
            const v = c.replace(/"/g, '""');
            return `"${v}"`;
          })
          .join(","),
      )
      .join("\r\n");

    const blob = new Blob([csvLines], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "purchase-report-daily.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const columns: ColumnDef<DailyReportRow>[] = [
    {
      key: "day",
      header: "日期",
      render: (r) => r.day,
    },
    {
      key: "order_count",
      header: "单据数",
      align: "right",
      render: (r) => r.order_count,
    },
    {
      key: "total_qty_cases",
      header: "订购件数",
      align: "right",
      render: (r) => r.total_qty_cases,
    },
    {
      key: "total_units",
      header: "折算最小单位数",
      align: "right",
      render: (r) => r.total_units,
    },
    {
      key: "total_amount",
      header: "金额合计",
      align: "right",
      render: (r) => formatMoney(parseMoney(r.total_amount)),
    },
  ];

  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center justify-between">
        <div className="text-slate-700">
          天数：{rows.length}；金额合计：
          {formatMoney(totalAmount)}
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          导出 CSV
        </button>
      </div>

      <StandardTable<DailyReportRow>
        columns={columns}
        data={rows}
        dense={false}
        getRowKey={(r) => r.day}
        emptyText="暂无数据"
        footer={
          rows.length > 0 ? (
            <span className="text-xs text-slate-500">
              合计金额：{formatMoney(totalAmount)}
            </span>
          ) : undefined
        }
      />
    </div>
  );
};
