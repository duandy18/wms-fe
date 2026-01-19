// src/features/orders/components/OrderInlineDetailPanel.tsx
import React, { useMemo } from "react";
import type { OrderFacts, OrderSummary, OrderView } from "../api";
import { formatTs, renderStatus } from "../ui/format";

export const OrderInlineDetailPanel: React.FC<{
  selectedSummary: OrderSummary;
  selectedView: OrderView | null;
  selectedFacts: OrderFacts | null;
  detailLoading: boolean;
  detailError: string | null;
  onClose: () => void;

  // ⚠️ 为兼容调用方保留，但本面板不再展示 DevConsole 入口
  devConsoleHref: () => string;
}> = ({
  selectedSummary,
  selectedView,
  selectedFacts,
  detailLoading,
  detailError,
  onClose,
  devConsoleHref: _devConsoleHref,
}) => {
  // ✅ 显式标记为“已使用”，避免 eslint no-unused-vars
  void _devConsoleHref;

  const detailOrder = selectedView?.order ?? null;
  const facts = useMemo(() => selectedFacts?.items ?? [], [selectedFacts]);

  const totals = useMemo(() => {
    if (!facts.length) return { ordered: 0, shipped: 0, returned: 0, remaining: 0 };
    return facts.reduce(
      (acc, f) => {
        acc.ordered += f.qty_ordered;
        acc.shipped += f.qty_shipped;
        acc.returned += f.qty_returned;
        acc.remaining += f.qty_remaining_refundable;
        return acc;
      },
      { ordered: 0, shipped: 0, returned: 0, remaining: 0 },
    );
  }, [facts]);

  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            订单详情（当前选中）
          </h2>
          <div className="text-xs text-slate-500">
            {selectedSummary.platform}/{selectedSummary.shop_id} ·{" "}
            <span className="font-mono text-[11px]">
              {selectedSummary.ext_order_no}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300 px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
          >
            关闭详情
          </button>
        </div>
      </div>

      {detailLoading && (
        <div className="text-xs text-slate-500">正在加载订单详情…</div>
      )}
      {detailError && (
        <div className="text-xs text-red-600">{detailError}</div>
      )}

      {detailOrder && (
        <>
          <div className="grid grid-cols-1 gap-y-2 text-xs md:grid-cols-3 md:gap-x-8">
            <div>
              <div className="text-[11px] text-slate-500">平台 / 店铺</div>
              <div>
                {detailOrder.platform}/{detailOrder.shop_id}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500">外部订单号</div>
              <div className="font-mono text-[11px]">
                {detailOrder.ext_order_no}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500">状态</div>
              <div>{renderStatus(detailOrder.status)}</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500">仓库 ID</div>
              <div>{detailOrder.warehouse_id ?? "-"}</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500">金额 / 实付</div>
              <div className="font-mono text-[11px]">
                {detailOrder.order_amount ?? "-"} /{" "}
                {detailOrder.pay_amount ?? "-"}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500">创建时间</div>
              <div>{formatTs(detailOrder.created_at)}</div>
            </div>
          </div>

          {facts.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-700">
                  行事实（下单 / 发货 / 退货 / 剩余可退）
                </h3>
                <div className="text-[11px] text-slate-500">
                  共 {facts.length} 行 · 合计：下单 {totals.ordered} / 发货{" "}
                  {totals.shipped} / 退货 {totals.returned} / 可退{" "}
                  {totals.remaining}
                </div>
              </div>

              <div className="overflow-x-auto rounded-md border border-slate-200">
                <table className="min-w-full text-[11px]">
                  <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600">
                    <tr>
                      <th className="px-2 py-1 text-left">Item ID</th>
                      <th className="px-2 py-1 text-left">标题</th>
                      <th className="px-2 py-1 text-right">下单</th>
                      <th className="px-2 py-1 text-right">已发货</th>
                      <th className="px-2 py-1 text-right">已退货</th>
                      <th className="px-2 py-1 text-right">剩余可退</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facts.map((f) => (
                      <tr key={f.item_id} className="border-t border-slate-100">
                        <td className="px-2 py-1 font-mono text-[11px]">
                          {f.item_id}
                        </td>
                        <td className="px-2 py-1">
                          {f.title ?? f.sku_id ?? "-"}
                        </td>
                        <td className="px-2 py-1 text-right">
                          {f.qty_ordered}
                        </td>
                        <td className="px-2 py-1 text-right">
                          {f.qty_shipped}
                        </td>
                        <td className="px-2 py-1 text-right">
                          {f.qty_returned}
                        </td>
                        <td className="px-2 py-1 text-right">
                          <span
                            className={
                              f.qty_remaining_refundable > 0
                                ? "font-semibold text-emerald-700"
                                : "text-slate-500"
                            }
                          >
                            {f.qty_remaining_refundable}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};
