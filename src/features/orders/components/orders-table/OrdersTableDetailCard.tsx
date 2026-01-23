// src/features/orders/components/orders-table/OrdersTableDetailCard.tsx
import React, { useMemo } from "react";
import type { OrderSummary } from "../../api/index";
import type { OrderWarehouseAvailabilityResponse } from "../../api/types";
import type { OrderFactsItem } from "./useOrdersTableDetail";
import { buildCellMap, lineLabel, scopeHint, whBriefLabel, whLabel } from "./utils";

export const OrdersTableDetailCard: React.FC<{
  selectedRow: OrderSummary;

  detailLoading: boolean;
  detailError: string | null;
  detailView: { order?: { platform: string; shop_id: string; ext_order_no: string } } | null;

  factsItems: OrderFactsItem[];
  totals: { ordered: number; shipped: number; returned: number; remaining: number };

  availLoading: boolean;
  availError: string | null;
  availResp: OrderWarehouseAvailabilityResponse | null;

  onClose: () => void;
}> = ({
  selectedRow,
  detailLoading,
  detailError,
  detailView,
  factsItems,
  totals,
  availLoading,
  availError,
  availResp,
  onClose,
}) => {
  const cellMap = useMemo(() => buildCellMap(availResp?.matrix || []), [availResp]);

  return (
    <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-[12px] font-semibold text-slate-800">
          当前订单：<span className="font-mono">{selectedRow.ext_order_no}</span>
        </div>
        <button
          type="button"
          className="rounded-md border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
          onClick={onClose}
        >
          关闭详情
        </button>
      </div>

      {detailLoading && <div className="mt-2 text-[11px] text-slate-500">正在加载订单详情…</div>}
      {detailError && <div className="mt-2 text-[11px] text-red-600">{detailError}</div>}

      {/* 履约对照 */}
      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex items-center justify-between">
          <div className="text-[12px] font-semibold text-slate-800">履约对照（仓库 × SKU 可售）</div>
          <div className="text-[11px] text-slate-500">{availResp ? scopeHint(availResp.scope) : "—"}</div>
        </div>

        {availLoading && <div className="mt-2 text-[11px] text-slate-500">正在加载对照数据…</div>}
        {availError && <div className="mt-2 text-[11px] text-red-600">{availError}</div>}

        {!availLoading && !availError && availResp && (
          <>
            {availResp.lines.length === 0 ? (
              <div className="mt-2 text-[11px] text-slate-500">该订单无有效行项目（req_qty ≤ 0）。</div>
            ) : availResp.warehouses.length === 0 ? (
              <div className="mt-2 text-[11px] text-slate-500">无可展示仓库（候选仓为空）。</div>
            ) : (
              <div className="mt-2 overflow-auto">
                <table className="min-w-full border-collapse text-[12px]">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="sticky left-0 z-10 w-[280px] border border-slate-200 bg-slate-50 px-2 py-1 text-left font-semibold text-slate-700">
                        SKU / 标题（或 item_id）
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right font-semibold text-slate-700">
                        需求
                      </th>
                      {availResp.warehouses.map((w) => (
                        <th
                          key={w.id}
                          className="border border-slate-200 px-2 py-1 text-left font-semibold text-slate-700"
                        >
                          {whBriefLabel(w)}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {availResp.lines.map((ln) => {
                      const iid = ln.item_id;
                      return (
                        <tr key={iid} className="hover:bg-slate-50">
                          <td className="sticky left-0 z-10 border border-slate-200 bg-white px-2 py-1 text-left text-slate-800">
                            {lineLabel(ln)}
                          </td>
                          <td className="border border-slate-200 px-2 py-1 text-right font-mono text-slate-800">
                            {ln.req_qty}
                          </td>

                          {availResp.warehouses.map((w) => {
                            const cell = cellMap.get(w.id)?.get(iid);
                            const status = (cell?.status ?? "").toUpperCase();
                            const shortage = Number(cell?.shortage ?? 0) || 0;
                            const available = Number(cell?.available ?? 0) || 0;

                            return (
                              <td key={`${w.id}-${iid}`} className="border border-slate-200 px-2 py-1">
                                {!cell ? (
                                  <span className="text-slate-400">—</span>
                                ) : (
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-mono text-slate-900">{available}</span>
                                    {status === "SHORTAGE" && shortage > 0 ? (
                                      <span className="rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[11px] font-medium text-red-700">
                                        缺 {shortage}
                                      </span>
                                    ) : (
                                      <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700">
                                        够
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* 订单行 */}
      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex items-center justify-between">
          <div className="text-[12px] font-semibold text-slate-800">订单行（下单 / 发货 / 退货 / 剩余可退）</div>
          <div className="text-[11px] text-slate-500">
            合计：下单 {totals.ordered} / 发货 {totals.shipped} / 退 {totals.returned} / 剩余可退 {totals.remaining}
          </div>
        </div>

        {!factsItems.length ? (
          <div className="mt-2 text-[11px] text-slate-500">暂无行信息（facts 为空）。</div>
        ) : (
          <div className="mt-2 overflow-auto">
            <table className="min-w-full border-collapse text-[12px]">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 px-2 py-1 text-left font-semibold text-slate-700">Item ID</th>
                  <th className="border border-slate-200 px-2 py-1 text-right font-semibold text-slate-700">下单</th>
                  <th className="border border-slate-200 px-2 py-1 text-right font-semibold text-slate-700">已发货</th>
                  <th className="border border-slate-200 px-2 py-1 text-right font-semibold text-slate-700">已退货</th>
                  <th className="border border-slate-200 px-2 py-1 text-right font-semibold text-slate-700">剩余可退</th>
                </tr>
              </thead>
              <tbody>
                {factsItems.map((f) => (
                  <tr key={String(f.item_id)} className="hover:bg-slate-50">
                    <td className="border border-slate-200 px-2 py-1 font-mono">{String(f.item_id)}</td>
                    <td className="border border-slate-200 px-2 py-1 text-right font-mono">{f.qty_ordered}</td>
                    <td className="border border-slate-200 px-2 py-1 text-right font-mono">{f.qty_shipped}</td>
                    <td className="border border-slate-200 px-2 py-1 text-right font-mono">{f.qty_returned}</td>
                    <td className="border border-slate-200 px-2 py-1 text-right font-mono">{f.qty_remaining_refundable}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detailView?.order && (
        <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-600">
          平台/店铺：{detailView.order.platform}/{detailView.order.shop_id} · 外部订单号：
          <span className="font-mono"> {detailView.order.ext_order_no}</span> · 默认仓库：
          <span className="font-mono"> {whLabel(selectedRow.service_warehouse_id)}</span> · 发货仓库：
          <span className="font-mono"> {whLabel(selectedRow.warehouse_id)}</span>
        </div>
      )}
    </div>
  );
};
