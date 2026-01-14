// src/features/purchase-orders/PurchaseOrderCurrentReport.tsx
// 本次采购报告（放大版 Cockpit 视图）

import React from "react";
import type { PurchaseOrderDetail } from "./api";

interface Props {
  po: PurchaseOrderDetail | null;
}

const parseMoney = (v: string | null | undefined): number => {
  if (!v) return 0;
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
};

const formatTs = (ts: string | null | undefined): string =>
  ts ? ts.replace("T", " ").replace("Z", "") : "-";

/**
 * 本次采购报告（只针对最近一次创建成功的采购单）
 */
export const PurchaseOrderCurrentReport: React.FC<Props> = ({ po }) => {
  if (!po) {
    return (
      <section className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-base text-slate-500">
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
      "采购单位",
      "每件数量",
      "订购件数",
      "数量(最小单位)",
      "单价(每最小单位)",
      "行金额",
    ];

    const dataRows = po.lines.map((l) => {
      const qtyCases = l.qty_cases ?? l.qty_ordered ?? 0;
      const unitsPerCase = l.units_per_case ?? 1;
      const qtyBase = qtyCases * unitsPerCase;
      return [
        l.line_no,
        l.item_id,
        l.item_name ?? "",
        l.spec_text ?? "",
        l.base_uom ?? "",
        l.purchase_uom ?? "",
        unitsPerCase,
        qtyCases,
        qtyBase,
        l.supply_price ?? "",
        l.line_amount ?? "",
      ];
    });

    const sumRow = [
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      totalQtyCases,
      totalUnits,
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
    <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
      {/* 顶部标题 + 汇总信息 + 导出按钮 */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-900">
            采购报告（本次采购单）
          </h3>
          <p className="text-base text-slate-600">
            采购单号：#{po.id}，供应商：{po.supplier_name ?? po.supplier}，
            仓库：{po.warehouse_id}，采购人：{po.purchaser}，采购时间：
            {formatTs(po.purchase_time)}。
          </p>
          <p className="text-base text-slate-600">
            行数：{lineCount}，订购件数：{totalQtyCases}，折算最小单位数：
            {totalUnits}，总金额：{totalAmount.toFixed(2)}。
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="self-start rounded-xl border border-slate-300 px-4 py-2 text-base font-medium text-slate-800 hover:bg-slate-50"
        >
          导出本单 CSV
        </button>
      </div>

      {/* 行明细表（大字号） */}
      <div className="overflow-x-auto text-base">
        <table className="min-w-[960px] border border-slate-200 border-collapse">
          <thead>
            <tr className="bg-slate-50 text-sm font-semibold text-slate-700">
              <th className="border border-slate-200 px-3 py-2 text-left">
                行号
              </th>
              <th className="border border-slate-200 px-3 py-2 text-left">
                Item ID
              </th>
              <th className="border border-slate-200 px-3 py-2 text-left">
                商品名
              </th>
              <th className="border border-slate-200 px-3 py-2 text-left">
                规格
              </th>
              <th className="border border-slate-200 px-3 py-2 text-left">
                最小单位
              </th>
              <th className="border border-slate-200 px-3 py-2 text-left">
                采购单位
              </th>
              <th className="border border-slate-200 px-3 py-2 text-right">
                每件数量
              </th>
              <th className="border border-slate-200 px-3 py-2 text-right">
                订购件数
              </th>
              <th className="border border-slate-200 px-3 py-2 text-right">
                数量(最小单位)
              </th>
              <th className="border border-slate-200 px-3 py-2 text-right">
                单价(每最小单位)
              </th>
              <th className="border border-slate-200 px-3 py-2 text-right">
                行金额
              </th>
            </tr>
          </thead>
          <tbody>
            {po.lines.map((l) => {
              const qtyCases = l.qty_cases ?? l.qty_ordered ?? 0;
              const unitsPerCase = l.units_per_case ?? 1;
              const qtyBase = qtyCases * unitsPerCase;

              return (
                <tr
                  key={l.id}
                  className="border-t border-slate-100 align-top"
                >
                  <td className="border border-slate-200 px-3 py-2 text-left">
                    {l.line_no}
                  </td>
                  <td className="border border-slate-200 px-3 py-2 text-left font-mono">
                    {l.item_id}
                  </td>
                  <td className="border border-slate-200 px-3 py-2 text-left">
                    <div className="font-medium text-slate-900">
                      {l.item_name ?? "-"}
                    </div>
                  </td>
                  <td className="border border-slate-200 px-3 py-2 text-left text-slate-700">
                    {l.spec_text ?? "-"}
                  </td>
                  <td className="border border-slate-200 px-3 py-2 text-left">
                    {l.base_uom ?? "-"}
                  </td>
                  <td className="border border-slate-200 px-3 py-2 text-left">
                    {l.purchase_uom ?? "-"}
                  </td>
                  <td className="border border-slate-200 px-3 py-2 text-right font-mono">
                    {unitsPerCase}
                  </td>
                  <td className="border border-slate-200 px-3 py-2 text-right font-mono">
                    {qtyCases}
                  </td>
                  <td className="border border-slate-200 px-3 py-2 text-right font-mono">
                    {qtyBase}
                  </td>
                  <td className="border border-slate-200 px-3 py-2 text-right font-mono">
                    {l.supply_price ?? "-"}
                  </td>
                  <td className="border border-slate-200 px-3 py-2 text-right font-mono">
                    {l.line_amount ?? "-"}
                  </td>
                </tr>
              );
            })}

            <tr className="bg-slate-50 font-semibold">
              <td
                className="border border-slate-200 px-3 py-2 text-left"
                colSpan={7}
              >
                合计
              </td>
              <td className="border border-slate-200 px-3 py-2 text-right font-mono">
                {totalQtyCases}
              </td>
              <td className="border border-slate-200 px-3 py-2 text-right font-mono">
                {totalUnits}
              </td>
              <td className="border border-slate-200 px-3 py-2" />
              <td className="border border-slate-200 px-3 py-2 text-right font-mono">
                {totalAmount.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};
