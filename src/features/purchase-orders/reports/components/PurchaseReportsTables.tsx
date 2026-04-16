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

const thBase = "px-3 py-2 text-left whitespace-nowrap";
const thNumBase = "px-3 py-2 text-right whitespace-nowrap";
const tdBase = "px-3 py-2 align-top";
const tdNumBase = "px-3 py-2 text-right font-mono align-top whitespace-nowrap";

function fmtDateTime(v: string | null | undefined): string {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return fmtText(v);
  return d.toLocaleString("zh-CN", { hour12: false });
}

function completionStatusBadge(v: string | null | undefined): React.ReactNode {
  const status = String(v ?? "").trim();

  switch (status) {
    case "NOT_RECEIVED":
      return (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
          未收货
        </span>
      );
    case "PARTIAL":
      return (
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
          部分收货
        </span>
      );
    case "RECEIVED":
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
          已收货
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
          {fmtText(status)}
        </span>
      );
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
                <th className={thBase}>商品</th>
                <th className={thBase}>SKU</th>
                <th className={thNumBase}>采购单数</th>
                <th className={thNumBase}>采购数量（辅助）</th>
                <th className={thNumBase}>最小单位数（硬口径）</th>
                <th className={thNumBase}>计划金额</th>
                <th className={thNumBase}>计划均价</th>
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
                        className="cursor-pointer border-b transition-colors hover:bg-slate-50"
                        onClick={() => {
                          void onToggleItemExpand(row.item_id);
                        }}
                      >
                        <td className={tdBase}>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">{isExpanded ? "▼" : "▶"}</span>
                            <span className="font-medium text-slate-900">
                              {fmtText(row.item_name)}
                            </span>
                          </div>
                        </td>
                        <td className={`${tdBase} font-mono`}>{fmtText(row.item_sku)}</td>
                        <td className={tdNumBase}>{row.order_count}</td>
                        <td className={tdNumBase}>{row.total_qty_cases}</td>
                        <td className={tdNumBase}>{row.total_units}</td>
                        <td className={tdNumBase}>{fmtMoney(row.total_amount)}</td>
                        <td className={tdNumBase}>{fmtMoney(row.avg_unit_price)}</td>
                      </tr>

                      {isExpanded ? (
                        <tr className="border-b bg-slate-50/70">
                          <td colSpan={7} className="px-4 py-4">
                            {detailLoading ? (
                              <div className="text-sm text-slate-500">明细加载中…</div>
                            ) : detailRows.length === 0 ? (
                              <div className="text-sm text-slate-500">
                                当前筛选范围下暂无采购明细。
                              </div>
                            ) : (
                              <div className="space-y-3 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                                  <div className="text-sm font-medium text-slate-900">
                                    采购明细
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    当前展开区按采购单行展示；金额均为计划金额。
                                  </div>
                                </div>

                                <div className="overflow-x-auto rounded-lg border border-slate-200">
                                  <table className="min-w-full text-sm border-collapse">
                                    <thead>
                                      <tr className="border-b text-slate-500">
                                        <th className={thBase}>采购单号</th>
                                        <th className={thNumBase}>行号</th>
                                        <th className={thBase}>采购时间</th>
                                        <th className={thNumBase}>仓库</th>
                                        {showDetailSupplierColumn ? (
                                          <th className={thBase}>供应商</th>
                                        ) : null}
                                        <th className={thBase}>采购单位</th>
                                        <th className={thNumBase}>采购数量（辅助）</th>
                                        <th className={thNumBase}>最小单位数（硬口径）</th>
                                        <th className={thNumBase}>计划单价</th>
                                        <th className={thNumBase}>折扣快照</th>
                                        <th className={thNumBase}>计划行金额</th>
                                        <th className={thBase}>完成状态</th>
                                        <th className={thBase}>最后收货时间</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {detailRows.map((detail) => (
                                        <tr
                                          key={detail.po_line_id}
                                          className="border-b last:border-b-0"
                                        >
                                          <td className={`${tdBase} font-mono`}>
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
                                          <td className={tdNumBase}>{detail.line_no}</td>
                                          <td className={tdBase}>
                                            {fmtDateTime(detail.purchase_time)}
                                          </td>
                                          <td className={tdNumBase}>{detail.warehouse_id}</td>
                                          {showDetailSupplierColumn ? (
                                            <td className={tdBase}>
                                              {fmtText(detail.supplier_name)}
                                            </td>
                                          ) : null}
                                          <td className={tdBase}>
                                            {fmtText(detail.purchase_uom_name_snapshot)}
                                          </td>
                                          <td className={tdNumBase}>{detail.qty_ordered_input}</td>
                                          <td className={tdNumBase}>{detail.qty_ordered_base}</td>
                                          <td className={tdNumBase}>
                                            {fmtMoney(detail.supply_price_snapshot)}
                                          </td>
                                          <td className={tdNumBase}>
                                            {fmtMoney(detail.discount_amount_snapshot)}
                                          </td>
                                          <td className={tdNumBase}>
                                            {fmtMoney(detail.planned_line_amount)}
                                          </td>
                                          <td className={tdBase}>
                                            {completionStatusBadge(
                                              detail.line_completion_status,
                                            )}
                                          </td>
                                          <td className={tdBase}>
                                            {fmtDateTime(detail.last_received_at)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
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
                <th className={thBase}>供应商</th>
                <th className={thNumBase}>采购单数</th>
                <th className={thNumBase}>采购数量（辅助）</th>
                <th className={thNumBase}>最小单位数（硬口径）</th>
                <th className={thNumBase}>计划金额</th>
                <th className={thNumBase}>计划均价</th>
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
                    <td className={tdBase}>{fmtText(row.supplier_name)}</td>
                    <td className={tdNumBase}>{row.order_count}</td>
                    <td className={tdNumBase}>{row.total_qty_cases}</td>
                    <td className={tdNumBase}>{row.total_units}</td>
                    <td className={tdNumBase}>{fmtMoney(row.total_amount)}</td>
                    <td className={tdNumBase}>{fmtMoney(row.avg_unit_price)}</td>
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
                <th className={thBase}>日期</th>
                <th className={thNumBase}>采购单数</th>
                <th className={thNumBase}>采购数量（辅助）</th>
                <th className={thNumBase}>最小单位数（硬口径）</th>
                <th className={thNumBase}>计划金额</th>
              </tr>
            </thead>
            <tbody>
              {dailyRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-slate-400">
                    {loading
                      ? "加载中…"
                      : "当前没有已收货数据，所以按最后收货日暂无结果；金额口径仍为计划金额。"}
                  </td>
                </tr>
              ) : (
                dailyRows.map((row) => (
                  <tr key={row.day} className="border-b last:border-b-0">
                    <td className={`${tdBase} font-mono`}>{row.day}</td>
                    <td className={tdNumBase}>{row.order_count}</td>
                    <td className={tdNumBase}>{row.total_qty_cases}</td>
                    <td className={tdNumBase}>{row.total_units}</td>
                    <td className={tdNumBase}>{fmtMoney(row.total_amount)}</td>
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
