// 拆分说明：从 PurchaseReportsPage.tsx 抽出表格展示区；按商品视图改为“汇总行 + 展开 completion 明细”。路径：src/features/purchase-orders/reports/components/PurchaseReportsTables.tsx

import React from "react";
import type { ItemPurchaseReportLineItem } from "../api/reportsApi";
import type {
  DailyPurchaseReportItem,
  ItemPurchaseReportItem,
  ReportTab,
  SupplierPurchaseReportItem,
} from "../types";
import { fmtMoney, fmtText } from "../utils";

type Props = {
  tab: ReportTab;
  loading: boolean;
  itemsRows: ItemPurchaseReportItem[];
  supplierRows: SupplierPurchaseReportItem[];
  dailyRows: DailyPurchaseReportItem[];
  expandedItemId: number | null;
  itemLineRowsByItemId: Record<number, ItemPurchaseReportLineItem[]>;
  itemLineLoadingItemId: number | null;
  onToggleItemExpand: (itemId: number) => void | Promise<void>;
  supplierIdFilter: string;
  onOpenPurchaseOrder: (poId: number) => void;
};

function fmtDateTime(v: string | null | undefined): string {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return fmtText(v);
  return d.toLocaleString("zh-CN", { hour12: false });
}

function completionStatusText(v: string | null | undefined): string {
  switch (String(v ?? "").trim()) {
    case "NOT_RECEIVED":
      return "未收货";
    case "PARTIAL":
      return "部分收货";
    case "RECEIVED":
      return "已收货";
    default:
      return fmtText(v);
  }
}

const PurchaseReportsTables: React.FC<Props> = ({
  tab,
  loading,
  itemsRows,
  supplierRows,
  dailyRows,
  expandedItemId,
  itemLineRowsByItemId,
  itemLineLoadingItemId,
  onToggleItemExpand,
  supplierIdFilter,
  onOpenPurchaseOrder,
}) => {
  const showDetailSupplierColumn = supplierIdFilter.trim() === "";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {tab === "items" ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-slate-600">
                <th className="px-3 py-2 text-left">商品</th>
                <th className="px-3 py-2 text-left">SKU</th>
                <th className="px-3 py-2 text-right">采购单数</th>
                <th className="px-3 py-2 text-right">采购数量</th>
                <th className="px-3 py-2 text-right">最小单位数</th>
                <th className="px-3 py-2 text-right">金额</th>
                <th className="px-3 py-2 text-right">均价</th>
              </tr>
            </thead>
            <tbody>
              {itemsRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-slate-400">
                    {loading ? "加载中…" : "暂无数据"}
                  </td>
                </tr>
              ) : (
                itemsRows.map((row, idx) => {
                  const isExpanded = expandedItemId === row.item_id;
                  const detailRows = itemLineRowsByItemId[row.item_id] ?? [];
                  const detailLoading = itemLineLoadingItemId === row.item_id;

                  return (
                    <React.Fragment key={`${row.item_id}-${idx}`}>
                      <tr
                        className="cursor-pointer border-b hover:bg-slate-50"
                        onClick={() => {
                          void onToggleItemExpand(row.item_id);
                        }}
                      >
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">{isExpanded ? "▼" : "▶"}</span>
                            <span>{fmtText(row.item_name)}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 font-mono">{fmtText(row.item_sku)}</td>
                        <td className="px-3 py-2 text-right font-mono">{row.order_count}</td>
                        <td className="px-3 py-2 text-right font-mono">{row.total_qty_cases}</td>
                        <td className="px-3 py-2 text-right font-mono">{row.total_units}</td>
                        <td className="px-3 py-2 text-right font-mono">
                          {fmtMoney(row.total_amount)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {fmtMoney(row.avg_unit_price)}
                        </td>
                      </tr>

                      {isExpanded ? (
                        <tr className="border-b bg-slate-50">
                          <td colSpan={7} className="px-4 py-4">
                            {detailLoading ? (
                              <div className="text-sm text-slate-500">明细加载中…</div>
                            ) : detailRows.length === 0 ? (
                              <div className="text-sm text-slate-500">当前筛选范围下暂无采购明细。</div>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="min-w-full text-sm border-collapse">
                                  <thead>
                                    <tr className="border-b text-slate-500">
                                      <th className="px-3 py-2 text-left">采购单号</th>
                                      <th className="px-3 py-2 text-right">行号</th>
                                      <th className="px-3 py-2 text-left">采购时间</th>
                                      <th className="px-3 py-2 text-right">仓库</th>
                                      {showDetailSupplierColumn ? (
                                        <th className="px-3 py-2 text-left">供应商</th>
                                      ) : null}
                                      <th className="px-3 py-2 text-left">采购单位</th>
                                      <th className="px-3 py-2 text-right">采购数量</th>
                                      <th className="px-3 py-2 text-right">最小单位数</th>
                                      <th className="px-3 py-2 text-right">单价</th>
                                      <th className="px-3 py-2 text-right">折扣</th>
                                      <th className="px-3 py-2 text-right">行总价</th>
                                      <th className="px-3 py-2 text-left">状态</th>
                                      <th className="px-3 py-2 text-left">最后收货时间</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {detailRows.map((detail) => (
                                      <tr
                                        key={detail.po_line_id}
                                        className="border-b last:border-b-0"
                                      >
                                        <td className="px-3 py-2 font-mono">
                                          <button
                                            type="button"
                                            className="text-indigo-600 hover:text-indigo-700 hover:underline"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onOpenPurchaseOrder(detail.po_id);
                                            }}
                                          >
                                            {detail.po_no}
                                          </button>
                                        </td>
                                        <td className="px-3 py-2 text-right font-mono">
                                          {detail.line_no}
                                        </td>
                                        <td className="px-3 py-2">{fmtDateTime(detail.purchase_time)}</td>
                                        <td className="px-3 py-2 text-right font-mono">
                                          {detail.warehouse_id}
                                        </td>
                                        {showDetailSupplierColumn ? (
                                          <td className="px-3 py-2">
                                            {fmtText(detail.supplier_name)}
                                          </td>
                                        ) : null}
                                        <td className="px-3 py-2">
                                          {fmtText(detail.purchase_uom_name_snapshot)}
                                        </td>
                                        <td className="px-3 py-2 text-right font-mono">
                                          {detail.qty_ordered_input}
                                        </td>
                                        <td className="px-3 py-2 text-right font-mono">
                                          {detail.qty_ordered_base}
                                        </td>
                                        <td className="px-3 py-2 text-right font-mono">
                                          {fmtMoney(detail.supply_price_snapshot)}
                                        </td>
                                        <td className="px-3 py-2 text-right font-mono">
                                          {fmtMoney(detail.discount_amount_snapshot)}
                                        </td>
                                        <td className="px-3 py-2 text-right font-mono">
                                          {fmtMoney(detail.planned_line_amount)}
                                        </td>
                                        <td className="px-3 py-2">
                                          {completionStatusText(detail.line_completion_status)}
                                        </td>
                                        <td className="px-3 py-2">
                                          {fmtDateTime(detail.last_received_at)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </td>
                        </tr>
                      ) : null}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "suppliers" ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-slate-600">
                <th className="px-3 py-2 text-left">供应商</th>
                <th className="px-3 py-2 text-right">采购单数</th>
                <th className="px-3 py-2 text-right">采购数量</th>
                <th className="px-3 py-2 text-right">最小单位数</th>
                <th className="px-3 py-2 text-right">金额</th>
                <th className="px-3 py-2 text-right">均价</th>
              </tr>
            </thead>
            <tbody>
              {supplierRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-slate-400">
                    {loading ? "加载中…" : "暂无数据"}
                  </td>
                </tr>
              ) : (
                supplierRows.map((row, idx) => (
                  <tr key={`${row.supplier_id ?? "na"}-${idx}`} className="border-b last:border-b-0">
                    <td className="px-3 py-2">{fmtText(row.supplier_name)}</td>
                    <td className="px-3 py-2 text-right font-mono">{row.order_count}</td>
                    <td className="px-3 py-2 text-right font-mono">{row.total_qty_cases}</td>
                    <td className="px-3 py-2 text-right font-mono">{row.total_units}</td>
                    <td className="px-3 py-2 text-right font-mono">
                      {fmtMoney(row.total_amount)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {fmtMoney(row.avg_unit_price)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "daily" ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-slate-600">
                <th className="px-3 py-2 text-left">日期</th>
                <th className="px-3 py-2 text-right">采购单数</th>
                <th className="px-3 py-2 text-right">采购数量</th>
                <th className="px-3 py-2 text-right">最小单位数</th>
                <th className="px-3 py-2 text-right">金额</th>
              </tr>
            </thead>
            <tbody>
              {dailyRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-slate-400">
                    {loading
                      ? "加载中…"
                      : "当前没有已收货数据，所以按最后收货日暂无结果"}
                  </td>
                </tr>
              ) : (
                dailyRows.map((row) => (
                  <tr key={row.day} className="border-b last:border-b-0">
                    <td className="px-3 py-2 font-mono">{row.day}</td>
                    <td className="px-3 py-2 text-right font-mono">{row.order_count}</td>
                    <td className="px-3 py-2 text-right font-mono">{row.total_qty_cases}</td>
                    <td className="px-3 py-2 text-right font-mono">{row.total_units}</td>
                    <td className="px-3 py-2 text-right font-mono">
                      {fmtMoney(row.total_amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
};

export default PurchaseReportsTables;
