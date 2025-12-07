// src/features/purchase-orders/PurchaseOrderCurrentReport.tsx
import React from "react";
import type { PurchaseOrderWithLines } from "./api";

interface Props {
  po: PurchaseOrderWithLines | null;
}

const parseMoney = (v: string | null | undefined): number => {
  if (!v) return 0;
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
};

/**
 * 本次采购报告（只针对最近一次创建成功的采购单）
 */
export const PurchaseOrderCurrentReport: React.FC<Props> = ({ po }) => {
  if (!po) {
    return (
      <section className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 text-xs text-slate-500">
        尚未生成采购报告。成功创建一张采购单后，将在此处展示该采购单的汇总信息，并支持导出 CSV。
      </section>
    );
  }

  const totalAmount = parseMoney(po.total_amount);
  const lineCount = po.lines.length;
  const totalQtyCases = po.lines.reduce(
    (sum, l) => sum + (l.qty_cases ?? l.qty_ordered ?? 0),
    0,
  );
  const totalUnits = po.lines.reduce(
    (sum, l) =>
      sum +
      (l.qty_cases ?? l.qty_ordered ?? 0) *
        (l.units_per_case ?? 1),
    0,
  );

  const handleExportCsv = () => {
    const header = [
      "行号",
      "Item ID",
      "商品名",
      "规格",
      "最小单位",
      "每件数量",
      "订购件数",
      "单价",
      "行金额",
    ];

    const dataRows = po.lines.map((l) => [
      l.line_no,
      l.item_id,
      l.item_name ?? "",
      l.spec_text ?? "",
      l.purchase_uom ?? "",
      l.units_per_case ?? "",
      l.qty_ordered,
      l.supply_price ?? "",
      l.line_amount ?? "",
    ]);

    const sumRow = [
      "",
      "",
      "",
      "",
      "",
      "",
      totalQtyCases,
      "",
      totalAmount.toFixed(2),
    ];

    const csv = [header, ...dataRows, sumRow]
      .map((row) =>
        row
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\r\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `purchase-order-${po.id}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            采购报告（本次采购单）
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            采购单号：#{po.id}，供应商：{po.supplier_name ?? po.supplier}，
            行数：{lineCount}，总件数：{totalQtyCases}，折算最小单位数：
            {totalUnits}，总金额：{totalAmount.toFixed(2)}。
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="rounded-md border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50"
        >
          导出本单 CSV
        </button>
      </div>

      <div className="overflow-x-auto text-xs">
        <table className="min-w-[720px] border border-slate-200 border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[11px] font-semibold text-slate-600">
              <th className="border border-slate-200 px-2 py-1 text-left">行号</th>
              <th className="border border-slate-200 px-2 py-1 text-left">Item ID</th>
              <th className="border border-slate-200 px-2 py-1 text-left">商品名</th>
              <th className="border border-slate-200 px-2 py-1 text-left">规格</th>
              <th className="border border-slate-200 px-2 py-1 text-left">最小单位</th>
              <th className="border border-slate-200 px-2 py-1 text-right">每件数量</th>
              <th className="border border-slate-200 px-2 py-1 text-right">订购件数</th>
              <th className="border border-slate-200 px-2 py-1 text-right">单价</th>
              <th className="border border-slate-200 px-2 py-1 text-right">行金额</th>
            </tr>
          </thead>
          <tbody>
            {po.lines.map((l) => (
              <tr key={l.id} className="border-t border-slate-100">
                <td className="border border-slate-200 px-2 py-1 text-left">
                  {l.line_no}
                </td>
                <td className="border border-slate-200 px-2 py-1 text-left">
                  {l.item_id}
                </td>
                <td className="border border-slate-200 px-2 py-1 text-left">
                  {l.item_name ?? "-"}
                </td>
                <td className="border border-slate-200 px-2 py-1 text-left">
                  {l.spec_text ?? "-"}
                </td>
                <td className="border border-slate-200 px-2 py-1 text-left">
                  {l.purchase_uom ?? "-"}
                </td>
                <td className="border border-slate-200 px-2 py-1 text-right font-mono">
                  {l.units_per_case ?? "-"}
                </td>
                <td className="border border-slate-200 px-2 py-1 text-right font-mono">
                  {l.qty_ordered}
                </td>
                <td className="border border-slate-200 px-2 py-1 text-right font-mono">
                  {l.supply_price ?? "-"}
                </td>
                <td className="border border-slate-200 px-2 py-1 text-right font-mono">
                  {l.line_amount ?? "-"}
                </td>
              </tr>
            ))}

            <tr className="bg-slate-50 font-semibold">
              <td
                className="border border-slate-200 px-2 py-1 text-left"
                colSpan={6}
              >
                合计
              </td>
              <td className="border border-slate-200 px-2 py-1 text-right font-mono">
                {totalQtyCases}
              </td>
              <td className="border border-slate-200 px-2 py-1" />
              <td className="border border-slate-200 px-2 py-1 text-right font-mono">
                {totalAmount.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};
