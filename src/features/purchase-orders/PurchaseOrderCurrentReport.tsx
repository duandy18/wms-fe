// src/features/purchase-orders/PurchaseOrderCurrentReport.tsx
// 本次采购报告（放大版 Cockpit 视图）

import React, { useMemo } from "react";
import type { PurchaseOrderWithLines } from "./api";
import type { ItemBasic } from "../../master-data/itemsApi";
import { buildItemMap, lookupItem } from "./report/itemLookup";
import { calcTotals, formatTs } from "./report/totals";
import { exportPurchaseOrderCsv } from "./report/csvExport";

interface Props {
  po: PurchaseOrderWithLines | null;
  items: ItemBasic[];
}

export const PurchaseOrderCurrentReport: React.FC<Props> = ({ po, items }) => {
  const itemMap = useMemo(() => buildItemMap(items), [items]);

  if (!po) {
    return (
      <section className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-base text-slate-500">
        尚未生成采购报告。成功创建一张采购单后，将在此处展示该采购单的汇总信息，并支持导出 CSV。
      </section>
    );
  }

  const { totalAmount, lineCount, totalQtyCases, totalUnits } = calcTotals(po);

  const handleExportCsv = () => {
    exportPurchaseOrderCsv({ po, items });
  };

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-900">采购报告（本次采购单）</h3>
          <p className="text-base text-slate-600">
            采购单号：#{po.id}，供应商：{po.supplier_name ?? po.supplier}，仓库：
            {po.warehouse_id}，采购人：{po.purchaser}，采购时间：{formatTs(po.purchase_time)}。
          </p>
          <p className="text-base text-slate-600">
            行数：{lineCount}，订购件数：{totalQtyCases}，折算最小单位数：{totalUnits}，总金额：
            {totalAmount.toFixed(2)}。
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
        <table className="min-w-[1200px] border border-slate-200 border-collapse">
          <thead>
            <tr className="bg-slate-50 text-sm font-semibold text-slate-700">
              <th className="border border-slate-200 px-3 py-2 text-left">行号</th>
              <th className="border border-slate-200 px-3 py-2 text-left">商品</th>
              <th className="border border-slate-200 px-3 py-2 text-left">条码</th>
              <th className="border border-slate-200 px-3 py-2 text-left">品牌</th>
              <th className="border border-slate-200 px-3 py-2 text-left">分类</th>
              <th className="border border-slate-200 px-3 py-2 text-left">规格</th>
              <th className="border border-slate-200 px-3 py-2 text-left">最小单位</th>
              <th className="border border-slate-200 px-3 py-2 text-left">采购单位</th>
              <th className="border border-slate-200 px-3 py-2 text-right">每件数量</th>
              <th className="border border-slate-200 px-3 py-2 text-right">订购件数</th>
              <th className="border border-slate-200 px-3 py-2 text-right">数量(最小单位)</th>
              <th className="border border-slate-200 px-3 py-2 text-right">
                单价(每最小单位)
              </th>
              <th className="border border-slate-200 px-3 py-2 text-right">行金额</th>
            </tr>
          </thead>

          <tbody>
            {po.lines.map((l) => {
              const qtyCases = l.qty_cases ?? l.qty_ordered ?? 0;
              const unitsPerCase = l.units_per_case ?? 1;
              const qtyBase = qtyCases * unitsPerCase;

              const meta = lookupItem(itemMap, l.item_id);

              return (
                <tr key={l.id} className="border-t border-slate-100 align-top">
                  <td className="border border-slate-200 px-3 py-2">{l.line_no}</td>

                  <td className="border border-slate-200 px-3 py-2">
                    <div className="font-medium text-slate-900">{meta.name}</div>
                    <div className="mt-0.5 text-[12px] text-slate-400 font-mono">
                      ID：{l.item_id}
                    </div>
                  </td>

                  <td className="border border-slate-200 px-3 py-2 font-mono text-[12px] text-slate-700">
                    {meta.barcode}
                  </td>

                  <td className="border border-slate-200 px-3 py-2">{meta.brand}</td>
                  <td className="border border-slate-200 px-3 py-2">{meta.category}</td>

                  <td className="border border-slate-200 px-3 py-2">{l.spec_text ?? "-"}</td>
                  <td className="border border-slate-200 px-3 py-2">{l.base_uom ?? "-"}</td>
                  <td className="border border-slate-200 px-3 py-2">{l.purchase_uom ?? "-"}</td>

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
              <td colSpan={9} className="border border-slate-200 px-3 py-2 text-left">
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
