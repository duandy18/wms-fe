// src/features/purchase-orders/ItemsReportTable.tsx

import React from "react";
import type { ItemReportRow } from "./reportsApi";
import { StandardTable, type ColumnDef } from "../../components/wmsdu/StandardTable";

interface ItemsReportTableProps {
  rows: ItemReportRow[];
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

function clean(v: string | null | undefined): string {
  const s = (v ?? "").trim();
  return s ? s : "—";
}

export const ItemsReportTable: React.FC<ItemsReportTableProps> = ({ rows, totalAmount }) => {
  const handleExportCsv = () => {
    const header = [
      "商品ID",
      "SKU",
      "商品名称",
      "条码",
      "品牌",
      "分类",
      "规格",
      "供应商",
      "单据数",
      "订购件数",
      "折算最小单位数",
      "金额合计",
      "平均单价(每最小单位)",
    ];

    const dataRows = rows.map((r) => [
      String(r.item_id),
      r.item_sku ?? "",
      r.item_name ?? "",
      clean(r.barcode),
      clean(r.brand),
      clean(r.category),
      r.spec_text ?? "",
      r.supplier_name ?? "",
      String(r.order_count),
      String(r.total_qty_cases),
      String(r.total_units),
      r.total_amount ?? "",
      r.avg_unit_price ?? "",
    ]);

    const sumRow = [
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "合计",
      "",
      "",
      "",
      totalAmount.toFixed(2),
      "",
    ];

    const csvLines = [header, ...dataRows, sumRow]
      .map((cols) =>
        cols
          .map((c) => {
            const v = String(c ?? "").replace(/"/g, '""');
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
    a.download = "purchase-report-items.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const columns: ColumnDef<ItemReportRow>[] = [
    {
      key: "item",
      header: "商品",
      render: (r) => (
        <div>
          <div className="font-medium text-slate-900">{r.item_name ?? "-"}</div>
          <div className="mt-0.5 text-[11px] text-slate-400 font-mono">ID：{r.item_id}</div>
        </div>
      ),
    },
    {
      key: "barcode",
      header: "条码",
      render: (r) => <span className="font-mono text-[12px]">{clean(r.barcode)}</span>,
    },
    {
      key: "brand",
      header: "品牌",
      render: (r) => clean(r.brand),
    },
    {
      key: "category",
      header: "分类",
      render: (r) => clean(r.category),
    },
    {
      key: "spec_text",
      header: "规格",
      render: (r) => r.spec_text ?? "-",
    },
    {
      key: "supplier_name",
      header: "供应商",
      render: (r) => r.supplier_name ?? "-",
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
    {
      key: "avg_unit_price",
      header: "平均单价(每最小单位)",
      align: "right",
      render: (r) => r.avg_unit_price ?? "-",
    },
  ];

  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center justify-between">
        <div className="text-slate-700">
          商品数：{rows.length}；金额合计：{formatMoney(totalAmount)}
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          导出 CSV
        </button>
      </div>

      <StandardTable<ItemReportRow>
        columns={columns}
        data={rows}
        getRowKey={(r) => `${r.item_id}-${r.supplier_id ?? "null"}`}
        emptyText="暂无数据"
        footer={
          rows.length > 0 ? (
            <span className="text-xs text-slate-500">合计金额：{formatMoney(totalAmount)}</span>
          ) : undefined
        }
      />
    </div>
  );
};
