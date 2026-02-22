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

function safeInt(v: unknown, fallback: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.trunc(n);
}

function lineCaseQty(l: unknown): number {
  const x = l as { qty_ordered_case_input?: number | null };
  return x.qty_ordered_case_input != null ? safeInt(x.qty_ordered_case_input, 0) : 0;
}

function lineCaseRatio(l: unknown): number {
  const x = l as { case_ratio_snapshot?: number | null };
  const r = safeInt(x.case_ratio_snapshot, 0);
  return r > 0 ? r : 1;
}

function linePurchaseUom(l: unknown): string {
  const x = l as { case_uom_snapshot?: string | null };
  return String(x.case_uom_snapshot ?? "").trim();
}

function lineBaseQty(l: unknown): number {
  const x = l as { qty_ordered_base?: number | null };
  const base = safeInt(x.qty_ordered_base, 0);
  return base > 0 ? base : 0;
}

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

  const totalUnits = po.lines.reduce((sum, l) => sum + lineBaseQty(l), 0);
  const totalQtyCases = po.lines.reduce((sum, l) => sum + lineCaseQty(l), 0);

  const handleExportCsv = () => {
    const header = [
      "行号",
      "Item ID",
      "商品名",
      "规格",
      "最小单位",
      "采购单位",
      "倍率(每采购单位含多少最小单位)",
      "订购数量(输入痕迹)",
      "数量(最小单位事实)",
      "单价(每最小单位)",
      "行金额",
    ];

    const dataRows = po.lines.map((l) => {
      const qtyCases = lineCaseQty(l);
      const ratio = lineCaseRatio(l);
      const qtyBase = lineBaseQty(l);
      const pu = linePurchaseUom(l);

      const row = l as {
        line_no: number;
        item_id: number;
        item_name?: string | null;
        spec_text?: string | null;
        base_uom?: string | null;
        uom_snapshot?: string | null;
        supply_price?: string | null;
        line_amount?: string | null;
      };

      const baseUom = String(row.base_uom ?? "").trim() || String(row.uom_snapshot ?? "").trim();

      return [
        row.line_no,
        row.item_id,
        row.item_name ?? "",
        row.spec_text ?? "",
        baseUom,
        pu,
        ratio,
        qtyCases,
        qtyBase,
        row.supply_price ?? "",
        row.line_amount ?? "",
      ];
    });

    const sumRow = ["", "", "", "", "", "", "", totalQtyCases, totalUnits, "", totalAmount.toFixed(2)];

    const csv = [header, ...dataRows, sumRow]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
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
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-900">采购报告（本次采购单）</h3>
          <p className="text-base text-slate-600">
            采购单号：#{po.id}，供应商：{po.supplier_name ?? po.supplier}，仓库：{po.warehouse_id}，
            采购人：{po.purchaser}，采购时间：{formatTs(po.purchase_time)}。
          </p>
          <p className="text-base text-slate-600">
            行数：{lineCount}，订购数量（输入痕迹）：{totalQtyCases}，最小单位数（事实）：{totalUnits}
            ，总金额：{totalAmount.toFixed(2)}。
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

      <div className="overflow-x-auto text-base">
        <table className="min-w-[960px] border border-slate-200 border-collapse">
          <thead>
            <tr className="bg-slate-50 text-sm font-semibold text-slate-700">
              <th className="border border-slate-200 px-3 py-2 text-left">行号</th>
              <th className="border border-slate-200 px-3 py-2 text-left">Item ID</th>
              <th className="border border-slate-200 px-3 py-2 text-left">商品名</th>
              <th className="border border-slate-200 px-3 py-2 text-left">规格</th>
              <th className="border border-slate-200 px-3 py-2 text-left">最小单位</th>
              <th className="border border-slate-200 px-3 py-2 text-left">采购单位</th>
              <th className="border border-slate-200 px-3 py-2 text-right">倍率</th>
              <th className="border border-slate-200 px-3 py-2 text-right">订购数量</th>
              <th className="border border-slate-200 px-3 py-2 text-right">数量(最小单位)</th>
              <th className="border border-slate-200 px-3 py-2 text-right">单价(每最小单位)</th>
              <th className="border border-slate-200 px-3 py-2 text-right">行金额</th>
            </tr>
          </thead>
          <tbody>
            {po.lines.map((l) => {
              const qtyCases = lineCaseQty(l);
              const ratio = lineCaseRatio(l);
              const qtyBase = lineBaseQty(l);
              const pu = linePurchaseUom(l);

              const row = l as {
                id: number;
                line_no: number;
                item_id: number;
                item_name?: string | null;
                spec_text?: string | null;
                base_uom?: string | null;
                uom_snapshot?: string | null;
                supply_price?: string | null;
                line_amount?: string | null;
              };

              const baseUom = String(row.base_uom ?? "").trim() || String(row.uom_snapshot ?? "").trim() || "-";

              return (
                <tr key={row.id} className="border-t border-slate-100 align-top">
                  <td className="border border-slate-200 px-3 py-2 text-left">{row.line_no}</td>
                  <td className="border border-slate-200 px-3 py-2 text-left font-mono">{row.item_id}</td>
                  <td className="border border-slate-200 px-3 py-2 text-left">
                    <div className="font-medium text-slate-900">{row.item_name ?? "-"}</div>
                  </td>
                  <td className="border border-slate-200 px-3 py-2 text-left text-slate-700">{row.spec_text ?? "-"}</td>
                  <td className="border border-slate-200 px-3 py-2 text-left">{baseUom}</td>
                  <td className="border border-slate-200 px-3 py-2 text-left">{pu || "-"}</td>
                  <td className="border border-slate-200 px-3 py-2 text-right font-mono">{ratio}</td>
                  <td className="border border-slate-200 px-3 py-2 text-right font-mono">{qtyCases}</td>
                  <td className="border border-slate-200 px-3 py-2 text-right font-mono">{qtyBase}</td>
                  <td className="border border-slate-200 px-3 py-2 text-right font-mono">{row.supply_price ?? "-"}</td>
                  <td className="border border-slate-200 px-3 py-2 text-right font-mono">{row.line_amount ?? "-"}</td>
                </tr>
              );
            })}

            <tr className="bg-slate-50 font-semibold">
              <td className="border border-slate-200 px-3 py-2 text-left" colSpan={7}>
                合计
              </td>
              <td className="border border-slate-200 px-3 py-2 text-right font-mono">{totalQtyCases}</td>
              <td className="border border-slate-200 px-3 py-2 text-right font-mono">{totalUnits}</td>
              <td className="border border-slate-200 px-3 py-2" />
              <td className="border border-slate-200 px-3 py-2 text-right font-mono">{totalAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};
